# server/api/services/email_service.py
"""
Email service for sending OTP codes and reservation confirmations.
Supports multiple languages (Albanian/English).
"""

import logging
from django.conf import settings
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from typing import Optional

logger = logging.getLogger(__name__)


# Email templates for different languages
EMAIL_TEMPLATES = {
    'otp': {
        'sq': {
            'subject': 'Kodi i verifikimit per rezervimin tuaj - Bottle Brothers',
            'body': '''Pershendetje {name},

Kodi juaj i verifikimit eshte: {otp_code}

Ky kod skadon pas 15 minutash.

Nese nuk e keni bere kete kerkese, ju lutem injoroni kete email.

Me respekt,
Bottle Brothers
''',
        },
        'en': {
            'subject': 'Verification code for your reservation - Bottle Brothers',
            'body': '''Hello {name},

Your verification code is: {otp_code}

This code expires in 15 minutes.

If you did not make this request, please ignore this email.

Best regards,
Bottle Brothers
''',
        },
    },
    'confirmation': {
        'sq': {
            'subject': 'Konfirmimi i rezervimit - Bottle Brothers',
            'body': '''Pershendetje {name},

Rezervimi juaj eshte konfirmuar!

Detajet:
- Data: {date}
- Ora: {time}
- Numri i personave: {party_size}
- Kodi i rezervimit: {verification_code}

Ju lutem ruajeni kete kod per te pare ose modifikuar rezervimin tuaj.

Per te pare rezervimin tuaj, vizitoni:
{lookup_url}

Presim me padurim t'ju shohim!

Me respekt,
Bottle Brothers
''',
        },
        'en': {
            'subject': 'Reservation Confirmation - Bottle Brothers',
            'body': '''Hello {name},

Your reservation has been confirmed!

Details:
- Date: {date}
- Time: {time}
- Party size: {party_size}
- Reservation code: {verification_code}

Please save this code to view or modify your reservation.

To view your reservation, visit:
{lookup_url}

We look forward to seeing you!

Best regards,
Bottle Brothers
''',
        },
    },
    'cancellation': {
        'sq': {
            'subject': 'Anulimi i rezervimit - Bottle Brothers',
            'body': '''Pershendetje {name},

Rezervimi juaj per daten {date} ne oren {time} eshte anuluar.

Nese keni ndonje pyetje, ju lutem na kontaktoni.

Me respekt,
Bottle Brothers
''',
        },
        'en': {
            'subject': 'Reservation Cancelled - Bottle Brothers',
            'body': '''Hello {name},

Your reservation for {date} at {time} has been cancelled.

If you have any questions, please contact us.

Best regards,
Bottle Brothers
''',
        },
    },
    'reminder': {
        'sq': {
            'subject': 'Kujtese: Rezervimi juaj neser - Bottle Brothers',
            'body': '''Pershendetje {name},

Ky eshte nje kujtese per rezervimin tuaj neser:

- Data: {date}
- Ora: {time}
- Numri i personave: {party_size}

Presim me padurim t'ju shohim!

Me respekt,
Bottle Brothers
''',
        },
        'en': {
            'subject': 'Reminder: Your reservation tomorrow - Bottle Brothers',
            'body': '''Hello {name},

This is a reminder for your reservation tomorrow:

- Date: {date}
- Time: {time}
- Party size: {party_size}

We look forward to seeing you!

Best regards,
Bottle Brothers
''',
        },
    },
}


def get_site_url():
    """Get the site URL from settings"""
    return getattr(settings, 'SITE_URL', 'http://localhost:3000')


def send_otp_email(
    email: str,
    name: str,
    otp_code: str,
    locale: str = 'sq'
) -> bool:
    """
    Send OTP verification email.

    Args:
        email: Recipient email address
        name: Recipient name
        otp_code: 6-digit OTP code
        locale: Language code ('sq' or 'en')

    Returns:
        bool: True if email was sent successfully
    """
    if locale not in ['sq', 'en']:
        locale = 'sq'

    template = EMAIL_TEMPLATES['otp'][locale]
    subject = template['subject']
    body = template['body'].format(
        name=name,
        otp_code=otp_code
    )

    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        logger.info(f"OTP email sent to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send OTP email to {email}: {e}")
        return False


def send_confirmation_email(
    reservation,
    locale: Optional[str] = None
) -> bool:
    """
    Send reservation confirmation email.

    Args:
        reservation: Reservation model instance
        locale: Override language (defaults to reservation.preferred_locale)

    Returns:
        bool: True if email was sent successfully
    """
    locale = locale or reservation.preferred_locale
    if locale not in ['sq', 'en']:
        locale = 'sq'

    site_url = get_site_url()
    lookup_url = f"{site_url}/{locale}/reservations/lookup?code={reservation.verification_code}"

    template = EMAIL_TEMPLATES['confirmation'][locale]
    subject = template['subject']
    body = template['body'].format(
        name=reservation.first_name,
        date=reservation.date.strftime('%d/%m/%Y'),
        time=reservation.time.strftime('%H:%M'),
        party_size=reservation.party_size,
        verification_code=reservation.verification_code,
        lookup_url=lookup_url,
    )

    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[reservation.email],
            fail_silently=False,
        )
        logger.info(f"Confirmation email sent to {reservation.email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send confirmation email to {reservation.email}: {e}")
        return False


def send_cancellation_email(
    reservation,
    locale: Optional[str] = None
) -> bool:
    """
    Send reservation cancellation email.

    Args:
        reservation: Reservation model instance
        locale: Override language

    Returns:
        bool: True if email was sent successfully
    """
    locale = locale or reservation.preferred_locale
    if locale not in ['sq', 'en']:
        locale = 'sq'

    template = EMAIL_TEMPLATES['cancellation'][locale]
    subject = template['subject']
    body = template['body'].format(
        name=reservation.first_name,
        date=reservation.date.strftime('%d/%m/%Y'),
        time=reservation.time.strftime('%H:%M'),
    )

    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[reservation.email],
            fail_silently=False,
        )
        logger.info(f"Cancellation email sent to {reservation.email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send cancellation email to {reservation.email}: {e}")
        return False


def send_reminder_email(
    reservation,
    locale: Optional[str] = None
) -> bool:
    """
    Send reservation reminder email.

    Args:
        reservation: Reservation model instance
        locale: Override language

    Returns:
        bool: True if email was sent successfully
    """
    locale = locale or reservation.preferred_locale
    if locale not in ['sq', 'en']:
        locale = 'sq'

    template = EMAIL_TEMPLATES['reminder'][locale]
    subject = template['subject']
    body = template['body'].format(
        name=reservation.first_name,
        date=reservation.date.strftime('%d/%m/%Y'),
        time=reservation.time.strftime('%H:%M'),
        party_size=reservation.party_size,
    )

    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[reservation.email],
            fail_silently=False,
        )
        logger.info(f"Reminder email sent to {reservation.email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send reminder email to {reservation.email}: {e}")
        return False
