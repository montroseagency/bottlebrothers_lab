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
# Localized/i18n Views
from .LocalizedViews import (
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
)
# Guest Reservation Views
from .GuestReservationViews import (
    create_guest_reservation,
    verify_reservation_otp,
    resend_reservation_otp,
    lookup_reservation,
    cancel_reservation,
)
# Client Portal Views
from .ClientPortalViews import (
    client_register,
    client_login,
    client_profile,
    update_client_profile,
    change_password,
    my_reservations,
    link_reservation,
    # Client messaging
    client_conversations,
    conversation_messages,
    # Admin client messaging
    admin_client_conversations,
    admin_conversation_messages,
    admin_close_conversation,
    admin_reopen_conversation,
    # Direct support chat (WhatsApp-style)
    get_or_create_support_chat,
    support_chat_messages,
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
    # Localized/i18n
    'PublicEventViewSet',
    'PublicGalleryViewSet',
    'PublicMenuViewSet',
    'PublicHomeSectionViewSet',
    'TranslationViewSet',
    'HomeSectionAdminViewSet',
    'StaticContentAdminViewSet',
    'RestaurantInfoAdminViewSet',
    'public_restaurant_info',
    'public_page_content',
    # Client messaging
    'client_conversations',
    'conversation_messages',
    # Admin client messaging
    'admin_client_conversations',
    'admin_conversation_messages',
    'admin_close_conversation',
    'admin_reopen_conversation',
    # Direct support chat (WhatsApp-style)
    'get_or_create_support_chat',
    'support_chat_messages',
]