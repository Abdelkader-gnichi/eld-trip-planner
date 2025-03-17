import requests
import datetime
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
from django.utils import timezone
from .models import Trip, RoutePoint, ELDLog

class RouteCalculator:
    def __init__(self, trip):
        self.trip = trip
        self.geolocator = Nominatim(user_agent="eld_trip_planner")
        self.average_speed = 55  # mph, average truck speed
        self.driving_limit = 11  # hours
        self.duty_limit = 14     # hours
        self.break_after = 8     # hours, need 30 min break after
        self.rest_period = 10    # hours, minimum off-duty time between shifts
        self.fuel_distance = 800  # miles, refuel every this many miles
        self.pickup_dropoff_time = 60  # minutes, for pickup and dropoff
        
    def geocode(self, location):
        """Convert address string to lat/lng coordinates"""
        try:
            loc = self.geolocator.geocode(location)
            return (loc.latitude, loc.longitude) if loc else (0, 0)
        except Exception as e:
            print(f"Geocoding error: {e}")
            return (0, 0)
    
    def calculate_route(self):
        """Calculate the complete route with stops"""
        # Get coordinates for locations
        start_coords = self.geocode(self.trip.current_location)
        pickup_coords = self.geocode(self.trip.pickup_location)
        dropoff_coords = self.geocode(self.trip.dropoff_location)
        
        # Calculate distances
        distance_to_pickup = geodesic(start_coords, pickup_coords).miles
        distance_pickup_to_dropoff = geodesic(pickup_coords, dropoff_coords).miles
        total_distance = distance_to_pickup + distance_pickup_to_dropoff
        
        # Calculate basic driving time (without breaks)
        time_to_pickup = distance_to_pickup / self.average_speed
        time_pickup_to_dropoff = distance_pickup_to_dropoff / self.average_speed
        
        # Starting time and current cycle hours
        # Use timezone-aware datetime
        now = timezone.now()
        remaining_drive_time = self.driving_limit - self.trip.current_cycle_hours
        
        # Create route points
        route_points = []
        
        # Starting point
        route_points.append({
            'point_type': 'START',
            'location': self.trip.current_location,
            'latitude': start_coords[0],
            'longitude': start_coords[1],
            'arrival_time': now,
            'departure_time': now,
            'duration': 0
        })
        
        # Current position in time and space
        current_time = now
        current_position = start_coords
        distance_covered = 0
        last_break_time = 0  # Time since last 30-min break
        
        # First leg: to pickup
        while distance_covered < distance_to_pickup:
            # Calculate how far we can go before next required stop
            remaining_distance = distance_to_pickup - distance_covered
            time_needed = remaining_distance / self.average_speed
            
            # Check if we need a break before pickup
            if last_break_time + time_needed > self.break_after and remaining_distance > 50:
                # Calculate where to take break
                break_distance = (self.break_after - last_break_time) * self.average_speed
                break_position = self.interpolate_position(current_position, pickup_coords, break_distance / remaining_distance)
                
                # Add break stop
                current_time += datetime.timedelta(hours=self.break_after - last_break_time)
                distance_covered += break_distance
                current_position = break_position
                
                route_points.append({
                    'point_type': 'REST',
                    'location': f"Rest stop near {self.trip.current_location}",
                    'latitude': break_position[0],
                    'longitude': break_position[1],
                    'arrival_time': current_time,
                    'departure_time': current_time + datetime.timedelta(minutes=30),
                    'duration': 30
                })
                
                current_time += datetime.timedelta(minutes=30)
                last_break_time = 0
            else:
                # We can make it to pickup
                current_time += datetime.timedelta(hours=time_needed)
                distance_covered = distance_to_pickup
                current_position = pickup_coords
                last_break_time += time_needed
        
        # Pickup stop
        route_points.append({
            'point_type': 'PICKUP',
            'location': self.trip.pickup_location,
            'latitude': pickup_coords[0],
            'longitude': pickup_coords[1],
            'arrival_time': current_time,
            'departure_time': current_time + datetime.timedelta(minutes=self.pickup_dropoff_time),
            'duration': self.pickup_dropoff_time
        })
        
        current_time += datetime.timedelta(minutes=self.pickup_dropoff_time)
        
        # Second leg: pickup to dropoff with potential breaks and fuel stops
        distance_covered = 0
        
        while distance_covered < distance_pickup_to_dropoff:
            # Calculate how far until next required stop (break, fuel, or end)
            remaining_distance = distance_pickup_to_dropoff - distance_covered
            time_needed = remaining_distance / self.average_speed
            
            # Check if we need a break
            need_break = last_break_time + time_needed > self.break_after and remaining_distance > 50
            
            # Check if we need fuel
            distance_since_fuel = distance_covered if len(route_points) <= 2 else distance_covered + distance_to_pickup
            need_fuel = distance_since_fuel > self.fuel_distance and remaining_distance > 50
            
            if need_break or need_fuel:
                # Calculate distance to next stop
                stop_distance = min(
                    (self.break_after - last_break_time) * self.average_speed if need_break else float('inf'),
                    (self.fuel_distance - distance_since_fuel) + 50 if need_fuel else float('inf')
                )
                
                stop_position = self.interpolate_position(
                    current_position, 
                    dropoff_coords, 
                    stop_distance / remaining_distance
                )
                
                # Drive to the stop
                drive_time = stop_distance / self.average_speed
                current_time += datetime.timedelta(hours=drive_time)
                distance_covered += stop_distance
                current_position = stop_position
                
                # Add the stop
                if need_fuel:
                    route_points.append({
                        'point_type': 'FUEL',
                        'location': f"Fuel stop near {self.get_nearest_city(stop_position)}",
                        'latitude': stop_position[0],
                        'longitude': stop_position[1],
                        'arrival_time': current_time,
                        'departure_time': current_time + datetime.timedelta(minutes=45),
                        'duration': 45
                    })
                    current_time += datetime.timedelta(minutes=45)
                    
                if need_break:
                    route_points.append({
                        'point_type': 'REST',
                        'location': f"Rest stop near {self.get_nearest_city(stop_position)}",
                        'latitude': stop_position[0],
                        'longitude': stop_position[1],
                        'arrival_time': current_time,
                        'departure_time': current_time + datetime.timedelta(minutes=30),
                        'duration': 30
                    })
                    current_time += datetime.timedelta(minutes=30)
                    last_break_time = 0
                else:
                    last_break_time += drive_time
            else:
                # We can make it to dropoff
                current_time += datetime.timedelta(hours=time_needed)
                distance_covered = distance_pickup_to_dropoff
                current_position = dropoff_coords
                last_break_time += time_needed
        
        # Dropoff point
        route_points.append({
            'point_type': 'DROPOFF',
            'location': self.trip.dropoff_location,
            'latitude': dropoff_coords[0],
            'longitude': dropoff_coords[1],
            'arrival_time': current_time,
            'departure_time': current_time + datetime.timedelta(minutes=self.pickup_dropoff_time),
            'duration': self.pickup_dropoff_time
        })
        
        # Save route points to the database
        saved_points = []
        for point in route_points:
            route_point = RoutePoint.objects.create(
                trip=self.trip,
                point_type=point['point_type'],
                location=point['location'],
                latitude=point['latitude'],
                longitude=point['longitude'],
                arrival_time=point['arrival_time'],
                departure_time=point['departure_time'],
                duration=point['duration']
            )
            saved_points.append(route_point)
        
        return saved_points
    
    def interpolate_position(self, start, end, fraction):
        """Calculate a position along a straight line between start and end"""
        return (
            start[0] + (end[0] - start[0]) * fraction,
            start[1] + (end[1] - start[1]) * fraction
        )
    
    def get_nearest_city(self, coords):
        try:
            location = self.geolocator.reverse(f"{coords[0]}, {coords[1]}")
            if location is None:
                return "Unknown location"
            address = location.raw.get('address', {})
            city = address.get('city') or address.get('town') or address.get('village') or "Unknown location"
            state = address.get('state') or ""
            return f"{city}, {state}" if state else city
        except Exception as e:
            print(f"Reverse geocoding error: {e}")
            return "Unknown location"



