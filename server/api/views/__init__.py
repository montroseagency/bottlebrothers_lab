# server/api/views/__init__.py

# Import all viewsets from individual view files
from .ReservationViews import ReservationViewSet, ContactMessageViewSet
from .EventViews import EventViewSet
from .GalleryViews import GalleryItemViewSet
from .MenuViews import MenuCategoryViewSet, MenuItemViewSet, MenuItemVariantViewSet
from .AdminViews import (
    CustomTokenObtainPairView,
    admin_login,
    admin_logout,
    dashboard_analytics
)

# Make all imports available when importing from views
__all__ = [
    'ReservationViewSet',
    'ContactMessageViewSet',
    'EventViewSet',
    'GalleryItemViewSet',
    'MenuCategoryViewSet',
    'MenuItemViewSet',
    'MenuItemVariantViewSet',
    'CustomTokenObtainPairView',
    'admin_login',
    'admin_logout',
    'dashboard_analytics',
]