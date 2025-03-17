from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Trip, RoutePoint, ELDLog
from .serializers import TripSerializer, RoutePointSerializer, ELDLogSerializer
from .services import RouteCalculator, ELDGenerator

class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        trip = serializer.save()
        
        # Calculate route
        route_calculator = RouteCalculator(trip)
        route_points = route_calculator.calculate_route()
        
        # Generate ELD logs
        eld_generator = ELDGenerator(trip)
        eld_logs = eld_generator.generate_logs()
        
        # Return complete trip data
        return Response(self.get_serializer(trip).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def route(self, request, pk=None):
        trip = self.get_object()
        route_points = RoutePoint.objects.filter(trip=trip).order_by('arrival_time')
        serializer = RoutePointSerializer(route_points, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def logs(self, request, pk=None):
        trip = self.get_object()
        eld_logs = ELDLog.objects.filter(trip=trip).order_by('log_date')
        serializer = ELDLogSerializer(eld_logs, many=True)
        return Response(serializer.data)