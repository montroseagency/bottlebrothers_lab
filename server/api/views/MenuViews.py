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

from api.models import MenuCategory, MenuItem, MenuItemVariant
from api.serializers import (
    MenuCategorySerializer, PublicMenuCategorySerializer,
    MenuItemSerializer, PublicMenuItemSerializer,
    MenuItemVariantSerializer, SubcategorySerializer
)


class MenuCategoryViewSet(viewsets.ModelViewSet):
    queryset = MenuCategory.objects.all()
    serializer_class = MenuCategorySerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_permissions(self):
        """Public access for list/retrieve, admin only for create/update/delete"""
        if self.action in ['list', 'retrieve', 'public', 'main_categories', 'subcategories']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """Filter queryset based on action and permissions"""
        if self.action in ['list', 'retrieve'] and not self.request.user.is_authenticated:
            return MenuCategory.objects.filter(is_active=True)
        return MenuCategory.objects.all()

    def get_serializer_class(self):
        """Use different serializer for public access"""
        if self.action in ['public'] or not self.request.user.is_authenticated:
            return PublicMenuCategorySerializer
        return MenuCategorySerializer

    def list(self, request):
        """List menu categories with optional filtering"""
        queryset = self.get_queryset()

        # Filter by parent (null for top-level, or specific parent_id for subcategories)
        parent_param = request.query_params.get('parent')
        if parent_param == 'null' or parent_param == '':
            # Get only top-level categories (no parent)
            queryset = queryset.filter(parent__isnull=True)
        elif parent_param:
            # Get subcategories of specific parent
            queryset = queryset.filter(parent__id=parent_param)

        # Filter by category type
        category_type = request.query_params.get('category_type')
        if category_type:
            queryset = queryset.filter(category_type=category_type)

        queryset = queryset.order_by('display_order', 'name')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def main_categories(self, request):
        """Get only top-level categories (for admin dropdown)"""
        queryset = MenuCategory.objects.filter(parent__isnull=True)
        if not request.user.is_authenticated:
            queryset = queryset.filter(is_active=True)
        queryset = queryset.order_by('display_order', 'name')
        serializer = MenuCategorySerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def subcategories(self, request, pk=None):
        """Get subcategories of a specific category"""
        try:
            category = MenuCategory.objects.get(pk=pk)
            queryset = category.subcategories.all()
            if not request.user.is_authenticated:
                queryset = queryset.filter(is_active=True)
            queryset = queryset.order_by('display_order', 'name')
            serializer = SubcategorySerializer(queryset, many=True, context={'request': request})
            return Response(serializer.data)
        except MenuCategory.DoesNotExist:
            return Response({'detail': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def public(self, request):
        """Get public menu categories with items (top-level only with nested subcategories)"""
        queryset = MenuCategory.objects.filter(
            is_active=True,
            parent__isnull=True  # Only top-level categories
        ).prefetch_related(
            'menu_items', 'subcategories', 'subcategories__menu_items'
        ).order_by('display_order', 'name')

        category_type = request.query_params.get('category_type')
        if category_type:
            queryset = queryset.filter(category_type=category_type)

        serializer = PublicMenuCategorySerializer(
            queryset,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def toggle_active(self, request, pk=None):
        """Toggle active status of menu category"""
        try:
            category = self.get_object()
            category.is_active = not category.is_active
            category.save()
            serializer = self.get_serializer(category)
            return Response(serializer.data)
        except MenuCategory.DoesNotExist:
            return Response(
                {'detail': 'Menu category not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def get_permissions(self):
        """Public access for list/retrieve, admin only for create/update/delete"""
        if self.action in ['list', 'retrieve', 'public', 'by_category']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filter queryset based on action and permissions"""
        if self.action in ['list', 'retrieve'] and not self.request.user.is_authenticated:
            # Public access - only show available items
            return MenuItem.objects.filter(is_available=True).select_related('category')
        return MenuItem.objects.all().select_related('category')
    
    def get_serializer_class(self):
        """Use different serializer for public access"""
        if self.action in ['public', 'by_category'] or not self.request.user.is_authenticated:
            return PublicMenuItemSerializer
        return MenuItemSerializer
    
    def list(self, request):
        """List menu items with filtering options"""
        queryset = self.get_queryset()
        
        # Filter by category
        category = request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__id=category)
        
        # Filter by category type
        category_type = request.query_params.get('category_type')
        if category_type:
            queryset = queryset.filter(category__category_type=category_type)
        
        # Filter by featured status
        featured = request.query_params.get('featured')
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)
        
        # Filter by dietary info
        dietary = request.query_params.get('dietary')
        if dietary:
            queryset = queryset.filter(dietary_info__contains=[dietary])
        
        # Search in name and description
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(ingredients__icontains=search)
            )
        
        # Order by category, then display order, then name
        queryset = queryset.order_by(
            'category__display_order', 'display_order', 'name'
        )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def public(self, request):
        """Get public menu items"""
        queryset = MenuItem.objects.filter(
            is_available=True,
            category__is_active=True
        ).select_related('category').prefetch_related('variants')
        
        # Apply same filtering as list
        category_type = request.query_params.get('category_type')
        if category_type:
            queryset = queryset.filter(category__category_type=category_type)
        
        featured = request.query_params.get('featured')
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)
        
        dietary = request.query_params.get('dietary')
        if dietary:
            queryset = queryset.filter(dietary_info__contains=[dietary])
        
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(ingredients__icontains=search)
            )
        
        # Order by featured first, then category order
        queryset = queryset.order_by(
            '-is_featured', 'category__display_order', 'display_order', 'name'
        )
        
        serializer = PublicMenuItemSerializer(
            queryset, 
            many=True, 
            context={'request': request}
        )
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get menu items grouped by category (top-level with subcategories)"""
        # Get top-level categories only
        categories = MenuCategory.objects.filter(
            is_active=True,
            parent__isnull=True
        ).prefetch_related(
            'menu_items', 'subcategories', 'subcategories__menu_items'
        ).order_by('display_order', 'name')

        category_type = request.query_params.get('category_type')
        if category_type:
            categories = categories.filter(category_type=category_type)

        dietary = request.query_params.get('dietary')
        search = request.query_params.get('search')

        result = []
        for category in categories:
            # Get items directly in this category
            category_items = category.menu_items.filter(is_available=True)
            if dietary:
                category_items = category_items.filter(dietary_info__contains=[dietary])
            if search:
                category_items = category_items.filter(
                    Q(name__icontains=search) |
                    Q(description__icontains=search) |
                    Q(ingredients__icontains=search)
                )

            # Build subcategories with their items
            subcategories_data = []
            for subcategory in category.subcategories.filter(is_active=True).order_by('display_order', 'name'):
                sub_items = subcategory.menu_items.filter(is_available=True)
                if dietary:
                    sub_items = sub_items.filter(dietary_info__contains=[dietary])
                if search:
                    sub_items = sub_items.filter(
                        Q(name__icontains=search) |
                        Q(description__icontains=search) |
                        Q(ingredients__icontains=search)
                    )
                if sub_items.exists():
                    subcategories_data.append({
                        'id': str(subcategory.id),
                        'name': subcategory.name,
                        'description': subcategory.description,
                        'icon': subcategory.icon,
                        'items_count': sub_items.count(),
                        'menu_items': PublicMenuItemSerializer(
                            sub_items.order_by('display_order', 'name'),
                            many=True,
                            context={'request': request}
                        ).data
                    })

            # Include category if it has items or subcategories with items
            if category_items.exists() or subcategories_data:
                category_data = {
                    'id': str(category.id),
                    'name': category.name,
                    'category_type': category.category_type,
                    'description': category.description,
                    'icon': category.icon,
                    'items_count': category_items.count(),
                    'subcategory_count': len(subcategories_data),
                    'subcategories': subcategories_data,
                    'menu_items': PublicMenuItemSerializer(
                        category_items.order_by('display_order', 'name'),
                        many=True,
                        context={'request': request}
                    ).data
                }
                result.append(category_data)

        return Response(result)
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def toggle_available(self, request, pk=None):
        """Toggle available status of menu item"""
        try:
            item = self.get_object()
            item.is_available = not item.is_available
            item.save()
            
            serializer = self.get_serializer(item)
            return Response(serializer.data)
            
        except MenuItem.DoesNotExist:
            return Response(
                {'detail': 'Menu item not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def toggle_featured(self, request, pk=None):
        """Toggle featured status of menu item"""
        try:
            item = self.get_object()
            item.is_featured = not item.is_featured
            item.save()
            
            serializer = self.get_serializer(item)
            return Response(serializer.data)
            
        except MenuItem.DoesNotExist:
            return Response(
                {'detail': 'Menu item not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class MenuItemVariantViewSet(viewsets.ModelViewSet):
    queryset = MenuItemVariant.objects.all()
    serializer_class = MenuItemVariantSerializer
    permission_classes = [IsAuthenticated]  # Admin only
    
    def get_queryset(self):
        """Filter by menu item if specified"""
        queryset = MenuItemVariant.objects.all()
        
        menu_item = self.request.query_params.get('menu_item')
        if menu_item:
            queryset = queryset.filter(menu_item__id=menu_item)
        
        return queryset.order_by('display_order', 'price')
    
    def perform_create(self, serializer):
        """Set menu item to have variants when creating a variant"""
        variant = serializer.save()
        variant.menu_item.has_variants = True
        variant.menu_item.save()
    
    def perform_destroy(self, instance):
        """Check if menu item should have variants after deleting"""
        menu_item = instance.menu_item
        instance.delete()
        
        # If no more variants, set has_variants to False
        if not menu_item.variants.exists():
            menu_item.has_variants = False
            menu_item.save()