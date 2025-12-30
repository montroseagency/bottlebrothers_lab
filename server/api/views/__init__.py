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
# Phase 5: New API Views
from .TableViews import FloorPlanViewSet, TableViewSet, TableAssignmentViewSet
from .AuthViews import request_otp, verify_otp, resend_otp, OTPVerificationViewSet
from .LoyaltyViews import (
    CustomerProfileViewSet,
    VIPMembershipViewSet,
    OfferViewSet,
    WaitlistViewSet
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
    # Phase 5
    'FloorPlanViewSet',
    'TableViewSet',
    'TableAssignmentViewSet',
    'request_otp',
    'verify_otp',
    'resend_otp',
    'OTPVerificationViewSet',
    'CustomerProfileViewSet',
    'VIPMembershipViewSet',
    'OfferViewSet',
    'WaitlistViewSet',
]