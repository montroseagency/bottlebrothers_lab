# server/api/views/TableViews.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q
from ..models import FloorPlan, Table, TableAssignment, Reservation, CustomerProfile
from ..serializers import (
    FloorPlanSerializer, TableSerializer, TableAssignmentSerializer
)


class FloorPlanViewSet(viewsets.ModelViewSet):
    """
    ViewSet for floor plans
    """
    queryset = FloorPlan.objects.all()
    serializer_class = FloorPlanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = FloorPlan.objects.all()
        # Filter by active status if specified
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        return queryset.order_by('display_order', 'name')


class TableViewSet(viewsets.ModelViewSet):
    """
    ViewSet for tables with availability checking
    """
    queryset = Table.objects.all()
    serializer_class = TableSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Table.objects.select_related('floor_plan').all()

        # Filter by floor plan
        floor_plan_id = self.request.query_params.get('floor_plan', None)
        if floor_plan_id:
            queryset = queryset.filter(floor_plan_id=floor_plan_id)

        # Filter by VIP status
        is_vip = self.request.query_params.get('is_vip', None)
        if is_vip is not None:
            queryset = queryset.filter(is_vip=is_vip.lower() == 'true')

        # Filter by availability
        is_available = self.request.query_params.get('is_available', None)
        if is_available is not None:
            queryset = queryset.filter(is_available=is_available.lower() == 'true')

        return queryset.order_by('floor_plan__display_order', 'table_number')

    @action(detail=False, methods=['get'])
    def availability(self, request):
        """
        Check table availability for a specific date and time

        Query params:
        - date: YYYY-MM-DD format
        - time: HH:MM format
        - party_size: number of guests
        - duration: duration in minutes (default: 120)
        """
        date_str = request.query_params.get('date')
        time_str = request.query_params.get('time')
        party_size = request.query_params.get('party_size')
        duration = int(request.query_params.get('duration', 120))

        # Validate required parameters
        if not all([date_str, time_str, party_size]):
            return Response(
                {'error': 'date, time, and party_size are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from datetime import datetime
            date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
            time_obj = datetime.strptime(time_str, '%H:%M').time()
            party_size = int(party_size)
        except ValueError as e:
            return Response(
                {'error': f'Invalid format: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get available tables
        available_tables = self._get_available_tables(
            date_obj, time_obj, party_size, duration
        )

        serializer = self.get_serializer(available_tables, many=True)
        return Response({
            'date': date_str,
            'time': time_str,
            'party_size': party_size,
            'available_tables': serializer.data,
            'count': len(serializer.data)
        })

    def _get_available_tables(self, date, time, party_size, duration_minutes=120):
        """
        Find available tables for the given date, time, and party size
        """
        # Create datetime objects for the reservation window
        reservation_start = timezone.datetime.combine(date, time)
        reservation_end = reservation_start + timedelta(minutes=duration_minutes)

        # Find tables that are:
        # 1. Available and suitable for party size
        suitable_tables = Table.objects.filter(
            is_available=True,
            min_capacity__lte=party_size,
            capacity__gte=party_size
        )

        # 2. Not assigned to overlapping reservations
        conflicting_assignments = TableAssignment.objects.filter(
            reservation__date=date,
            reservation__status__in=['confirmed', 'seated']
        ).select_related('reservation', 'table')

        # Build list of tables to exclude
        excluded_table_ids = []
        for assignment in conflicting_assignments:
            # Calculate the existing reservation's time window
            existing_start = timezone.datetime.combine(
                assignment.reservation.date,
                assignment.reservation.time
            )
            existing_end = existing_start + timedelta(minutes=duration_minutes)

            # Check for overlap
            if (reservation_start < existing_end and reservation_end > existing_start):
                excluded_table_ids.append(assignment.table.id)

        # Exclude conflicting tables
        available_tables = suitable_tables.exclude(id__in=excluded_table_ids)

        return available_tables

    @action(detail=False, methods=['post'])
    def assign(self, request):
        """
        Assign a table to a reservation

        Body params:
        - reservation_id: UUID of the reservation
        - table_id: UUID of the table (optional for auto-assignment)
        - notes: optional notes
        - auto_assign: boolean, if true will auto-assign best table
        """
        reservation_id = request.data.get('reservation_id')
        table_id = request.data.get('table_id')
        notes = request.data.get('notes', '')
        auto_assign = request.data.get('auto_assign', False)

        if not reservation_id:
            return Response(
                {'error': 'reservation_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            reservation = Reservation.objects.get(id=reservation_id)
        except Reservation.DoesNotExist:
            return Response(
                {'error': 'Reservation not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Auto-assign if requested
        if auto_assign or not table_id:
            table = self._auto_assign_table(reservation)
            if not table:
                return Response(
                    {'error': 'No suitable tables available'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            try:
                table = Table.objects.get(id=table_id)
            except Table.DoesNotExist:
                return Response(
                    {'error': 'Table not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Check if table is available
            available_tables = self._get_available_tables(
                reservation.date,
                reservation.time,
                reservation.party_size
            )
            if table not in available_tables:
                return Response(
                    {'error': 'Table is not available for this time slot'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Create the assignment
        assignment = TableAssignment.objects.create(
            reservation=reservation,
            table=table,
            notes=notes
        )

        serializer = TableAssignmentSerializer(assignment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def _auto_assign_table(self, reservation):
        """
        Automatically assign the best table for a reservation
        Algorithm:
        1. VIP customers get VIP tables if available
        2. Check customer's favorite table if available
        3. Find smallest suitable table
        """
        party_size = reservation.party_size
        date = reservation.date
        time = reservation.time

        # Get customer profile if exists
        customer = CustomerProfile.objects.filter(email=reservation.email).first()

        # Get available tables
        available_tables = self._get_available_tables(date, time, party_size)

        if not available_tables.exists():
            return None

        # VIP priority: if customer is VIP, try to get VIP table
        if customer and customer.is_vip:
            vip_tables = available_tables.filter(is_vip=True)
            if vip_tables.exists():
                # Get smallest VIP table that fits
                return vip_tables.order_by('capacity').first()

        # Favorite table: check if customer's favorite table is available
        if customer and customer.favorite_table:
            if customer.favorite_table in available_tables:
                return customer.favorite_table

        # Default: get smallest suitable table
        return available_tables.order_by('capacity').first()


class TableAssignmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for table assignments
    """
    queryset = TableAssignment.objects.all()
    serializer_class = TableAssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = TableAssignment.objects.select_related(
            'reservation', 'table', 'table__floor_plan'
        ).all()

        # Filter by date
        date_str = self.request.query_params.get('date', None)
        if date_str:
            try:
                from datetime import datetime
                date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
                queryset = queryset.filter(reservation__date=date_obj)
            except ValueError:
                pass

        # Filter by reservation
        reservation_id = self.request.query_params.get('reservation', None)
        if reservation_id:
            queryset = queryset.filter(reservation_id=reservation_id)

        # Filter by table
        table_id = self.request.query_params.get('table', None)
        if table_id:
            queryset = queryset.filter(table_id=table_id)

        return queryset.order_by('-assigned_at')

    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get all table assignments for today"""
        today = timezone.now().date()
        assignments = self.get_queryset().filter(reservation__date=today)
        serializer = self.get_serializer(assignments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['delete'])
    def unassign(self, request, pk=None):
        """Remove a table assignment"""
        try:
            assignment = self.get_object()
            assignment.delete()
            return Response(
                {'message': 'Table unassigned successfully'},
                status=status.HTTP_200_OK
            )
        except TableAssignment.DoesNotExist:
            return Response(
                {'error': 'Assignment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
