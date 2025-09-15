# server/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReservationViewSet, ContactMessageViewSet

router = DefaultRouter()
router.register(r'reservations', ReservationViewSet)
router.register(r'contact', ContactMessageViewSet)

urlpatterns = [
    path('', include(router.urls)),
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
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('', api_root),  # Root endpoint for testing
]