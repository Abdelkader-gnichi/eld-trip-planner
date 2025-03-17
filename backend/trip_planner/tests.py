from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from .models import Trip, RoutePoint, ELDLog

class TripAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
    
    def test_create_trip(self):
        url = reverse('trip-list')
        data = {
            'current_location': 'Los Angeles, CA',
            'pickup_location': 'Phoenix, AZ',
            'dropoff_location': 'Dallas, TX',
            'current_cycle_hours': 2.5
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify trip was created
        self.assertEqual(Trip.objects.count(), 1)
        
        # Verify route points were created
        trip = Trip.objects.first()
        route_points = RoutePoint.objects.filter(trip=trip)
        self.assertTrue(route_points.exists())
        
        # Verify ELD logs were created
        eld_logs = ELDLog.objects.filter(trip=trip)
        self.assertTrue(eld_logs.exists())