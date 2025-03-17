from rest_framework import serializers
from .models import Trip, RoutePoint, ELDLog

class RoutePointSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoutePoint
        fields = ['id', 'point_type', 'location', 'latitude', 'longitude', 
                'arrival_time', 'departure_time', 'duration']

class ELDLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ELDLog
        fields = ['id', 'log_date', 'off_duty_periods', 'sleeper_berth_periods',
                'driving_periods', 'on_duty_periods', 'starting_location', 'ending_location']

class TripSerializer(serializers.ModelSerializer):
    route_points = RoutePointSerializer(many=True, read_only=True)
    eld_logs = ELDLogSerializer(many=True, read_only=True)
    
    class Meta:
        model = Trip
        fields = ['id', 'current_location', 'pickup_location', 'dropoff_location', 
                'current_cycle_hours', 'created_at', 'route_points', 'eld_logs']
        read_only_fields = ['id', 'created_at', 'route_points', 'eld_logs']