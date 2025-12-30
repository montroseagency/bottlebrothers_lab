# Updated server/api/urls.py - Updated imports for modular views
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

# Import all views from the views package
from .views import (
    # Existing views
    ReservationViewSet,
    ContactMessageViewSet,
    GalleryItemViewSet,
    EventViewSet,
    MenuCategoryViewSet,
    MenuItemViewSet,
    MenuItemVariantViewSet,
    CustomTokenObtainPairView,
    admin_login,
    admin_logout,
    dashboard_analytics,
    # Phase 5: New views
    FloorPlanViewSet,
    TableViewSet,
    TableAssignmentViewSet,
    request_otp,
    verify_otp,
    resend_otp,
    OTPVerificationViewSet,
    CustomerProfileViewSet,
    VIPMembershipViewSet,
    OfferViewSet,
    WaitlistViewSet
)

# Create router and register viewsets
router = DefaultRouter()
# Existing viewsets
router.register(r'reservations', ReservationViewSet)
router.register(r'contact', ContactMessageViewSet)
router.register(r'gallery', GalleryItemViewSet)
router.register(r'events', EventViewSet)
router.register(r'menu/categories', MenuCategoryViewSet)
router.register(r'menu/items', MenuItemViewSet)
router.register(r'menu/variants', MenuItemVariantViewSet)

# Phase 5: Table management viewsets
router.register(r'floor-plans', FloorPlanViewSet, basename='floorplan')
router.register(r'tables', TableViewSet, basename='table')
router.register(r'table-assignments', TableAssignmentViewSet, basename='tableassignment')

# Phase 5: Customer & Loyalty viewsets
router.register(r'customers', CustomerProfileViewSet, basename='customerprofile')
router.register(r'vip-memberships', VIPMembershipViewSet, basename='vipmembership')
router.register(r'offers', OfferViewSet, basename='offer')
router.register(r'waitlist', WaitlistViewSet, basename='waitlist')

# Phase 5: OTP verification viewset (admin only)
router.register(r'otp-verifications', OTPVerificationViewSet, basename='otpverification')

urlpatterns = [
    # Include all router URLs
    path('', include(router.urls)),

    # Authentication endpoints
    path('auth/login/', admin_login, name='admin_login'),
    path('auth/logout/', admin_logout, name='admin_logout'),
    path('auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Phase 5: OTP endpoints (public)
    path('auth/request-otp/', request_otp, name='request_otp'),
    path('auth/verify-otp/', verify_otp, name='verify_otp'),
    path('auth/resend-otp/', resend_otp, name='resend_otp'),

    # Dashboard endpoints
    path('dashboard/analytics/', dashboard_analytics, name='dashboard_analytics'),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)