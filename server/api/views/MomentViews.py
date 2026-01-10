# server/api/views/MomentViews.py
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404

from ..models import Moment
from ..serializers import MomentSerializer, PublicMomentSerializer


class MomentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Moments (Our Best Moments section).

    Admin endpoints:
    - GET /api/admin/moments/ - List all moments
    - POST /api/admin/moments/ - Create a new moment
    - GET /api/admin/moments/{id}/ - Get moment details
    - PUT /api/admin/moments/{id}/ - Update moment
    - DELETE /api/admin/moments/{id}/ - Delete moment
    - POST /api/admin/moments/{id}/toggle-active/ - Toggle active status
    - POST /api/admin/moments/reorder/ - Reorder moments
    """
    queryset = Moment.objects.all()
    serializer_class = MomentSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        """Return all moments ordered by display_order"""
        return Moment.objects.all().order_by('display_order', '-created_at')

    def create(self, request, *args, **kwargs):
        """Create a new moment"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        """Update an existing moment"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        """Delete a moment"""
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle the active status of a moment"""
        moment = self.get_object()
        moment.is_active = not moment.is_active
        moment.save()
        serializer = self.get_serializer(moment)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """Reorder moments based on provided order list"""
        order_list = request.data.get('order', [])

        if not order_list:
            return Response(
                {'error': 'Order list is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        for index, moment_id in enumerate(order_list):
            try:
                moment = Moment.objects.get(id=moment_id)
                moment.display_order = index
                moment.save(update_fields=['display_order'])
            except Moment.DoesNotExist:
                continue

        return Response({'message': 'Moments reordered successfully'})


class PublicMomentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public ViewSet for viewing active Moments.

    Public endpoints:
    - GET /api/moments/ - List all active moments
    - GET /api/moments/{id}/ - Get moment details
    """
    queryset = Moment.objects.filter(is_active=True)
    serializer_class = PublicMomentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        """Return only active moments ordered by display_order"""
        return Moment.objects.filter(is_active=True).order_by('display_order', '-created_at')
