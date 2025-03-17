from django.contrib import admin
from .models import Trip, RoutePoint, ELDLog

@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('id', 'current_location', 'pickup_location', 'dropoff_location', 'created_at')
    search_fields = ('current_location', 'pickup_location', 'dropoff_location')

@admin.register(RoutePoint)
class RoutePointAdmin(admin.ModelAdmin):
    list_display = ('id', 'trip', 'point_type', 'location', 'arrival_time', 'departure_time')
    list_filter = ('point_type',)
    search_fields = ('location',)

@admin.register(ELDLog)
class ELDLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'trip', 'log_date', 'starting_location', 'ending_location')
    list_filter = ('log_date',)
    search_fields = ('starting_location', 'ending_location')