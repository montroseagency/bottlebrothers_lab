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
    WaitlistViewSet,
    # Localized/i18n views
    PublicEventViewSet,
    PublicGalleryViewSet,
    PublicMenuViewSet,
    PublicHomeSectionViewSet,
    TranslationViewSet,
    HomeSectionAdminViewSet,
    StaticContentAdminViewSet,
    RestaurantInfoAdminViewSet,
    public_restaurant_info,
    public_page_content,
    # Guest reservation views
    create_guest_reservation,
    verify_reservation_otp,
    resend_reservation_otp,
    lookup_reservation,
    cancel_reservation,
    # Client portal views
    client_register,
    client_login,
    client_profile,
    update_client_profile,
    change_password,
    my_reservations,
    link_reservation,
    # Client messaging views
    client_conversations,
    conversation_messages,
    # Admin client messaging views
    admin_client_conversations,
    admin_conversation_messages,
    admin_close_conversation,
    admin_reopen_conversation,
    # Direct support chat (WhatsApp-style)
    get_or_create_support_chat,
    support_chat_messages,
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

# Localized public endpoints (with ?locale=sq|en support)
router.register(r'public/events', PublicEventViewSet, basename='public-events')
router.register(r'public/gallery', PublicGalleryViewSet, basename='public-gallery')
router.register(r'public/menu', PublicMenuViewSet, basename='public-menu')
router.register(r'public/home-sections', PublicHomeSectionViewSet, basename='public-home-sections')

# Admin CMS endpoints
router.register(r'admin/translations', TranslationViewSet, basename='translations')
router.register(r'admin/home-sections', HomeSectionAdminViewSet, basename='home-sections')
router.register(r'admin/static-content', StaticContentAdminViewSet, basename='static-content')
router.register(r'admin/restaurant-info', RestaurantInfoAdminViewSet, basename='restaurant-info')

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

    # Public localized content endpoints
    path('public/info/', public_restaurant_info, name='public_restaurant_info'),
    path('public/pages/<str:page_slug>/', public_page_content, name='public_page_content'),

    # Guest reservation endpoints
    path('reservations/guest/', create_guest_reservation, name='create_guest_reservation'),
    path('reservations/verify-otp/', verify_reservation_otp, name='verify_reservation_otp'),
    path('reservations/resend-otp/', resend_reservation_otp, name='resend_reservation_otp'),
    path('reservations/lookup/', lookup_reservation, name='lookup_reservation'),
    path('reservations/cancel/', cancel_reservation, name='cancel_reservation'),

    # Client portal endpoints
    path('client/register/', client_register, name='client_register'),
    path('client/login/', client_login, name='client_login'),
    path('client/profile/', client_profile, name='client_profile'),
    path('client/profile/update/', update_client_profile, name='update_client_profile'),
    path('client/change-password/', change_password, name='change_password'),
    path('client/reservations/', my_reservations, name='my_reservations'),
    path('client/link-reservation/', link_reservation, name='link_reservation'),

    # Client messaging endpoints
    path('client/conversations/', client_conversations, name='client_conversations'),
    path('client/conversations/<uuid:conversation_id>/messages/', conversation_messages, name='conversation_messages'),

    # Direct support chat (WhatsApp-style single chat)
    path('client/support-chat/', get_or_create_support_chat, name='get_or_create_support_chat'),
    path('client/support-chat/messages/', support_chat_messages, name='support_chat_messages'),

    # Admin client messaging endpoints
    path('admin/client-conversations/', admin_client_conversations, name='admin_client_conversations'),
    path('admin/client-conversations/<uuid:conversation_id>/messages/', admin_conversation_messages, name='admin_conversation_messages'),
    path('admin/client-conversations/<uuid:conversation_id>/close/', admin_close_conversation, name='admin_close_conversation'),
    path('admin/client-conversations/<uuid:conversation_id>/reopen/', admin_reopen_conversation, name='admin_reopen_conversation'),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)