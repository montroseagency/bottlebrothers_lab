# server/api/services/sms_service.py
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import random
import string
from ..models import SMSNotification, OTPVerification


class SMSService:
    """
    Service for sending SMS notifications via Twilio
    Handles OTP, reservation confirmations, and reminders
    """

    def __init__(self):
        self.twilio_account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', None)
        self.twilio_auth_token = getattr(settings, 'TWILIO_AUTH_TOKEN', None)
        self.twilio_phone_number = getattr(settings, 'TWILIO_PHONE_NUMBER', None)
        self.twilio_enabled = all([
            self.twilio_account_sid,
            self.twilio_auth_token,
            self.twilio_phone_number
        ])

        if self.twilio_enabled:
            try:
                from twilio.rest import Client
                self.client = Client(self.twilio_account_sid, self.twilio_auth_token)
            except ImportError:
                self.twilio_enabled = False
                self.client = None
        else:
            self.client = None

    def send_sms(self, phone, message, notification_type='general', reservation=None):
        """
        Send an SMS message

        Args:
            phone: Recipient phone number
            message: Message content
            notification_type: Type of notification (confirmation, reminder, otp, marketing)
            reservation: Related reservation object (optional)

        Returns:
            SMSNotification object
        """
        # Create notification record
        notification = SMSNotification.objects.create(
            recipient_phone=phone,
            message=message,
            notification_type=notification_type,
            reservation=reservation,
            status='pending'
        )

        if not self.twilio_enabled:
            # Development mode: just mark as sent
            notification.status = 'sent'
            notification.sent_at = timezone.now()
            notification.twilio_sid = f'DEV_{notification.id}'
            notification.save()
            print(f'[DEV MODE] SMS to {phone}: {message}')
            return notification

        try:
            # Send via Twilio
            twilio_message = self.client.messages.create(
                body=message,
                from_=self.twilio_phone_number,
                to=phone
            )

            # Update notification
            notification.status = 'sent'
            notification.twilio_sid = twilio_message.sid
            notification.sent_at = timezone.now()
            notification.save()

        except Exception as e:
            # Handle error
            notification.status = 'failed'
            notification.error_message = str(e)
            notification.save()

        return notification

    def send_reservation_confirmation(self, reservation):
        """
        Send reservation confirmation SMS

        Args:
            reservation: Reservation object
        """
        message = (
            f"Hi {reservation.first_name}! Your reservation at Bottle Brothers is confirmed for "
            f"{reservation.date.strftime('%B %d, %Y')} at {reservation.time.strftime('%I:%M %p')}. "
            f"Party of {reservation.party_size}. "
            f"Reservation ID: {str(reservation.id)[:8]}. "
            f"See you soon!"
        )

        return self.send_sms(
            phone=reservation.phone,
            message=message,
            notification_type='confirmation',
            reservation=reservation
        )

    def send_reservation_reminder(self, reservation, hours_before=2):
        """
        Send reservation reminder SMS

        Args:
            reservation: Reservation object
            hours_before: Hours before reservation time
        """
        message = (
            f"Reminder: Your reservation at Bottle Brothers is in {hours_before} hours! "
            f"{reservation.date.strftime('%B %d')} at {reservation.time.strftime('%I:%M %p')}. "
            f"Party of {reservation.party_size}. "
            f"Looking forward to seeing you!"
        )

        return self.send_sms(
            phone=reservation.phone,
            message=message,
            notification_type='reminder',
            reservation=reservation
        )

    def send_reservation_cancellation(self, reservation):
        """
        Send reservation cancellation SMS

        Args:
            reservation: Reservation object
        """
        message = (
            f"Your reservation at Bottle Brothers for {reservation.date.strftime('%B %d, %Y')} "
            f"at {reservation.time.strftime('%I:%M %p')} has been cancelled. "
            f"We hope to see you again soon!"
        )

        return self.send_sms(
            phone=reservation.phone,
            message=message,
            notification_type='confirmation',
            reservation=reservation
        )

    def generate_otp(self, phone, expires_in_minutes=10):
        """
        Generate and send OTP code

        Args:
            phone: Phone number to send OTP to
            expires_in_minutes: How long the OTP is valid (default: 10 minutes)

        Returns:
            OTPVerification object
        """
        # Generate 6-digit OTP
        otp_code = ''.join(random.choices(string.digits, k=6))

        # Set expiration time
        expires_at = timezone.now() + timedelta(minutes=expires_in_minutes)

        # Invalidate any previous OTPs for this phone
        OTPVerification.objects.filter(
            phone=phone,
            is_verified=False
        ).update(is_verified=True)  # Mark as verified to prevent reuse

        # Create new OTP
        otp = OTPVerification.objects.create(
            phone=phone,
            otp_code=otp_code,
            expires_at=expires_at
        )

        # Send OTP via SMS
        message = (
            f"Your Bottle Brothers verification code is: {otp_code}. "
            f"Valid for {expires_in_minutes} minutes. "
            f"Do not share this code with anyone."
        )

        self.send_sms(
            phone=phone,
            message=message,
            notification_type='otp'
        )

        return otp

    def verify_otp(self, phone, otp_code):
        """
        Verify OTP code

        Args:
            phone: Phone number
            otp_code: OTP code to verify

        Returns:
            tuple: (success: bool, message: str, otp: OTPVerification or None)
        """
        try:
            # Find the most recent unverified OTP for this phone
            otp = OTPVerification.objects.filter(
                phone=phone,
                is_verified=False
            ).order_by('-created_at').first()

            if not otp:
                return False, 'No OTP found for this phone number', None

            # Check if OTP has expired
            if timezone.now() > otp.expires_at:
                return False, 'OTP has expired', None

            # Check if too many attempts
            if otp.attempts >= 3:
                return False, 'Too many verification attempts', None

            # Increment attempts
            otp.attempts += 1
            otp.save()

            # Verify code
            if otp.otp_code == otp_code:
                otp.is_verified = True
                otp.save()
                return True, 'OTP verified successfully', otp
            else:
                return False, 'Invalid OTP code', None

        except Exception as e:
            return False, f'Verification error: {str(e)}', None

    def resend_otp(self, phone):
        """
        Resend OTP to phone number

        Args:
            phone: Phone number

        Returns:
            OTPVerification object
        """
        # Check for recent OTPs to prevent spam
        recent_otp = OTPVerification.objects.filter(
            phone=phone,
            created_at__gte=timezone.now() - timedelta(minutes=1)
        ).first()

        if recent_otp:
            raise ValueError('Please wait before requesting a new OTP')

        # Generate new OTP
        return self.generate_otp(phone)

    def get_notification_history(self, phone=None, reservation=None, limit=10):
        """
        Get SMS notification history

        Args:
            phone: Filter by phone number
            reservation: Filter by reservation
            limit: Maximum number of records to return

        Returns:
            QuerySet of SMSNotification objects
        """
        queryset = SMSNotification.objects.all()

        if phone:
            queryset = queryset.filter(recipient_phone=phone)

        if reservation:
            queryset = queryset.filter(reservation=reservation)

        return queryset.order_by('-created_at')[:limit]
