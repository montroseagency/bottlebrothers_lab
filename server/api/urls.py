# server/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    ReservationViewSet, 
    ContactMessageViewSet,
    CustomTokenObtainPairView,
    admin_login,
    admin_logout,
    dashboard_analytics
)

router = DefaultRouter()
router.register(r'reservations', ReservationViewSet)
router.register(r'contact', ContactMessageViewSet)

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


# server/server/urls.py
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        'message': 'Restaurant API',
        'endpoints': {
            'reservations': '/api/reservations/',
            'availability': '/api/reservations/availability/',
            'lookup': '/api/reservations/lookup/',
            'contact': '/api/contact/',
            'auth': '/api/auth/',
            'dashboard': '/api/dashboard/',
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('', api_root),
]