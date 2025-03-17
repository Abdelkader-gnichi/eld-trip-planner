from django.db import models
import uuid
from django.core.exceptions import ValidationError
from django.utils import timezone

class Trip(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    current_location = models.CharField(max_length=255)
    pickup_location = models.CharField(max_length=255)
    dropoff_location = models.CharField(max_length=255)
    current_cycle_hours = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Trip from {self.current_location} to {self.dropoff_location}"

class PointType(models.TextChoices):
    START = 'START', 'Start'
    PICKUP = 'PICKUP', 'Pickup'
    REST = 'REST', 'Rest'
    FUEL = 'FUEL', 'Fuel'
    DROPOFF = 'DROPOFF', 'Dropoff'

class RoutePoint(models.Model):
    trip = models.ForeignKey(Trip, related_name='route_points', on_delete=models.CASCADE)
    point_type = models.CharField(max_length=20, choices=PointType.choices)
    location = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    arrival_time = models.DateTimeField()
    departure_time = models.DateTimeField(null=True, blank=True)
    duration = models.IntegerField(default=0)  # Duration in minutes

    class Meta:
        indexes = [
            models.Index(fields=['trip']),
        ]

    def clean(self):
        if self.departure_time and self.departure_time < self.arrival_time:
            raise ValidationError("Departure time cannot be earlier than arrival time.")

    def __str__(self):
        return f"{self.point_type} at {self.location}"

class ELDLog(models.Model):
    trip = models.ForeignKey(Trip, related_name='eld_logs', on_delete=models.CASCADE)
    log_date = models.DateField()
    off_duty_periods = models.JSONField(default=list)
    sleeper_berth_periods = models.JSONField(default=list)
    driving_periods = models.JSONField(default=list)
    on_duty_periods = models.JSONField(default=list)
    starting_location = models.CharField(max_length=255)
    ending_location = models.CharField(max_length=255)

    class Meta:
        indexes = [
            models.Index(fields=['trip']),
        ]

    def __str__(self):
        return f"ELD Log for {self.trip.id} on {self.log_date}"
