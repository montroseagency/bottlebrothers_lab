# server/api/views/LoyaltyViews.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.utils import timezone
from django.db.models import Q, Sum
from decimal import Decimal
from ..models import CustomerProfile, VIPMembership, Offer, Waitlist, Reservation
from ..serializers import (
    CustomerProfileSerializer, VIPMembershipSerializer, OfferSerializer,
    WaitlistSerializer
)


class CustomerProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for customer profiles and loyalty management
    """
    queryset = CustomerProfile.objects.all()
    serializer_class = CustomerProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = CustomerProfile.objects.all()

        # Filter by tier
        tier = self.request.query_params.get('tier', None)
        if tier:
            queryset = queryset.filter(tier=tier)

        # Filter by VIP status
        is_vip = self.request.query_params.get('is_vip', None)
        if is_vip is not None:
            queryset = queryset.filter(is_vip=is_vip.lower() == 'true')

        # Search by email or phone
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(email__icontains=search) |
                Q(phone__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )

        return queryset.order_by('-lifetime_spent', '-lifetime_visits')

    @action(detail=True, methods=['post'])
    def award_points(self, request, pk=None):
        """
        Award loyalty points to a customer

        POST body:
        {
            "points": 100,
            "reason": "Reservation completed"
        }
        """
        customer = self.get_object()
        points = request.data.get('points')
        reason = request.data.get('reason', '')

        if not points or not isinstance(points, int) or points <= 0:
            return Response(
                {'error': 'Valid points amount is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Award points
        customer.points += points
        customer.save()

        return Response({
            'message': f'{points} points awarded successfully',
            'total_points': customer.points,
            'reason': reason
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def redeem_points(self, request, pk=None):
        """
        Redeem loyalty points

        POST body:
        {
            "points": 500,
            "reason": "Discount applied"
        }
        """
        customer = self.get_object()
        points = request.data.get('points')
        reason = request.data.get('reason', '')

        if not points or not isinstance(points, int) or points <= 0:
            return Response(
                {'error': 'Valid points amount is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if customer.points < points:
            return Response(
                {'error': f'Insufficient points. Customer has {customer.points} points.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Redeem points
        customer.points -= points
        customer.save()

        return Response({
            'message': f'{points} points redeemed successfully',
            'remaining_points': customer.points,
            'reason': reason
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def update_tier(self, request, pk=None):
        """
        Update customer tier based on lifetime spending

        Tier rules:
        - Regular: < $500
        - Silver: $500 - $1,499
        - Gold: $1,500 - $4,999
        - Platinum: $5,000 - $9,999
        - VIP: $10,000+
        """
        customer = self.get_object()

        # Calculate tier based on lifetime spending
        if customer.lifetime_spent >= 10000:
            new_tier = 'vip'
            customer.is_vip = True
        elif customer.lifetime_spent >= 5000:
            new_tier = 'platinum'
        elif customer.lifetime_spent >= 1500:
            new_tier = 'gold'
        elif customer.lifetime_spent >= 500:
            new_tier = 'silver'
        else:
            new_tier = 'regular'

        old_tier = customer.tier
        customer.tier = new_tier
        customer.save()

        return Response({
            'message': 'Tier updated successfully',
            'old_tier': old_tier,
            'new_tier': new_tier,
            'lifetime_spent': customer.lifetime_spent
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def reservations(self, request, pk=None):
        """
        Get customer's reservation history
        """
        customer = self.get_object()

        # Get reservations matching customer's email or phone
        reservations = Reservation.objects.filter(
            Q(email=customer.email) | Q(phone=customer.phone)
        ).order_by('-date', '-time')

        # Import serializer here to avoid circular import
        from ..serializers import ReservationSerializer
        serializer = ReservationSerializer(reservations, many=True, context={'request': request})

        return Response({
            'customer': CustomerProfileSerializer(customer).data,
            'reservations': serializer.data,
            'total_reservations': reservations.count()
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def offers(self, request, pk=None):
        """
        Get available offers for a customer based on their tier
        """
        customer = self.get_object()
        today = timezone.now().date()

        # Get active offers
        offers = Offer.objects.filter(
            is_active=True,
            start_date__lte=today,
            end_date__gte=today
        ).filter(
            Q(max_uses_total__isnull=True) |
            Q(max_uses_total__gt=Q(current_uses=0))
        )

        serializer = OfferSerializer(offers, many=True, context={'request': request})

        return Response({
            'customer': CustomerProfileSerializer(customer).data,
            'offers': serializer.data,
            'count': offers.count()
        }, status=status.HTTP_200_OK)


class VIPMembershipViewSet(viewsets.ModelViewSet):
    """
    ViewSet for VIP memberships
    """
    queryset = VIPMembership.objects.all()
    serializer_class = VIPMembershipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = VIPMembership.objects.select_related('customer').all()

        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by customer
        customer_id = self.request.query_params.get('customer', None)
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)

        return queryset.order_by('-start_date')

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a VIP membership"""
        membership = self.get_object()
        membership.status = 'active'
        membership.customer.is_vip = True
        membership.save()
        membership.customer.save()

        return Response({
            'message': 'VIP membership activated successfully',
            'membership': VIPMembershipSerializer(membership).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        """Suspend a VIP membership"""
        membership = self.get_object()
        membership.status = 'suspended'
        membership.customer.is_vip = False
        membership.save()
        membership.customer.save()

        return Response({
            'message': 'VIP membership suspended successfully',
            'membership': VIPMembershipSerializer(membership).data
        }, status=status.HTTP_200_OK)


class OfferViewSet(viewsets.ModelViewSet):
    """
    ViewSet for promotional offers
    """
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Offer.objects.all()

        # Filter by active status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        # Filter by offer type
        offer_type = self.request.query_params.get('offer_type', None)
        if offer_type:
            queryset = queryset.filter(offer_type=offer_type)

        # Filter by current validity
        valid_now = self.request.query_params.get('valid_now', None)
        if valid_now and valid_now.lower() == 'true':
            today = timezone.now().date()
            queryset = queryset.filter(
                is_active=True,
                start_date__lte=today,
                end_date__gte=today
            )

        return queryset.order_by('-start_date')

    @action(detail=True, methods=['post'])
    def redeem(self, request, pk=None):
        """
        Redeem an offer

        POST body:
        {
            "customer_id": "uuid",  // optional
            "reservation_id": "uuid"  // optional
        }
        """
        offer = self.get_object()

        # Check if offer is valid
        today = timezone.now().date()
        if not offer.is_active:
            return Response(
                {'error': 'Offer is not active'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not (offer.start_date <= today <= offer.end_date):
            return Response(
                {'error': 'Offer is not currently valid'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check usage limits
        if offer.max_uses_total and offer.current_uses >= offer.max_uses_total:
            return Response(
                {'error': 'Offer has reached maximum usage limit'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Increment usage count
        offer.current_uses += 1
        offer.save()

        return Response({
            'message': 'Offer redeemed successfully',
            'offer': OfferSerializer(offer).data,
            'discount_amount': offer.discount_percentage if offer.offer_type == 'discount' else None
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def validate_promo_code(self, request, pk=None):
        """
        Validate a promo code without redeeming it

        POST body:
        {
            "promo_code": "SUMMER2024"
        }
        """
        promo_code = request.data.get('promo_code')

        if not promo_code:
            return Response(
                {'error': 'Promo code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            offer = Offer.objects.get(promo_code=promo_code, is_active=True)

            # Check validity
            today = timezone.now().date()
            is_valid = (offer.start_date <= today <= offer.end_date and
                       (offer.max_uses_total is None or offer.current_uses < offer.max_uses_total))

            return Response({
                'valid': is_valid,
                'offer': OfferSerializer(offer).data if is_valid else None,
                'message': 'Promo code is valid' if is_valid else 'Promo code is not currently valid'
            }, status=status.HTTP_200_OK)

        except Offer.DoesNotExist:
            return Response({
                'valid': False,
                'message': 'Invalid promo code'
            }, status=status.HTTP_404_NOT_FOUND)


class WaitlistViewSet(viewsets.ModelViewSet):
    """
    ViewSet for waitlist management
    """
    queryset = Waitlist.objects.all()
    serializer_class = WaitlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Waitlist.objects.select_related('customer').all()

        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by date (today by default for active waitlist)
        date_filter = self.request.query_params.get('date', None)
        if date_filter == 'today' or (status_filter == 'waiting' and not date_filter):
            today = timezone.now().date()
            queryset = queryset.filter(created_at__date=today)

        return queryset.order_by('position', 'created_at')

    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current active waitlist"""
        today = timezone.now().date()
        waitlist = self.get_queryset().filter(
            status='waiting',
            created_at__date=today
        )

        serializer = self.get_serializer(waitlist, many=True)
        return Response({
            'waitlist': serializer.data,
            'count': waitlist.count()
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def seat(self, request, pk=None):
        """Mark a waitlist entry as seated"""
        waitlist_entry = self.get_object()
        waitlist_entry.status = 'seated'
        waitlist_entry.save()

        # Update positions for remaining entries
        self._update_positions()

        return Response({
            'message': 'Guest seated successfully',
            'entry': WaitlistSerializer(waitlist_entry).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a waitlist entry"""
        waitlist_entry = self.get_object()
        waitlist_entry.status = 'cancelled'
        waitlist_entry.save()

        # Update positions for remaining entries
        self._update_positions()

        return Response({
            'message': 'Waitlist entry cancelled',
            'entry': WaitlistSerializer(waitlist_entry).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def update_wait_time(self, request, pk=None):
        """
        Update estimated wait time

        POST body:
        {
            "estimated_wait_minutes": 30
        }
        """
        waitlist_entry = self.get_object()
        estimated_wait_minutes = request.data.get('estimated_wait_minutes')

        if not estimated_wait_minutes or not isinstance(estimated_wait_minutes, int):
            return Response(
                {'error': 'Valid estimated_wait_minutes is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        waitlist_entry.estimated_wait_minutes = estimated_wait_minutes
        waitlist_entry.save()

        return Response({
            'message': 'Wait time updated',
            'entry': WaitlistSerializer(waitlist_entry).data
        }, status=status.HTTP_200_OK)

    def _update_positions(self):
        """Recalculate positions for waiting entries"""
        today = timezone.now().date()
        waiting_entries = Waitlist.objects.filter(
            status='waiting',
            created_at__date=today
        ).order_by('created_at')

        for index, entry in enumerate(waiting_entries, start=1):
            if entry.position != index:
                entry.position = index
                entry.save()
