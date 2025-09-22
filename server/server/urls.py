# server/server/urls.py
"""
URL configuration for server project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        'message': 'Restaurant API',
        'endpoints': {
            'reservations': '/api/reservations/',
            'availability': '/api/reservations/availability/',
            'lookup': '/api/reservations/lookup/',
            'contact': '/api/contact/',
            'gallery': '/api/gallery/',
            'auth': '/api/auth/',
            'dashboard': '/api/dashboard/',
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('', api_root),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)