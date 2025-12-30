# server/api/views/AuthViews.py
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone
from ..models import OTPVerification, CustomerProfile
from ..serializers import OTPVerificationSerializer, CustomerProfileSerializer
from ..services import SMSService


@api_view(['POST'])
@permission_classes([AllowAny])
def request_otp(request):
    """
    Request OTP for phone verification

    POST body:
    {
        "phone": "+1234567890"
    }
    """
    phone = request.data.get('phone')

    if not phone:
        return Response(
            {'error': 'Phone number is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate phone format (basic validation)
    if not phone.startswith('+') or len(phone) < 10:
        return Response(
            {'error': 'Invalid phone number format. Use international format (e.g., +1234567890)'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        sms_service = SMSService()
        otp = sms_service.generate_otp(phone)

        return Response({
            'message': 'OTP sent successfully',
            'phone': phone,
            'expires_at': otp.expires_at,
            'dev_mode': not sms_service.twilio_enabled,
            # Only include OTP in dev mode for testing
            'otp_code': otp.otp_code if not sms_service.twilio_enabled else None
        }, status=status.HTTP_200_OK)

    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to send OTP: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """
    Verify OTP code and optionally get or create customer profile

    POST body:
    {
        "phone": "+1234567890",
        "otp_code": "123456",
        "create_profile": true,  // optional
        "first_name": "John",    // required if create_profile=true
        "last_name": "Doe",      // required if create_profile=true
        "email": "john@example.com"  // required if create_profile=true
    }
    """
    phone = request.data.get('phone')
    otp_code = request.data.get('otp_code')
    create_profile = request.data.get('create_profile', False)

    if not phone or not otp_code:
        return Response(
            {'error': 'Phone number and OTP code are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        sms_service = SMSService()
        success, message, otp = sms_service.verify_otp(phone, otp_code)

        if not success:
            return Response(
                {'error': message},
                status=status.HTTP_400_BAD_REQUEST
            )

        response_data = {
            'message': message,
            'phone': phone,
            'verified': True
        }

        # If create_profile is requested, get or create customer profile
        if create_profile:
            first_name = request.data.get('first_name')
            last_name = request.data.get('last_name')
            email = request.data.get('email')

            if not all([first_name, last_name, email]):
                return Response(
                    {'error': 'first_name, last_name, and email are required when creating profile'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get or create customer profile
            customer, created = CustomerProfile.objects.get_or_create(
                phone=phone,
                defaults={
                    'first_name': first_name,
                    'last_name': last_name,
                    'email': email.lower()
                }
            )

            # If customer exists but email doesn't match, update it
            if not created and customer.email != email.lower():
                # Try to update email if provided email is not already in use
                if not CustomerProfile.objects.filter(email=email.lower()).exclude(id=customer.id).exists():
                    customer.email = email.lower()
                    customer.first_name = first_name
                    customer.last_name = last_name
                    customer.save()

            serializer = CustomerProfileSerializer(customer)
            response_data['customer'] = serializer.data
            response_data['customer_created'] = created

        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': f'Verification failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_otp(request):
    """
    Resend OTP to phone number

    POST body:
    {
        "phone": "+1234567890"
    }
    """
    phone = request.data.get('phone')

    if not phone:
        return Response(
            {'error': 'Phone number is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        sms_service = SMSService()
        otp = sms_service.resend_otp(phone)

        return Response({
            'message': 'OTP resent successfully',
            'phone': phone,
            'expires_at': otp.expires_at,
            'dev_mode': not sms_service.twilio_enabled,
            # Only include OTP in dev mode for testing
            'otp_code': otp.otp_code if not sms_service.twilio_enabled else None
        }, status=status.HTTP_200_OK)

    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to resend OTP: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class OTPVerificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for OTP verification records (admin only)
    """
    queryset = OTPVerification.objects.all()
    serializer_class = OTPVerificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = OTPVerification.objects.all()

        # Filter by phone
        phone = self.request.query_params.get('phone', None)
        if phone:
            queryset = queryset.filter(phone=phone)

        # Filter by verification status
        is_verified = self.request.query_params.get('is_verified', None)
        if is_verified is not None:
            queryset = queryset.filter(is_verified=is_verified.lower() == 'true')

        return queryset.order_by('-created_at')
