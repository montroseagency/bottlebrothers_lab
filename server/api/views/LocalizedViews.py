# server/api/views/LocalizedViews.py
"""
Locale-aware public API views for multilingual content delivery.
These endpoints support ?locale=sq|en query parameter.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType

from ..models import (
    Event, GalleryItem, MenuCategory, MenuItem,
    HomeSection, StaticContent, RestaurantInfo, Translation
)
from ..serializers import (
    LocalizedEventSerializer, LocalizedGalleryItemSerializer,
    LocalizedMenuCategorySerializer, LocalizedMenuItemSerializer,
    LocalizedHomeSectionSerializer, HomeSectionSerializer,
    StaticContentSerializer, RestaurantInfoSerializer, TranslationSerializer
)
from ..services.translation_service import get_translation_service


class LocaleMixin:
    """Mixin to extract locale from request"""

    def get_locale(self):
        """Get locale from query params, default to 'sq'"""
        locale = self.request.query_params.get('locale', 'sq')
        if locale not in ['sq', 'en']:
            locale = 'sq'
        return locale

    def get_serializer_context(self):
        """Add locale to serializer context"""
        context = super().get_serializer_context()
        context['locale'] = self.get_locale()
        return context


# =============================================================================
# PUBLIC LOCALIZED ENDPOINTS
# =============================================================================

class PublicEventViewSet(LocaleMixin, viewsets.ReadOnlyModelViewSet):
    """Public events endpoint with locale support"""
    serializer_class = LocalizedEventSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Event.objects.filter(is_active=True)

        # Filter by event type
        event_type = self.request.query_params.get('type')
        if event_type:
            queryset = queryset.filter(event_type=event_type)

        # Filter by featured
        featured = self.request.query_params.get('featured')
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)

        # Filter upcoming only
        upcoming = self.request.query_params.get('upcoming')
        if upcoming == 'true':
            queryset = queryset.filter(start_date__gte=timezone.now().date())

        return queryset.order_by('display_order', 'start_date')


class PublicGalleryViewSet(LocaleMixin, viewsets.ReadOnlyModelViewSet):
    """Public gallery endpoint with locale support"""
    serializer_class = LocalizedGalleryItemSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = GalleryItem.objects.filter(is_active=True)

        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)

        # Filter by featured
        featured = self.request.query_params.get('featured')
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)

        return queryset.order_by('display_order', '-created_at')


class PublicMenuViewSet(LocaleMixin, viewsets.ReadOnlyModelViewSet):
    """Public menu endpoint with locale support"""
    serializer_class = LocalizedMenuCategorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return MenuCategory.objects.filter(is_active=True).order_by('display_order')

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured menu items"""
        locale = self.get_locale()
        featured_items = MenuItem.objects.filter(
            is_available=True,
            is_featured=True
        ).order_by('display_order')[:8]

        serializer = LocalizedMenuItemSerializer(
            featured_items, many=True,
            context={'request': request, 'locale': locale}
        )
        return Response(serializer.data)


