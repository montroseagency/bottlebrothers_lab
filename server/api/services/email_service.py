# server/api/services/email_service.py
"""
Email service for sending OTP codes and reservation confirmations.
Supports multiple languages (Albanian/English).
All emails use professional HTML templates.
"""

import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from typing import Optional

logger = logging.getLogger(__name__)

BRAND_COLOR = '#1a1a1a'
ACCENT_COLOR = '#c9a84c'
FROM_NAME = 'Sarajet Restaurant'


def _base_html(title: str, content: str) -> str:
    """Wrap content in a professional base email layout."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:{BRAND_COLOR};border-radius:12px 12px 0 0;padding:36px 40px;text-align:center;">
              <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:{ACCENT_COLOR};font-weight:600;">Fine Dining</p>
              <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:1px;">SARAJET</h1>
              <p style="margin:4px 0 0 0;font-size:12px;color:#888888;letter-spacing:2px;text-transform:uppercase;">Restaurant</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:40px;border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;">
              {content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:{BRAND_COLOR};border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 8px 0;font-size:13px;color:#888888;">Questions? Contact us at</p>
              <a href="mailto:sarajetrestourant@gmail.com" style="color:{ACCENT_COLOR};text-decoration:none;font-size:13px;">sarajetrestourant@gmail.com</a>
              <p style="margin:16px 0 0 0;font-size:11px;color:#666666;">&copy; 2025 Sarajet Restaurant. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def _otp_content_sq(name: str, otp_code: str) -> str:
    return f"""
      <h2 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:{BRAND_COLOR};">Kodi i Verifikimit</h2>
      <p style="margin:0 0 24px 0;font-size:14px;color:#666666;border-bottom:1px solid #f0f0f0;padding-bottom:24px;">Konfirmoni rezervimin tuaj</p>

      <p style="margin:0 0 12px 0;font-size:15px;color:#333333;">Pershendetje <strong>{name}</strong>,</p>
      <p style="margin:0 0 28px 0;font-size:15px;color:#555555;line-height:1.6;">
        Per te konfirmuar rezervimin tuaj ne Sarajet Restaurant, perdorni kodin e meposhtëm:
      </p>

      <!-- OTP Code Box -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
        <tr>
          <td align="center">
            <div style="display:inline-block;background-color:#f8f5ee;border:2px dashed {ACCENT_COLOR};border-radius:12px;padding:20px 40px;">
              <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#999999;">Kodi juaj</p>
              <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:12px;color:{BRAND_COLOR};font-family:'Courier New',Courier,monospace;">{otp_code}</p>
            </div>
          </td>
        </tr>
      </table>

      <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background-color:#fff8f0;border-radius:8px;margin-bottom:24px;border-left:4px solid {ACCENT_COLOR};">
        <tr>
          <td style="font-size:13px;color:#555555;line-height:1.5;">
            &#9201; Ky kod <strong>skadon pas 15 minutash.</strong><br/>
            Nese nuk e keni bere kete kerkese, injoroni kete email.
          </td>
        </tr>
      </table>

      <p style="margin:0;font-size:13px;color:#999999;text-align:center;">Faleminderit qe zgjodhët Sarajet Restaurant.</p>
    """


def _otp_content_en(name: str, otp_code: str) -> str:
    return f"""
      <h2 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:{BRAND_COLOR};">Verification Code</h2>
      <p style="margin:0 0 24px 0;font-size:14px;color:#666666;border-bottom:1px solid #f0f0f0;padding-bottom:24px;">Confirm your reservation</p>

      <p style="margin:0 0 12px 0;font-size:15px;color:#333333;">Hello <strong>{name}</strong>,</p>
      <p style="margin:0 0 28px 0;font-size:15px;color:#555555;line-height:1.6;">
        To confirm your reservation at Sarajet Restaurant, please use the verification code below:
      </p>

      <!-- OTP Code Box -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
        <tr>
          <td align="center">
            <div style="display:inline-block;background-color:#f8f5ee;border:2px dashed {ACCENT_COLOR};border-radius:12px;padding:20px 40px;">
              <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#999999;">Your code</p>
              <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:12px;color:{BRAND_COLOR};font-family:'Courier New',Courier,monospace;">{otp_code}</p>
            </div>
          </td>
        </tr>
      </table>

      <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background-color:#fff8f0;border-radius:8px;margin-bottom:24px;border-left:4px solid {ACCENT_COLOR};">
        <tr>
          <td style="font-size:13px;color:#555555;line-height:1.5;">
            &#9201; This code <strong>expires in 15 minutes.</strong><br/>
            If you did not make this request, please ignore this email.
          </td>
        </tr>
      </table>

      <p style="margin:0;font-size:13px;color:#999999;text-align:center;">Thank you for choosing Sarajet Restaurant.</p>
    """


def _confirmation_content_sq(name: str, date: str, time: str, party_size: int,
                               verification_code: str, lookup_url: str) -> str:
    return f"""
      <h2 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:{BRAND_COLOR};">Rezervimi u Konfirmua!</h2>
      <p style="margin:0 0 24px 0;font-size:14px;color:#666666;border-bottom:1px solid #f0f0f0;padding-bottom:24px;">Shihemi se shpejti</p>

      <p style="margin:0 0 20px 0;font-size:15px;color:#333333;">Pershendetje <strong>{name}</strong>,</p>
      <p style="margin:0 0 28px 0;font-size:15px;color:#555555;line-height:1.6;">
        Rezervimi juaj ne <strong>Sarajet Restaurant</strong> eshte konfirmuar me sukses. Ja detajet:
      </p>

      <!-- Reservation Details -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;border-radius:10px;overflow:hidden;border:1px solid #e8e8e8;">
        <tr style="background-color:{BRAND_COLOR};">
          <td colspan="2" style="padding:14px 20px;">
            <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:{ACCENT_COLOR};font-weight:600;">Detajet e Rezervimit</p>
          </td>
        </tr>
        <tr style="background-color:#fafafa;">
          <td style="padding:14px 20px;font-size:13px;color:#888888;font-weight:600;text-transform:uppercase;letter-spacing:1px;width:40%;border-bottom:1px solid #eeeeee;">Data</td>
          <td style="padding:14px 20px;font-size:15px;color:{BRAND_COLOR};font-weight:600;border-bottom:1px solid #eeeeee;">{date}</td>
        </tr>
        <tr>
          <td style="padding:14px 20px;font-size:13px;color:#888888;font-weight:600;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #eeeeee;">Ora</td>
          <td style="padding:14px 20px;font-size:15px;color:{BRAND_COLOR};font-weight:600;border-bottom:1px solid #eeeeee;">{time}</td>
        </tr>
        <tr style="background-color:#fafafa;">
          <td style="padding:14px 20px;font-size:13px;color:#888888;font-weight:600;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #eeeeee;">Persona</td>
          <td style="padding:14px 20px;font-size:15px;color:{BRAND_COLOR};font-weight:600;border-bottom:1px solid #eeeeee;">{party_size}</td>
        </tr>
        <tr>
          <td style="padding:14px 20px;font-size:13px;color:#888888;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Kodi</td>
          <td style="padding:14px 20px;font-size:18px;color:{ACCENT_COLOR};font-weight:800;letter-spacing:4px;font-family:'Courier New',Courier,monospace;">{verification_code}</td>
        </tr>
      </table>

      <p style="margin:0 0 16px 0;font-size:14px;color:#555555;">Ruajeni kodin tuaj te rezervimit. Do t'ju nevojitet per te pare ose modifikuar rezervimin.</p>

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
        <tr>
          <td align="center">
            <a href="{lookup_url}" style="display:inline-block;background-color:{ACCENT_COLOR};color:{BRAND_COLOR};text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;letter-spacing:0.5px;">
              Shiko Rezervimin Tim &rarr;
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:0;font-size:14px;color:#555555;line-height:1.7;text-align:center;">Presim me padurim t'ju shohim! &#127860;</p>
    """


def _confirmation_content_en(name: str, date: str, time: str, party_size: int,
                               verification_code: str, lookup_url: str) -> str:
    return f"""
      <h2 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:{BRAND_COLOR};">Reservation Confirmed!</h2>
      <p style="margin:0 0 24px 0;font-size:14px;color:#666666;border-bottom:1px solid #f0f0f0;padding-bottom:24px;">We look forward to seeing you</p>

      <p style="margin:0 0 20px 0;font-size:15px;color:#333333;">Hello <strong>{name}</strong>,</p>
      <p style="margin:0 0 28px 0;font-size:15px;color:#555555;line-height:1.6;">
        Your reservation at <strong>Sarajet Restaurant</strong> has been confirmed. Here are your details:
      </p>

      <!-- Reservation Details -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;border-radius:10px;overflow:hidden;border:1px solid #e8e8e8;">
        <tr style="background-color:{BRAND_COLOR};">
          <td colspan="2" style="padding:14px 20px;">
            <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:{ACCENT_COLOR};font-weight:600;">Reservation Details</p>
          </td>
        </tr>
        <tr style="background-color:#fafafa;">
          <td style="padding:14px 20px;font-size:13px;color:#888888;font-weight:600;text-transform:uppercase;letter-spacing:1px;width:40%;border-bottom:1px solid #eeeeee;">Date</td>
          <td style="padding:14px 20px;font-size:15px;color:{BRAND_COLOR};font-weight:600;border-bottom:1px solid #eeeeee;">{date}</td>
        </tr>
        <tr>
          <td style="padding:14px 20px;font-size:13px;color:#888888;font-weight:600;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #eeeeee;">Time</td>
          <td style="padding:14px 20px;font-size:15px;color:{BRAND_COLOR};font-weight:600;border-bottom:1px solid #eeeeee;">{time}</td>
        </tr>
        <tr style="background-color:#fafafa;">
          <td style="padding:14px 20px;font-size:13px;color:#888888;font-weight:600;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #eeeeee;">Guests</td>
          <td style="padding:14px 20px;font-size:15px;color:{BRAND_COLOR};font-weight:600;border-bottom:1px solid #eeeeee;">{party_size}</td>
        </tr>
        <tr>
          <td style="padding:14px 20px;font-size:13px;color:#888888;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Code</td>
          <td style="padding:14px 20px;font-size:18px;color:{ACCENT_COLOR};font-weight:800;letter-spacing:4px;font-family:'Courier New',Courier,monospace;">{verification_code}</td>
        </tr>
      </table>

      <p style="margin:0 0 16px 0;font-size:14px;color:#555555;">Save your reservation code. You will need it to view or modify your booking.</p>

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
        <tr>
          <td align="center">
            <a href="{lookup_url}" style="display:inline-block;background-color:{ACCENT_COLOR};color:{BRAND_COLOR};text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;letter-spacing:0.5px;">
              View My Reservation &rarr;
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:0;font-size:14px;color:#555555;line-height:1.7;text-align:center;">We look forward to welcoming you! &#127860;</p>
    """


def _cancellation_content(name: str, date: str, time: str, locale: str) -> str:
    if locale == 'sq':
        return f"""
          <h2 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:{BRAND_COLOR};">Rezervimi u Anulua</h2>
          <p style="margin:0 0 24px 0;font-size:14px;color:#666666;border-bottom:1px solid #f0f0f0;padding-bottom:24px;">Jemi keq per kete</p>
          <p style="margin:0 0 16px 0;font-size:15px;color:#333333;">Pershendetje <strong>{name}</strong>,</p>
          <p style="margin:0 0 24px 0;font-size:15px;color:#555555;line-height:1.6;">
            Rezervimi juaj per daten <strong>{date}</strong> ne oren <strong>{time}</strong> eshte anuluar.
          </p>
          <p style="margin:0 0 8px 0;font-size:14px;color:#555555;">Nese keni ndonje pyetje, na kontaktoni:</p>
          <p style="margin:0;font-size:14px;"><a href="mailto:sarajetrestourant@gmail.com" style="color:{ACCENT_COLOR};">sarajetrestourant@gmail.com</a></p>
        """
    return f"""
      <h2 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:{BRAND_COLOR};">Reservation Cancelled</h2>
      <p style="margin:0 0 24px 0;font-size:14px;color:#666666;border-bottom:1px solid #f0f0f0;padding-bottom:24px;">We're sorry to see you go</p>
      <p style="margin:0 0 16px 0;font-size:15px;color:#333333;">Hello <strong>{name}</strong>,</p>
      <p style="margin:0 0 24px 0;font-size:15px;color:#555555;line-height:1.6;">
        Your reservation for <strong>{date}</strong> at <strong>{time}</strong> has been cancelled.
      </p>
      <p style="margin:0 0 8px 0;font-size:14px;color:#555555;">If you have any questions, please contact us:</p>
      <p style="margin:0;font-size:14px;"><a href="mailto:sarajetrestourant@gmail.com" style="color:{ACCENT_COLOR};">sarajetrestourant@gmail.com</a></p>
    """


def _reminder_content(name: str, date: str, time: str, party_size: int, locale: str) -> str:
    if locale == 'sq':
        return f"""
          <h2 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:{BRAND_COLOR};">Kujtese per Rezervimin</h2>
          <p style="margin:0 0 24px 0;font-size:14px;color:#666666;border-bottom:1px solid #f0f0f0;padding-bottom:24px;">Neser eshte dita juaj</p>
          <p style="margin:0 0 16px 0;font-size:15px;color:#333333;">Pershendetje <strong>{name}</strong>,</p>
          <p style="margin:0 0 28px 0;font-size:15px;color:#555555;">Ky eshte nje kujtese per rezervimin tuaj neser ne Sarajet Restaurant:</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;border-radius:10px;overflow:hidden;border:1px solid #e8e8e8;">
            <tr style="background-color:{BRAND_COLOR};">
              <td colspan="2" style="padding:14px 20px;"><p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:{ACCENT_COLOR};font-weight:600;">Detajet</p></td>
            </tr>
            <tr><td style="padding:14px 20px;font-size:13px;color:#888888;font-weight:600;width:40%;border-bottom:1px solid #eee;">DATA</td><td style="padding:14px 20px;font-size:15px;color:{BRAND_COLOR};font-weight:600;border-bottom:1px solid #eee;">{date}</td></tr>
            <tr style="background-color:#fafafa;"><td style="padding:14px 20px;font-size:13px;color:#888888;font-weight:600;border-bottom:1px solid #eee;">ORA</td><td style="padding:14px 20px;font-size:15px;color:{BRAND_COLOR};font-weight:600;border-bottom:1px solid #eee;">{time}</td></tr>
            <tr><td style="padding:14px 20px;font-size:13px;color:#888888;font-weight:600;">PERSONA</td><td style="padding:14px 20px;font-size:15px;color:{BRAND_COLOR};font-weight:600;">{party_size}</td></tr>
          </table>
          <p style="margin:0;font-size:14px;color:#555555;text-align:center;">Presim me padurim t'ju shohim! &#127860;</p>
        """
    return f"""
      <h2 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:{BRAND_COLOR};">Reservation Reminder</h2>
      <p style="margin:0 0 24px 0;font-size:14px;color:#666666;border-bottom:1px solid #f0f0f0;padding-bottom:24px;">See you tomorrow!</p>
      <p style="margin:0 0 16px 0;font-size:15px;color:#333333;">Hello <strong>{name}</strong>,</p>
      <p style="margin:0 0 28px 0;font-size:15px;color:#555555;">This is a reminder for your reservation tomorrow at Sarajet Restaurant:</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;border-radius:10px;overflow:hidden;border:1px solid #e8e8e8;">
        <tr style="background-color:{BRAND_COLOR};">
          <td colspan="2" style="padding:14px 20px;"><p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:{ACCENT_COLOR};font-weight:600;">Details</p></td>
        </tr>
        <tr><td style="padding:14px 20px;font-size:13px;color:#888888;font-weight:600;width:40%;border-bottom:1px solid #eee;">DATE</td><td style="padding:14px 20px;font-size:15px;color:{BRAND_COLOR};font-weight:600;border-bottom:1px solid #eee;">{date}</td></tr>
        <tr style="background-color:#fafafa;"><td style="padding:14px 20px;font-size:13px;color:#888888;font-weight:600;border-bottom:1px solid #eee;">TIME</td><td style="padding:14px 20px;font-size:15px;color:{BRAND_COLOR};font-weight:600;border-bottom:1px solid #eee;">{time}</td></tr>
        <tr><td style="padding:14px 20px;font-size:13px;color:#888888;font-weight:600;">GUESTS</td><td style="padding:14px 20px;font-size:15px;color:{BRAND_COLOR};font-weight:600;">{party_size}</td></tr>
      </table>
      <p style="margin:0;font-size:14px;color:#555555;text-align:center;">We look forward to welcoming you! &#127860;</p>
    """


def _send_html_email(subject: str, html_body: str, plain_body: str, to_email: str) -> bool:
    """Send an email with HTML and plain-text fallback."""
    from_email = f'{FROM_NAME} <{settings.EMAIL_HOST_USER}>'
    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=plain_body,
            from_email=from_email,
            to=[to_email],
        )
        msg.attach_alternative(html_body, 'text/html')
        msg.send(fail_silently=False)
        logger.info(f"Email '{subject}' sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False


def get_site_url():
    return getattr(settings, 'SITE_URL', 'http://localhost:3000')


def send_otp_email(email: str, name: str, otp_code: str, locale: str = 'sq') -> bool:
    if locale not in ['sq', 'en']:
        locale = 'sq'

    if locale == 'sq':
        subject = 'Kodi i verifikimit - Sarajet Restaurant'
        content = _otp_content_sq(name, otp_code)
        plain = f"Pershendetje {name},\n\nKodi juaj: {otp_code}\n\nSkadon pas 15 minutash.\n\nSarajet Restaurant"
    else:
        subject = 'Verification Code - Sarajet Restaurant'
        content = _otp_content_en(name, otp_code)
        plain = f"Hello {name},\n\nYour code: {otp_code}\n\nExpires in 15 minutes.\n\nSarajet Restaurant"

    html = _base_html(subject, content)
    return _send_html_email(subject, html, plain, email)


def send_confirmation_email(reservation, locale: Optional[str] = None) -> bool:
    locale = locale or getattr(reservation, 'preferred_locale', 'sq')
    if locale not in ['sq', 'en']:
        locale = 'sq'

    site_url = get_site_url()
    lookup_url = f"{site_url}/{locale}/reservations/lookup?code={reservation.verification_code}"
    date_str = reservation.date.strftime('%d/%m/%Y')
    time_str = reservation.time.strftime('%H:%M')

    if locale == 'sq':
        subject = 'Konfirmimi i rezervimit - Sarajet Restaurant'
        content = _confirmation_content_sq(
            reservation.first_name, date_str, time_str,
            reservation.party_size, reservation.verification_code, lookup_url
        )
        plain = (f"Pershendetje {reservation.first_name},\n\nRezervimi juaj eshte konfirmuar!\n"
                 f"Data: {date_str}\nOra: {time_str}\nPersona: {reservation.party_size}\n"
                 f"Kodi: {reservation.verification_code}\n\n{lookup_url}\n\nSarajet Restaurant")
    else:
        subject = 'Reservation Confirmed - Sarajet Restaurant'
        content = _confirmation_content_en(
            reservation.first_name, date_str, time_str,
            reservation.party_size, reservation.verification_code, lookup_url
        )
        plain = (f"Hello {reservation.first_name},\n\nYour reservation is confirmed!\n"
                 f"Date: {date_str}\nTime: {time_str}\nGuests: {reservation.party_size}\n"
                 f"Code: {reservation.verification_code}\n\n{lookup_url}\n\nSarajet Restaurant")

    html = _base_html(subject, content)
    return _send_html_email(subject, html, plain, reservation.email)


def send_cancellation_email(reservation, locale: Optional[str] = None) -> bool:
    locale = locale or getattr(reservation, 'preferred_locale', 'sq')
    if locale not in ['sq', 'en']:
        locale = 'sq'

    date_str = reservation.date.strftime('%d/%m/%Y')
    time_str = reservation.time.strftime('%H:%M')
    subject = ('Anulimi i rezervimit - Sarajet Restaurant' if locale == 'sq'
               else 'Reservation Cancelled - Sarajet Restaurant')
    content = _cancellation_content(reservation.first_name, date_str, time_str, locale)
    plain = (f"Pershendetje {reservation.first_name},\nRezervimi juaj per {date_str} ne oren {time_str} eshte anuluar.\nSarajet Restaurant"
             if locale == 'sq'
             else f"Hello {reservation.first_name},\nYour reservation for {date_str} at {time_str} has been cancelled.\nSarajet Restaurant")
    html = _base_html(subject, content)
    return _send_html_email(subject, html, plain, reservation.email)


def send_reminder_email(reservation, locale: Optional[str] = None) -> bool:
    locale = locale or getattr(reservation, 'preferred_locale', 'sq')
    if locale not in ['sq', 'en']:
        locale = 'sq'

    date_str = reservation.date.strftime('%d/%m/%Y')
    time_str = reservation.time.strftime('%H:%M')
    subject = ('Kujtese: Rezervimi juaj neser - Sarajet Restaurant' if locale == 'sq'
               else 'Reminder: Your reservation tomorrow - Sarajet Restaurant')
    content = _reminder_content(reservation.first_name, date_str, time_str, reservation.party_size, locale)
    plain = (f"Kujtese: Rezervimi juaj eshte neser {date_str} ne oren {time_str}.\nSarajet Restaurant"
             if locale == 'sq'
             else f"Reminder: Your reservation is tomorrow {date_str} at {time_str}.\nSarajet Restaurant")
    html = _base_html(subject, content)
    return _send_html_email(subject, html, plain, reservation.email)
