# server/api/urls.py - UPDATED VERSION
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    ReservationViewSet, 
    ContactMessageViewSet,
    GalleryItemViewSet,
    EventViewSet,  # Add this import
    CustomTokenObtainPairView,
    admin_login,
    admin_logout,
    dashboard_analytics
)

router = DefaultRouter()
router.register(r'reservations', ReservationViewSet)
router.register(r'contact', ContactMessageViewSet)
router.register(r'gallery', GalleryItemViewSet)
router.register(r'events', EventViewSet)  # Add this line

urlpatterns = [
    path('', include(router.urls)),
    
    # Authentication endpoints
    path('auth/login/', admin_login, name='admin_login'),
    path('auth/logout/', admin_logout, name='admin_logout'),
    path('auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Dashboard endpoints
    path('dashboard/analytics/', dashboard_analytics, name='dashboard_analytics'),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)