class ELDGenerator:
    def __init__(self, trip):
        self.trip = trip
        
    def generate_logs(self):
        """Generate ELD logs for the entire trip"""
        route_points = RoutePoint.objects.filter(trip=self.trip).order_by('arrival_time')
        
        if not route_points:
            return []
        
        # Group route points by day
        days = {}
        
        for point in route_points:
            # Ensure datetime objects are timezone-aware
            if point.arrival_time and timezone.is_naive(point.arrival_time):
                point.arrival_time = timezone.make_aware(point.arrival_time)
            
            if point.departure_time and timezone.is_naive(point.departure_time):
                point.departure_time = timezone.make_aware(point.departure_time)
            
            day = point.arrival_time.date()
            if day not in days:
                days[day] = []
            days[day].append(point)
            
            # If departure is on a different day, add to that day too
            if point.departure_time and point.departure_time.date() != day:
                departure_day = point.departure_time.date()
                if departure_day not in days:
                    days[departure_day] = []
                days[departure_day].append(point)
        
        # Generate logs for each day
        logs = []
        
        for day, points in sorted(days.items()):
            # Create log for this day
            log = ELDLog.objects.create(
                trip=self.trip,
                log_date=day,
                starting_location=points[0].location,
                ending_location=points[-1].location,
                off_duty_periods=[],
                sleeper_berth_periods=[],
                driving_periods=[],
                on_duty_periods=[]
            )
            
            # Fill in activity periods
            current_time = timezone.make_aware(
                datetime.datetime.combine(day, datetime.time.min)
            )
            end_time = timezone.make_aware(
                datetime.datetime.combine(day, datetime.time.max)
            )
            
            for i, point in enumerate(points):
                # Skip if arrival is on a different day
                if point.arrival_time.date() != day:
                    continue
                
                # Driving time to this point (if not first point of trip)
                if i > 0 and points[i-1].departure_time:
                    prev_departure = max(points[i-1].departure_time, current_time)
                    drive_start = prev_departure.strftime("%H:%M")
                    drive_end = point.arrival_time.strftime("%H:%M")
                    
                    if drive_start != drive_end:
                        log.driving_periods.append([drive_start, drive_end])
                
                # Activity at this point
                if point.point_type in ['PICKUP', 'DROPOFF']:
                    # On duty for pickup/dropoff
                    duty_start = point.arrival_time.strftime("%H:%M")
                    duty_end = (point.departure_time or point.arrival_time).strftime("%H:%M")
                    if duty_start != duty_end:
                        log.on_duty_periods.append([duty_start, duty_end])
                
                elif point.point_type == 'FUEL':
                    # On duty for fueling
                    duty_start = point.arrival_time.strftime("%H:%M")
                    duty_end = (point.departure_time or point.arrival_time).strftime("%H:%M")
                    if duty_start != duty_end:
                        log.on_duty_periods.append([duty_start, duty_end])
                
                elif point.point_type == 'REST':
                    # Off duty for breaks
                    rest_start = point.arrival_time.strftime("%H:%M")
                    rest_end = (point.departure_time or point.arrival_time).strftime("%H:%M")
                    if rest_start != rest_end:
                        log.off_duty_periods.append([rest_start, rest_end])
                
                # Fix the comparison of datetimes here
                if point.departure_time:
                    current_time = max(current_time, point.departure_time)
                else:
                    current_time = max(current_time, point.arrival_time)
            
            # Fill in off-duty time at beginning and end of day if needed
            start_of_day = datetime.time.min.strftime("%H:%M")
            first_activity_start = log.driving_periods[0][0] if log.driving_periods else (
                log.on_duty_periods[0][0] if log.on_duty_periods else None
            )
            
            if first_activity_start and first_activity_start != start_of_day:
                log.off_duty_periods.append([start_of_day, first_activity_start])
            
            end_of_day = datetime.time.max.strftime("%H:%M")
            last_activity_end = log.driving_periods[-1][1] if log.driving_periods else (
                log.on_duty_periods[-1][1] if log.on_duty_periods else (
                    log.off_duty_periods[-1][1] if log.off_duty_periods else None
                )
            )
            
            if last_activity_end and last_activity_end != end_of_day:
                log.off_duty_periods.append([last_activity_end, end_of_day])
            
            log.save()
            logs.append(log)
        
        return logs