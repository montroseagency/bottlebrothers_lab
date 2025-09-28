# server/api/views.py - ENHANCED VERSION
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Count, Q
from django.core.exceptions import ValidationError
from datetime import datetime, timedelta, date, time
import json

from api.models import (GalleryItem)
from server.api.serializers import (GalleryItemSerializer, PublicGalleryItemSerializer)
class GalleryItemViewSet(viewsets.ModelViewSet):
    queryset = GalleryItem.objects.all()
    serializer_class = GalleryItemSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def get_permissions(self):
        """Public access for list/retrieve, admin only for create/update/delete"""
        if self.action in ['list', 'retrieve', 'public', 'categories']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filter queryset based on action and permissions"""
        if self.action in ['list', 'retrieve'] and not self.request.user.is_authenticated:
            # Public access - only show active items
            return GalleryItem.objects.filter(is_active=True)
        return GalleryItem.objects.all()
    
    def get_serializer_class(self):
        """Use different serializer for public access"""
        if self.action in ['public'] or not self.request.user.is_authenticated:
            return PublicGalleryItemSerializer
        return GalleryItemSerializer
    
    def list(self, request):
        """List gallery items with filtering options"""
        queryset = self.get_queryset()
        
        # Filter by category
        category = request.query_params.get('category')
        if category and category != 'all':
            queryset = queryset.filter(category=category)
        
        # Filter by featured status
        featured = request.query_params.get('featured')
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)
        
        # Order by display_order and creation date
        queryset = queryset.order_by('display_order', '-created_at')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def public(self, request):
        """Get public gallery items"""
        queryset = GalleryItem.objects.filter(is_active=True)
        
        # Filter by category
        category = request.query_params.get('category')
        if category and category != 'all':
            queryset = queryset.filter(category=category)
        
        # Filter by featured status
        featured = request.query_params.get('featured')
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)
        
        # Order by featured first, then display order
        queryset = queryset.order_by('-is_featured', 'display_order', '-created_at')
        
        serializer = PublicGalleryItemSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get available categories with counts"""
        categories = GalleryItem.objects.filter(
            is_active=True
        ).values('category').annotate(
            count=Count('id')
        ).order_by('category')
        
        category_data = []
        for category in categories:
            display_name = dict(GalleryItem.CATEGORY_CHOICES).get(
                category['category'], 
                category['category']
            )
            category_data.append({
                'value': category['category'],
                'label': display_name,
                'count': category['count']
            })
        
        return Response(category_data)
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def toggle_featured(self, request, pk=None):
        """Toggle featured status of gallery item"""
        try:
            item = self.get_object()
            item.is_featured = not item.is_featured
            item.save()
            
            serializer = self.get_serializer(item)
            return Response(serializer.data)
            
        except GalleryItem.DoesNotExist:
            return Response(
                {'detail': 'Gallery item not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def toggle_active(self, request, pk=None):
        """Toggle active status of gallery item"""
        try:
            item = self.get_object()
            item.is_active = not item.is_active
            item.save()
            
            serializer = self.get_serializer(item)
            return Response(serializer.data)
            
        except GalleryItem.DoesNotExist:
            return Response(
                {'detail': 'Gallery item not found'},
                status=status.HTTP_404_NOT_FOUND
            )