class PublicHomeSectionViewSet(LocaleMixin, viewsets.ReadOnlyModelViewSet):
    """Public home sections endpoint with locale support"""
    serializer_class = LocalizedHomeSectionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return HomeSection.objects.filter(
            is_active=True,
            is_published=True
        ).order_by('display_order')

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get home section by type"""
        section_type = request.query_params.get('type')
        locale = self.get_locale()

        if not section_type:
            return Response(
                {'error': 'type parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            section = HomeSection.objects.get(
                section_type=section_type,
                is_active=True,
                is_published=True
            )
            serializer = LocalizedHomeSectionSerializer(
                section,
                context={'request': request, 'locale': locale}
            )
            return Response(serializer.data)
        except HomeSection.DoesNotExist:
            return Response(
                {'error': 'Section not found'},
                status=status.HTTP_404_NOT_FOUND
            )


# =============================================================================
# PUBLIC INFO ENDPOINTS (Function-based)
# =============================================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def public_restaurant_info(request):
    """Get restaurant info with locale support"""
    locale = request.query_params.get('locale', 'sq')
    if locale not in ['sq', 'en']:
        locale = 'sq'

    info = RestaurantInfo.get_info()

    # Build response with translations
    data = {
        'name': info.get_translation('name', locale) or info.name,
        'tagline': info.get_translation('tagline', locale) or info.tagline,
        'description': info.get_translation('description', locale) or info.description,
        'phone': info.phone,
        'email': info.email,
        'address': {
            'line1': info.get_translation('address_line1', locale) or info.address_line1,
            'line2': info.get_translation('address_line2', locale) or info.address_line2,
            'city': info.get_translation('city', locale) or info.city,
            'postal_code': info.postal_code,
            'country': info.get_translation('country', locale) or info.country,
        },
        'coordinates': {
            'latitude': float(info.latitude) if info.latitude else None,
            'longitude': float(info.longitude) if info.longitude else None,
        },
        'opening_hours': info.opening_hours,
        'social': {
            'instagram': info.instagram,
            'facebook': info.facebook,
            'tiktok': info.tiktok,
        }
    }

    return Response(data)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_page_content(request, page_slug):
    """Get static page content with locale support"""
    locale = request.query_params.get('locale', 'sq')
    if locale not in ['sq', 'en']:
        locale = 'sq'

    try:
        content = StaticContent.objects.get(page=page_slug, is_published=True)

        data = {
            'page': content.page,
            'page_title': content.get_translation('page_title', locale) or content.page_title,
            'page_subtitle': content.get_translation('page_subtitle', locale) or content.page_subtitle,
            'hero_title': content.get_translation('hero_title', locale) or content.hero_title,
            'hero_description': content.get_translation('hero_description', locale) or content.hero_description,
            'content': content.get_translation('content', locale) or content.content,
            'meta': {
                'title': content.get_translation('meta_title', locale) or content.meta_title,
                'description': content.get_translation('meta_description', locale) or content.meta_description,
            }
        }

        return Response(data)
    except StaticContent.DoesNotExist:
        return Response(
            {'error': 'Page not found'},
            status=status.HTTP_404_NOT_FOUND
        )


# =============================================================================
# ADMIN TRANSLATION ENDPOINTS
# =============================================================================

class TranslationViewSet(viewsets.ModelViewSet):
    """Admin viewset for managing translations"""
    serializer_class = TranslationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Translation.objects.all()

        # Filter by content type
        content_type = self.request.query_params.get('content_type')
        if content_type:
            queryset = queryset.filter(content_type__model=content_type)

        # Filter by object
        object_id = self.request.query_params.get('object_id')
        if object_id:
            queryset = queryset.filter(object_id=object_id)

        # Filter by locale
        locale = self.request.query_params.get('locale')
        if locale:
            queryset = queryset.filter(locale=locale)

        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset.order_by('content_type', 'object_id', 'locale', 'field_name')

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Bulk create translations for an object"""
        object_id = request.data.get('object_id')
        content_type_str = request.data.get('content_type')
        locale = request.data.get('locale')
        translations = request.data.get('translations', {})

        if not all([object_id, content_type_str, locale, translations]):
            return Response(
                {'error': 'object_id, content_type, locale, and translations are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        from django.contrib.contenttypes.models import ContentType
        try:
            app_label, model = content_type_str.split('.')
            content_type = ContentType.objects.get(app_label=app_label, model=model)
        except (ValueError, ContentType.DoesNotExist):
            return Response(
                {'error': 'Invalid content_type format. Use app_label.model'},
                status=status.HTTP_400_BAD_REQUEST
            )

        created = []
        for field_name, translated_text in translations.items():
            obj, was_created = Translation.objects.update_or_create(
                content_type=content_type,
                object_id=object_id,
                locale=locale,
                field_name=field_name,
                defaults={
                    'translated_text': translated_text,
                    'status': 'draft',
                    'translated_by': request.user.username
                }
            )
            created.append({
                'id': str(obj.id),
                'field_name': field_name,
                'was_created': was_created
            })

        return Response({'created': created}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def publish(self, request):
        """Publish translations for an object"""
        object_id = request.data.get('object_id')
        locale = request.data.get('locale')

        if not all([object_id, locale]):
            return Response(
                {'error': 'object_id and locale are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        updated = Translation.objects.filter(
            object_id=object_id,
            locale=locale
        ).update(status='published')

        return Response({'updated_count': updated})

    @action(detail=False, methods=['post'])
    def auto_translate(self, request):
        """Auto-translate content from source to target locale"""
        content_type_str = request.data.get('content_type')
        object_id = request.data.get('object_id')
        source_locale = request.data.get('source_locale', 'sq')
        target_locale = request.data.get('target_locale', 'en')
        fields = request.data.get('fields', {})

        if not all([content_type_str, object_id, fields]):
            return Response(
                {'error': 'content_type, object_id, and fields are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if source_locale == target_locale:
            return Response(
                {'error': 'source_locale and target_locale must be different'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get translation service
        translation_service = get_translation_service()
        active_provider = translation_service.get_active_provider()

        # Translate all fields
        results = translation_service.translate_fields(
            fields, source_locale, target_locale
        )

        # Get content type
        try:
            app_label, model = content_type_str.split('.')
            content_type = ContentType.objects.get(app_label=app_label, model=model)
        except (ValueError, ContentType.DoesNotExist):
            return Response(
                {'error': 'Invalid content_type format. Use app_label.model'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Save translations
        saved = []
        for field_name, result in results.items():
            obj, was_created = Translation.objects.update_or_create(
                content_type=content_type,
                object_id=object_id,
                locale=target_locale,
                field_name=field_name,
                defaults={
                    'translated_text': result['translated_text'],
                    'status': 'draft',
                    'is_auto_translated': result['is_auto_translated'],
                    'translated_by': f"auto:{result['provider']}"
                }
            )
            saved.append({
                'field_name': field_name,
                'translated_text': result['translated_text'],
                'is_auto_translated': result['is_auto_translated'],
                'needs_review': result['needs_review'],
                'provider': result['provider'],
            })

        return Response({
            'success': True,
            'provider': active_provider,
            'needs_review': any(s['needs_review'] for s in saved),
            'translations': saved
        })


class HomeSectionAdminViewSet(viewsets.ModelViewSet):
    """Admin viewset for managing home sections"""
    serializer_class = HomeSectionSerializer
    permission_classes = [IsAuthenticated]
    queryset = HomeSection.objects.all().order_by('display_order')

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish a home section"""
        section = self.get_object()
        section.is_published = True
        section.published_at = timezone.now()
        section.save()
        return Response({'status': 'published'})

    @action(detail=True, methods=['post'])
    def unpublish(self, request, pk=None):
        """Unpublish a home section"""
        section = self.get_object()
        section.is_published = False
        section.save()
        return Response({'status': 'unpublished'})


class StaticContentAdminViewSet(viewsets.ModelViewSet):
    """Admin viewset for managing static content"""
    serializer_class = StaticContentSerializer
    permission_classes = [IsAuthenticated]
    queryset = StaticContent.objects.all()


class RestaurantInfoAdminViewSet(viewsets.ModelViewSet):
    """Admin viewset for managing restaurant info"""
    serializer_class = RestaurantInfoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return RestaurantInfo.objects.all()

    def list(self, request):
        """Return single instance"""
        info = RestaurantInfo.get_info()
        serializer = self.get_serializer(info)
        return Response(serializer.data)
