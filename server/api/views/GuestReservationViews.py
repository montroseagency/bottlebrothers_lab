# server/api/views/GuestReservationViews.py
"""
Guest reservation API views for public reservation flow with OTP verification.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone

from ..models import Reservation
from ..serializers import ReservationSerializer
from ..services.email_service import send_otp_email, send_confirmation_email


@api_view(['POST'])
@permission_classes([AllowAny])
def create_guest_reservation(request):
    """
    Create a guest reservation and send OTP for email verification.

    Request body:
        - first_name: str
        - last_name: str
        - email: str
        - phone: str
        - date: str (YYYY-MM-DD)
        - time: str (HH:MM)
        - party_size: int
        - occasion: str (optional)
        - special_requests: str (optional)
        - dietary_restrictions: str (optional)
        - preferred_locale: str ('sq' or 'en', default 'sq')

    Returns:
        - reservation_id: UUID
        - verification_code: str
        - message: str
    """
    data = request.data.copy()
    locale = data.get('preferred_locale', 'sq')

    # Create reservation with pending status
    serializer = ReservationSerializer(data=data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Save reservation (will generate verification code)
    reservation = serializer.save(
        status='pending',
        email_verified=False,
        preferred_locale=locale
    )

    # Generate and send OTP
    otp_code = reservation.generate_email_otp()
    reservation.save()

    # Send OTP email
    email_sent = send_otp_email(
        email=reservation.email,
        name=reservation.first_name,
        otp_code=otp_code,
        locale=locale
    )

    if not email_sent:
        return Response({
            'reservation_id': str(reservation.id),
            'verification_code': reservation.verification_code,
            'message': 'Reservation created but email could not be sent. Please contact us.',
            'email_sent': False
        }, status=status.HTTP_201_CREATED)

    return Response({
        'reservation_id': str(reservation.id),
        'verification_code': reservation.verification_code,
        'message': 'Reservation created. Please check your email for verification code.',
        'email_sent': True
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_reservation_otp(request):
    """
    Verify OTP code for a reservation.

    Request body:
        - reservation_id: UUID
        - otp_code: str (6 digits)

    Returns:
        - success: bool
        - message: str
        - reservation: object (if success)
    """
    reservation_id = request.data.get('reservation_id')
    otp_code = request.data.get('otp_code')

    if not reservation_id or not otp_code:
        return Response({
            'success': False,
            'message': 'reservation_id and otp_code are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        reservation = Reservation.objects.get(id=reservation_id)
    except Reservation.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Reservation not found'
        }, status=status.HTTP_404_NOT_FOUND)

    # Verify OTP
    success, message = reservation.verify_email_otp(otp_code)

    if not success:
        return Response({
            'success': False,
            'message': message
        }, status=status.HTTP_400_BAD_REQUEST)

    # Send confirmation email
    send_confirmation_email(reservation)

    return Response({
        'success': True,
        'message': message,
        'reservation': ReservationSerializer(reservation).data
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_reservation_otp(request):
    """
    Resend OTP code for a reservation.

    Request body:
        - reservation_id: UUID

    Returns:
        - success: bool
        - message: str
    """
    reservation_id = request.data.get('reservation_id')

    if not reservation_id:
        return Response({
            'success': False,
            'message': 'reservation_id is required'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        reservation = Reservation.objects.get(id=reservation_id)
    except Reservation.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Reservation not found'
        }, status=status.HTTP_404_NOT_FOUND)

    if reservation.email_verified:
        return Response({
            'success': False,
            'message': 'Email is already verified'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Generate new OTP
    otp_code = reservation.generate_email_otp()
    reservation.save()

    # Send OTP email
    email_sent = send_otp_email(
        email=reservation.email,
        name=reservation.first_name,
        otp_code=otp_code,
        locale=reservation.preferred_locale
    )

    if not email_sent:
        return Response({
            'success': False,
            'message': 'Failed to send email. Please try again.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({
        'success': True,
        'message': 'Verification code sent to your email'
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def lookup_reservation(request):
    """
    Look up a reservation by verification code and email.

    Request body:
        - verification_code: str
        - email: str

    Returns:
        - success: bool
        - reservation: object (if found)
    """
    verification_code = request.data.get('verification_code', '').strip().upper()
    email = request.data.get('email', '').strip().lower()

    if not verification_code or not email:
        return Response({
            'success': False,
            'message': 'verification_code and email are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        reservation = Reservation.objects.get(
            verification_code=verification_code,
            email__iexact=email
        )
    except Reservation.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Reservation not found. Please check your code and email.'
        }, status=status.HTTP_404_NOT_FOUND)

    return Response({
        'success': True,
        'reservation': ReservationSerializer(reservation).data
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def cancel_reservation(request):
    """
    Cancel a reservation by verification code and email.

    Request body:
        - verification_code: str
        - email: str

    Returns:
        - success: bool
        - message: str
    """
    verification_code = request.data.get('verification_code', '').strip().upper()
    email = request.data.get('email', '').strip().lower()

    if not verification_code or not email:
        return Response({
            'success': False,
            'message': 'verification_code and email are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        reservation = Reservation.objects.get(
            verification_code=verification_code,
            email__iexact=email
        )
    except Reservation.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Reservation not found'
        }, status=status.HTTP_404_NOT_FOUND)

    # Check if reservation can be cancelled
    if reservation.status in ['cancelled', 'completed', 'no_show']:
        return Response({
            'success': False,
            'message': f'Reservation cannot be cancelled (status: {reservation.status})'
        }, status=status.HTTP_400_BAD_REQUEST)

    if reservation.is_past_date:
        return Response({
            'success': False,
            'message': 'Cannot cancel past reservations'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Cancel the reservation
    reservation.status = 'cancelled'
    reservation.save()

    # Send cancellation email
    from ..services.email_service import send_cancellation_email
    send_cancellation_email(reservation)

    return Response({
        'success': True,
        'message': 'Reservation cancelled successfully'
    })
