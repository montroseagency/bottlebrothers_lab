# server/api/views/ClientPortalViews.py
"""
Client portal API views for user account management.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db import transaction
from rest_framework_simplejwt.tokens import RefreshToken

from ..models import UserProfile, Reservation, ClientConversation, ClientMessage
from ..serializers import ReservationSerializer


class UserProfileSerializer:
    """Inline serializer for UserProfile"""

    @staticmethod
    def serialize(profile):
        return {
            'id': str(profile.user.id),
            'username': profile.user.username,
            'email': profile.user.email,
            'first_name': profile.user.first_name,
            'last_name': profile.user.last_name,
            'full_name': profile.full_name,
            'phone': profile.phone,
            'preferred_locale': profile.preferred_locale,
            'marketing_opt_in': profile.marketing_opt_in,
            'email_verified': profile.email_verified,
            'vip_tier': profile.vip_tier,
            'loyalty_points': profile.loyalty_points,
            'created_at': profile.created_at.isoformat() if profile.created_at else None,
        }


@api_view(['POST'])
@permission_classes([AllowAny])
def client_register(request):
    """
    Register a new client account.

    Request body:
        - email: str
        - password: str
        - first_name: str
        - last_name: str
        - phone: str (optional)
        - preferred_locale: str ('sq' or 'en')
        - marketing_opt_in: bool (optional)
    """
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')
    first_name = request.data.get('first_name', '').strip()
    last_name = request.data.get('last_name', '').strip()
    phone = request.data.get('phone', '').strip()
    preferred_locale = request.data.get('preferred_locale', 'sq')
    marketing_opt_in = request.data.get('marketing_opt_in', False)

    # Validation
    if not email or not password or not first_name:
        return Response({
            'success': False,
            'message': 'Email, password, and first name are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    if len(password) < 8:
        return Response({
            'success': False,
            'message': 'Password must be at least 8 characters'
        }, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({
            'success': False,
            'message': 'An account with this email already exists'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            # Create user
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )

            # Create profile
            profile = UserProfile.objects.create(
                user=user,
                phone=phone,
                preferred_locale=preferred_locale,
                marketing_opt_in=marketing_opt_in
            )

            # Generate tokens
            refresh = RefreshToken.for_user(user)

            return Response({
                'success': True,
                'message': 'Account created successfully',
                'user': UserProfileSerializer.serialize(profile),
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({
            'success': False,
            'message': f'Registration failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def client_login(request):
    """
    Login to client account.

    Request body:
        - email: str
        - password: str
    """
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')

    if not email or not password:
        return Response({
            'success': False,
            'message': 'Email and password are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Try to authenticate with email as username first
    user = authenticate(username=email, password=password)

    # If that fails, try to find user by email and authenticate with their username
    if not user:
        try:
            user_by_email = User.objects.get(email__iexact=email)
            user = authenticate(username=user_by_email.username, password=password)
        except User.DoesNotExist:
            pass

    if not user:
        return Response({
            'success': False,
            'message': 'Invalid email or password'
        }, status=status.HTTP_401_UNAUTHORIZED)

    if not user.is_active:
        return Response({
            'success': False,
            'message': 'Account is disabled'
        }, status=status.HTTP_401_UNAUTHORIZED)

    # Get or create profile
    profile, _ = UserProfile.objects.get_or_create(user=user)

    # Generate tokens
    refresh = RefreshToken.for_user(user)

    return Response({
        'success': True,
        'message': 'Login successful',
        'user': UserProfileSerializer.serialize(profile),
        'tokens': {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def client_profile(request):
    """Get current user's profile"""
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    return Response({
        'success': True,
        'profile': UserProfileSerializer.serialize(profile)
    })


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_client_profile(request):
    """
    Update current user's profile.

    Request body (all optional):
        - first_name: str
        - last_name: str
        - phone: str
        - preferred_locale: str
        - marketing_opt_in: bool
    """
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    user = request.user

    # Update user fields
    if 'first_name' in request.data:
        user.first_name = request.data['first_name']
    if 'last_name' in request.data:
        user.last_name = request.data['last_name']
    user.save()

    # Update profile fields
    if 'phone' in request.data:
        profile.phone = request.data['phone']
    if 'preferred_locale' in request.data:
        profile.preferred_locale = request.data['preferred_locale']
    if 'marketing_opt_in' in request.data:
        profile.marketing_opt_in = request.data['marketing_opt_in']
    profile.save()

    return Response({
        'success': True,
        'message': 'Profile updated',
        'profile': UserProfileSerializer.serialize(profile)
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change user's password.

    Request body:
        - current_password: str
        - new_password: str
    """
    current_password = request.data.get('current_password', '')
    new_password = request.data.get('new_password', '')

    if not current_password or not new_password:
        return Response({
            'success': False,
            'message': 'Current and new passwords are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 8:
        return Response({
            'success': False,
            'message': 'New password must be at least 8 characters'
        }, status=status.HTTP_400_BAD_REQUEST)

    if not request.user.check_password(current_password):
        return Response({
            'success': False,
            'message': 'Current password is incorrect'
        }, status=status.HTTP_400_BAD_REQUEST)

    request.user.set_password(new_password)
    request.user.save()

    return Response({
        'success': True,
        'message': 'Password changed successfully'
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_reservations(request):
    """Get current user's reservations"""
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    filter_type = request.query_params.get('filter', 'all')

    if filter_type == 'upcoming':
        reservations = profile.get_upcoming_reservations()
    elif filter_type == 'past':
        reservations = profile.get_past_reservations()
    else:
        reservations = profile.get_reservations()

    return Response({
        'success': True,
        'reservations': ReservationSerializer(reservations, many=True).data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def link_reservation(request):
    """
    Link an existing reservation to the user's account.

    Request body:
        - verification_code: str
        - email: str (must match reservation email)
    """
    verification_code = request.data.get('verification_code', '').strip().upper()
    email = request.data.get('email', '').strip().lower()

    if not verification_code or not email:
        return Response({
            'success': False,
            'message': 'Verification code and email are required'
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

    if reservation.user and reservation.user != request.user:
        return Response({
            'success': False,
            'message': 'This reservation is already linked to another account'
        }, status=status.HTTP_400_BAD_REQUEST)

    reservation.user = request.user
    reservation.save()

    return Response({
        'success': True,
        'message': 'Reservation linked to your account',
        'reservation': ReservationSerializer(reservation).data
    })


# =============================================================================
# CLIENT MESSAGING API VIEWS
# =============================================================================

class ConversationSerializer:
    """Inline serializer for Conversation"""

    @staticmethod
    def serialize(conversation):
        last_message = conversation.last_message
        return {
            'id': str(conversation.id),
            'subject': conversation.subject,
            'status': conversation.status,
            'created_at': conversation.created_at.isoformat(),
            'updated_at': conversation.updated_at.isoformat(),
            'unread_count': conversation.unread_count,
            'last_message': MessageSerializer.serialize(last_message) if last_message else None,
        }


class MessageSerializer:
    """Inline serializer for Message"""

    @staticmethod
    def serialize(message):
        return {
            'id': str(message.id),
            'content': message.content,
            'sender_type': message.sender_type,
            'sender_name': message.sender_name,
            'is_read': message.is_read,
            'created_at': message.created_at.isoformat(),
        }


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def client_conversations(request):
    """
    GET: List all conversations for the authenticated user.
    POST: Create a new conversation.
    """
    if request.method == 'GET':
        conversations = ClientConversation.objects.filter(user=request.user)
        return Response({
            'success': True,
            'conversations': [ConversationSerializer.serialize(c) for c in conversations]
        })

    elif request.method == 'POST':
        subject = request.data.get('subject', '').strip()
        message_content = request.data.get('message', '').strip()

        if not subject or not message_content:
            return Response({
                'success': False,
                'message': 'Subject and message are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                # Create conversation
                conversation = ClientConversation.objects.create(
                    user=request.user,
                    subject=subject
                )

                # Create first message
                profile, _ = UserProfile.objects.get_or_create(user=request.user)
                ClientMessage.objects.create(
                    conversation=conversation,
                    content=message_content,
                    sender_type='client',
                    sender_name=profile.full_name or request.user.email
                )

                return Response({
                    'success': True,
                    'message': 'Conversation started',
                    'conversation': ConversationSerializer.serialize(conversation)
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to create conversation: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def conversation_messages(request, conversation_id):
    """
    GET: Get all messages in a conversation.
    POST: Add a new message to a conversation.
    """
    try:
        conversation = ClientConversation.objects.get(
            id=conversation_id,
            user=request.user
        )
    except ClientConversation.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Conversation not found'
        }, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        # Mark admin messages as read
        conversation.messages.filter(sender_type='admin', is_read=False).update(is_read=True)

        messages = conversation.messages.all()
        return Response({
            'success': True,
            'messages': [MessageSerializer.serialize(m) for m in messages]
        })

    elif request.method == 'POST':
        if conversation.status == 'closed':
            return Response({
                'success': False,
                'message': 'This conversation is closed'
            }, status=status.HTTP_400_BAD_REQUEST)

        content = request.data.get('content', '').strip()

        if not content:
            return Response({
                'success': False,
                'message': 'Message content is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            profile, _ = UserProfile.objects.get_or_create(user=request.user)
            message = ClientMessage.objects.create(
                conversation=conversation,
                content=content,
                sender_type='client',
                sender_name=profile.full_name or request.user.email
            )

            # Update conversation timestamp
            conversation.save()

            return Response({
                'success': True,
                'message': 'Message sent',
                'data': MessageSerializer.serialize(message)
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to send message: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =============================================================================
# ADMIN CLIENT MESSAGING API VIEWS
# =============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_client_conversations(request):
    """
    GET: List all client conversations for admin.
    Requires staff permission.
    """
    if not request.user.is_staff:
        return Response({
            'success': False,
            'message': 'Admin access required'
        }, status=status.HTTP_403_FORBIDDEN)

    conversations = ClientConversation.objects.all().select_related('user')

    result = []
    for conv in conversations:
        last_message = conv.messages.order_by('-created_at').first()
        unread_count = conv.messages.filter(sender_type='client', is_read=False).count()

        result.append({
            'id': str(conv.id),
            'subject': conv.subject,
            'status': conv.status,
            'created_at': conv.created_at.isoformat(),
            'updated_at': conv.updated_at.isoformat(),
            'unread_count': unread_count,
            'user_name': conv.user.get_full_name() or conv.user.username,
            'user_email': conv.user.email,
            'last_message': MessageSerializer.serialize(last_message) if last_message else None,
        })

    return Response({
        'success': True,
        'conversations': result
    })


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_conversation_messages(request, conversation_id):
    """
    GET: Get all messages in a conversation (admin view).
    POST: Send a reply as admin.
    """
    if not request.user.is_staff:
        return Response({
            'success': False,
            'message': 'Admin access required'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        conversation = ClientConversation.objects.get(id=conversation_id)
    except ClientConversation.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Conversation not found'
        }, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        # Mark client messages as read
        conversation.messages.filter(sender_type='client', is_read=False).update(is_read=True)

        messages = conversation.messages.all()
        return Response({
            'success': True,
            'messages': [MessageSerializer.serialize(m) for m in messages]
        })

    elif request.method == 'POST':
        content = request.data.get('content', '').strip()

        if not content:
            return Response({
                'success': False,
                'message': 'Message content is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            message = ClientMessage.objects.create(
                conversation=conversation,
                content=content,
                sender_type='admin',
                sender_name=request.user.get_full_name() or 'Admin'
            )

            # Update conversation timestamp and reopen if closed
            if conversation.status == 'closed':
                conversation.status = 'open'
            conversation.save()

            return Response({
                'success': True,
                'message': 'Reply sent',
                'data': MessageSerializer.serialize(message)
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to send reply: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def admin_close_conversation(request, conversation_id):
    """Close a conversation."""
    if not request.user.is_staff:
        return Response({
            'success': False,
            'message': 'Admin access required'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        conversation = ClientConversation.objects.get(id=conversation_id)
        conversation.status = 'closed'
        conversation.save()

        return Response({
            'success': True,
            'message': 'Conversation closed'
        })
    except ClientConversation.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Conversation not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def admin_reopen_conversation(request, conversation_id):
    """Reopen a closed conversation."""
    if not request.user.is_staff:
        return Response({
            'success': False,
            'message': 'Admin access required'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        conversation = ClientConversation.objects.get(id=conversation_id)
        conversation.status = 'open'
        conversation.save()

        return Response({
            'success': True,
            'message': 'Conversation reopened'
        })
    except ClientConversation.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Conversation not found'
        }, status=status.HTTP_404_NOT_FOUND)


# =============================================================================
# DIRECT CHAT API (WhatsApp-style - single support conversation)
# =============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_or_create_support_chat(request):
    """
    Get or create a single support conversation for the user.
    This creates a WhatsApp-style direct chat experience.
    """
    # Get or create a support conversation for this user
    conversation, created = ClientConversation.objects.get_or_create(
        user=request.user,
        subject='Support Chat',
        defaults={'status': 'open'}
    )

    # If conversation was closed, reopen it
    if conversation.status == 'closed':
        conversation.status = 'open'
        conversation.save()

    return Response({
        'success': True,
        'conversation': ConversationSerializer.serialize(conversation),
        'created': created
    })


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def support_chat_messages(request):
    """
    GET: Get all messages in the user's support chat.
    POST: Send a new message (auto-creates conversation if needed).
    """
    # Get or create support conversation
    conversation, _ = ClientConversation.objects.get_or_create(
        user=request.user,
        subject='Support Chat',
        defaults={'status': 'open'}
    )

    if request.method == 'GET':
        # Mark admin messages as read
        conversation.messages.filter(sender_type='admin', is_read=False).update(is_read=True)

        messages = conversation.messages.all().order_by('created_at')
        return Response({
            'success': True,
            'conversation_id': str(conversation.id),
            'messages': [MessageSerializer.serialize(m) for m in messages]
        })

    elif request.method == 'POST':
        content = request.data.get('content', '').strip()

        if not content:
            return Response({
                'success': False,
                'message': 'Message content is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Reopen if closed
            if conversation.status == 'closed':
                conversation.status = 'open'
                conversation.save()

            profile, _ = UserProfile.objects.get_or_create(user=request.user)
            message = ClientMessage.objects.create(
                conversation=conversation,
                content=content,
                sender_type='client',
                sender_name=profile.full_name or request.user.email
            )

            # Update conversation timestamp
            conversation.save()

            return Response({
                'success': True,
                'message': MessageSerializer.serialize(message)
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to send message: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
