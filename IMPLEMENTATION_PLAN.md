# Multilingual CMS Implementation Plan

## Executive Summary

This plan implements a production-grade multilingual system with admin-managed CMS features for the existing Next.js + Django application. The implementation is divided into 6 phases with clear deliverables.

---

## Current State Analysis

### What Already Exists:
- **i18n Setup**: i18next + react-i18next configured with `sq` and `en` locales
- **Translation Files**: `client/src/locales/en.json` and `sq.json` with UI translations
- **App Router**: Next.js 15 with `app/` directory structure
- **Admin Dashboard**: Full CRUD for Events, Menu, Gallery, Reservations
- **Django Backend**: REST API with JWT auth, SQLite database
- **Authentication**: Role-based with `is_staff` admin check

### What's Missing (To Implement):
1. URL-prefixed locale routing (`/sq/...`, `/en/...`)
2. Backend translation support for content (Events, Menu, Gallery, HomeSection)
3. Translation status tracking (Missing EN/SQ badges)
4. Draft/Publish workflow with translation checks
5. Auto-translate functionality
6. Guest reservation flow with OTP verification
7. Client portal with user accounts

---

## Phase 1: Locale-Prefixed URL Routing

### 1.1 Middleware for Locale Detection & Redirect
**File:** `client/middleware.ts`

```
Detection Priority:
1. URL prefix (/sq or /en) → use it
2. Cookie "site_locale" → redirect to that locale
3. Accept-Language header → match sq or en
4. Default → sq
```

**Logic:**
- All paths MUST have locale prefix
- `/about` → redirect to `/sq/about` or `/en/about`
- `/admin/*` routes are excluded (no locale prefix needed for admin)

### 1.2 Restructure App Directory
**Current:** `client/src/app/(public)/`
**New:** `client/src/app/[locale]/(public)/`

```
client/src/app/
├── [locale]/
│   ├── (public)/
│   │   ├── page.tsx          # Home
│   │   ├── events/
│   │   ├── menu/
│   │   ├── gallery/
│   │   ├── contact/
│   │   └── reservations/
│   └── layout.tsx            # Sets <html lang={locale}>
├── admin/                     # Keep admin WITHOUT locale prefix
│   ├── dashboard/
│   ├── events/
│   └── ...
└── layout.tsx                 # Root layout
```

### 1.3 Language Switcher Component
**File:** `client/src/components/ui/LanguageSwitcher.tsx`

- Toggle button: SQ | EN
- On click:
  - Set cookie `site_locale` (1 year expiry)
  - Navigate to same path with new locale prefix
  - Example: `/sq/events` → `/en/events`

### 1.4 Update i18n Configuration
**File:** `client/src/i18n.ts`

- Remove browser language detector for SSR
- Add server-side locale detection from URL
- Create `getLocaleFromPath()` utility

### 1.5 Add hreflang Tags
**File:** `client/src/app/[locale]/layout.tsx`

```html
<link rel="alternate" hreflang="sq" href="https://site.com/sq/..." />
<link rel="alternate" hreflang="en" href="https://site.com/en/..." />
<link rel="alternate" hreflang="x-default" href="https://site.com/sq/..." />
```

---

## Phase 2: Backend Translation Support

### 2.1 Create Translation Models
**File:** `server/api/models.py`

```python
class ContentTranslation(models.Model):
    """Base model for translations"""
    locale = models.CharField(max_length=5)  # 'sq' or 'en'

class EventTranslation(models.Model):
    event = models.ForeignKey(Event, related_name='translations')
    locale = models.CharField(max_length=5)
    title = models.CharField(max_length=200)
    description = models.TextField()
    needs_review = models.BooleanField(default=False)  # For auto-translated content

class MenuItemTranslation(models.Model):
    menu_item = models.ForeignKey(MenuItem, related_name='translations')
    locale = models.CharField(max_length=5)
    name = models.CharField(max_length=200)
    description = models.TextField()
    needs_review = models.BooleanField(default=False)

class GalleryTranslation(models.Model):
    gallery_item = models.ForeignKey(GalleryItem, related_name='translations')
    locale = models.CharField(max_length=5)
    title = models.CharField(max_length=200)
    caption = models.TextField(blank=True)
    needs_review = models.BooleanField(default=False)

class HomeSectionTranslation(models.Model):
    section = models.ForeignKey(HomeSection, related_name='translations')
    locale = models.CharField(max_length=5)
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=300, blank=True)
    body = models.TextField(blank=True)
    cta_text = models.CharField(max_length=100, blank=True)
    needs_review = models.BooleanField(default=False)
```

### 2.2 Add HomeSection Model
**File:** `server/api/models.py`

```python
class HomeSection(models.Model):
    SECTION_TYPES = [
        ('hero', 'Hero Banner'),
        ('feature', 'Feature Block'),
        ('banner', 'Promotional Banner'),
        ('text', 'Text Section'),
    ]

    section_type = models.CharField(max_length=20, choices=SECTION_TYPES)
    display_order = models.IntegerField(default=0)
    image_url = models.URLField(blank=True)
    background_image = models.ImageField(upload_to='home/', blank=True)
    link_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=[
        ('draft', 'Draft'),
        ('published', 'Published')
    ], default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### 2.3 Add Status Fields to Existing Models
```python
# Add to Event, MenuItem, GalleryItem:
status = models.CharField(max_length=20, choices=[
    ('draft', 'Draft'),
    ('published', 'Published')
], default='draft')
translation_mode = models.CharField(max_length=20, choices=[
    ('complete', 'All translations required'),
    ('fallback', 'Allow fallback')
], default='fallback')
```

### 2.4 Update Serializers
**File:** `server/api/serializers.py`

```python
class EventSerializer(serializers.ModelSerializer):
    translations = EventTranslationSerializer(many=True, read_only=True)
    translation_status = serializers.SerializerMethodField()

    def get_translation_status(self, obj):
        locales = ['sq', 'en']
        existing = obj.translations.values_list('locale', flat=True)
        missing = [l for l in locales if l not in existing]
        return {
            'complete': len(missing) == 0,
            'missing': missing,
            'progress': f"{len(existing)}/{len(locales)}"
        }
```

### 2.5 Locale-Aware Public API
**File:** `server/api/views/PublicViews.py`

```python
# GET /api/public/{locale}/events/
class LocaleEventsView(APIView):
    def get(self, request, locale):
        events = Event.objects.filter(status='published')
        # Get translation for requested locale, fallback to sq if missing
        for event in events:
            translation = event.translations.filter(locale=locale).first()
            if not translation:
                translation = event.translations.filter(locale='sq').first()
            event.localized = translation
        return Response(EventLocalizedSerializer(events, many=True).data)
```

---

## Phase 3: Admin Translation Management

### 3.1 Translation Tabs in Edit Forms
**Components to Update:**
- `EventsManagement.tsx`
- `MenuManagement.tsx`
- `GalleryManagement.tsx`
- `HomeSectionManagement.tsx` (new)

**UI Pattern:**
```
┌─────────────────────────────────────────┐
│ Edit Event                              │
├─────────────────────────────────────────┤
│ [SQ] [EN]                    Tabs       │
├─────────────────────────────────────────┤
│ Title: _______________                  │
│ Description: _____________              │
│ [Auto-translate to EN →]   Button       │
│                                         │
│ ⚠ Auto-

translated — review required     │
└─────────────────────────────────────────┘
```

### 3.2 Translation Status Badges
**Component:** `TranslationStatusBadge.tsx`

```tsx
// Shows in list views
<Badge variant="warning">Missing EN</Badge>
<Badge variant="warning">Missing SQ</Badge>
<Badge variant="success">✓ Complete</Badge>
<Badge variant="info">Needs Review</Badge>
```

### 3.3 Publish Workflow
**Feature Flag:** `TRANSLATION_MODE` in `.env`
- `MODE_A` (premium): Cannot publish unless SQ+EN complete
- `MODE_B` (fast): Allow publish with fallback, show warning

**UI for Mode A:**
```
[Publish] button disabled
"Cannot publish: Missing EN translation"
```

**UI for Mode B:**
```
[Publish] button enabled
Modal: "Warning: EN translation missing. Visitors will see SQ text on /en pages."
[Cancel] [Publish Anyway]
```

### 3.4 Missing Translations Filter
Add to list views:
```
Filter: [All] [Missing SQ] [Missing EN] [Needs Review]
```

### 3.5 Audit Log (Minimal)
**Model:** `AuditLog`
```python
class AuditLog(models.Model):
    actor = models.ForeignKey(User)
    entity_type = models.CharField(max_length=50)  # 'event', 'menu_item', etc.
    entity_id = models.UUIDField()
    action = models.CharField(max_length=50)  # 'published', 'unpublished', 'translated'
    details = models.JSONField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
```

---

## Phase 4: Auto-Translate Feature

### 4.1 Translation Provider Interface
**File:** `server/api/services/translation_service.py`

```python
class TranslationProvider:
    def translate(self, text: str, source: str, target: str) -> dict:
        raise NotImplementedError

class LibreTranslateProvider(TranslationProvider):
    def __init__(self, url: str):
        self.url = url

    def translate(self, text: str, source: str, target: str) -> dict:
        response = requests.post(f"{self.url}/translate", json={
            "q": text,
            "source": source,
            "target": target,
            "format": "text"
        })
        return {"text": response.json()["translatedText"], "needs_review": True}

class CopyFallbackProvider(TranslationProvider):
    """Copies source text when no translation API available"""
    def translate(self, text: str, source: str, target: str) -> dict:
        return {"text": text, "needs_review": True, "is_copy": True}

def get_translation_provider() -> TranslationProvider:
    url = os.environ.get('SELF_HOSTED_TRANSLATE_URL')
    if url:
        return LibreTranslateProvider(url)
    return CopyFallbackProvider()
```

### 4.2 Auto-Translate API Endpoint
**Endpoint:** `POST /api/admin/auto-translate/`

```python
@api_view(['POST'])
@permission_classes([IsAdminUser])
def auto_translate(request):
    entity_type = request.data['entity_type']  # 'event', 'menu_item', etc.
    entity_id = request.data['entity_id']
    source_locale = request.data['source_locale']  # 'sq' or 'en'
    target_locale = request.data['target_locale']

    provider = get_translation_provider()
    # Get source translation, translate each field, save as target
    ...
    return Response({"success": True, "needs_review": True})
```

### 4.3 Frontend Button
```tsx
<Button onClick={handleAutoTranslate} disabled={translating}>
  {translating ? 'Translating...' : `Auto-translate to ${targetLocale.toUpperCase()}`}
</Button>

{needsReview && (
  <Alert variant="warning">
    ⚠ Auto-translated — review required
  </Alert>
)}
```

---

## Phase 5: Guest Reservation Flow with OTP

### 5.1 Update Reservation Model
```python
class Reservation(models.Model):
    # Existing fields...

    # New fields
    verification_code = models.CharField(max_length=10, unique=True)  # For lookup
    email_verified = models.BooleanField(default=False)
    otp_code = models.CharField(max_length=6, blank=True)
    otp_expires_at = models.DateTimeField(null=True, blank=True)
    preferred_locale = models.CharField(max_length=5, default='sq')
    user = models.ForeignKey(User, null=True, blank=True)  # Optional link to account

    def generate_verification_code(self):
        self.verification_code = ''.join(random.choices('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', k=8))
```

### 5.2 Reservation Flow (Guest-First)
```
1. Guest enters: name, email (or phone), date, time, party_size
2. System sends OTP to email
3. Guest enters OTP on verification page
4. If valid:
   - Reservation confirmed
   - Confirmation email sent (in preferred_locale)
   - Show confirmation page with verification_code
5. Guest can optionally create account to save reservation
```

### 5.3 OTP Email Service
**File:** `server/api/services/email_service.py`

```python
def send_otp_email(email: str, otp: str, locale: str):
    subject = {
        'sq': 'Kodi i verifikimit për rezervimin tuaj',
        'en': 'Verification code for your reservation'
    }[locale]

    body = {
        'sq': f'Kodi juaj i verifikimit është: {otp}',
        'en': f'Your verification code is: {otp}'
    }[locale]

    send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [email])

def send_confirmation_email(reservation: Reservation):
    locale = reservation.preferred_locale
    # Send confirmation with reservation details in correct language
```

### 5.4 Find My Reservation Page
**Route:** `/[locale]/reservations/lookup`

```tsx
// User enters: verification_code + email
// System returns reservation details
// User can view status, cancel (if allowed), or modify (if allowed)
```

### 5.5 API Endpoints
```
POST /api/reservations/guest/          # Create guest reservation
POST /api/reservations/verify-otp/     # Verify OTP
POST /api/reservations/resend-otp/     # Resend OTP
GET  /api/reservations/lookup/         # Find by code + email
POST /api/reservations/link-account/   # Link reservation to user account
```

---

## Phase 6: Client Portal

### 6.1 User Model Extension
```python
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    preferred_locale = models.CharField(max_length=5, default='sq')
    phone = models.CharField(max_length=20, blank=True)
    marketing_opt_in = models.BooleanField(default=False)

class VIPMembership(models.Model):
    TIERS = [
        ('bronze', 'Bronze'),
        ('silver', 'Silver'),
        ('gold', 'Gold'),
        ('platinum', 'Platinum'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    tier = models.CharField(max_length=20, choices=TIERS, default='bronze')
    points = models.IntegerField(default=0)
    joined_at = models.DateTimeField(auto_now_add=True)
```

### 6.2 Client Portal Routes
```
/[locale]/account/
├── login              # Email + password login
├── register           # Account registration
├── profile            # Edit name, locale, marketing opt-in
├── reservations       # Reservation history
├── vip                # VIP tier status (placeholder)
└── favorites          # Favorite menu items (optional)
```

### 6.3 Client Portal Components
- `ClientLayout.tsx` - Portal wrapper with sidebar
- `ReservationHistory.tsx` - List past/upcoming reservations
- `ProfileForm.tsx` - Edit profile settings
- `VIPStatus.tsx` - Show current tier and benefits

### 6.4 Role-Based Access
```
Roles:
- user: Regular customer (can access client portal)
- content_editor: Can edit content, cannot change settings
- manager: Can manage content + reservations
- admin: Full access

Implement with Django groups + permissions
```

---

## File Tree Changes

```
client/
├── middleware.ts                           # NEW: Locale detection & redirect
├── src/
│   ├── app/
│   │   ├── [locale]/                       # NEW: Locale segment
│   │   │   ├── layout.tsx                  # NEW: Sets html lang
│   │   │   ├── (public)/
│   │   │   │   ├── page.tsx               # MOVE from (public)/
│   │   │   │   ├── events/                # MOVE
│   │   │   │   ├── menu/                  # MOVE
│   │   │   │   ├── gallery/               # MOVE
│   │   │   │   ├── contact/               # MOVE
│   │   │   │   └── reservations/          # MOVE + UPDATE
│   │   │   │       ├── page.tsx
│   │   │   │       ├── confirmation/
│   │   │   │       └── lookup/            # NEW
│   │   │   └── account/                   # NEW: Client portal
│   │   │       ├── page.tsx
│   │   │       ├── login/
│   │   │       ├── register/
│   │   │       ├── profile/
│   │   │       ├── reservations/
│   │   │       └── vip/
│   │   └── admin/                         # KEEP without locale
│   │       ├── home-sections/             # NEW
│   │       └── ...
│   ├── components/
│   │   ├── ui/
│   │   │   ├── LanguageSwitcher.tsx       # NEW
│   │   │   └── TranslationStatusBadge.tsx # NEW
│   │   ├── admin/
│   │   │   ├── TranslationTabs.tsx        # NEW
│   │   │   ├── HomeSectionManagement.tsx  # NEW
│   │   │   └── PublishButton.tsx          # NEW
│   │   └── account/                       # NEW: Client portal components
│   │       ├── ClientLayout.tsx
│   │       ├── ReservationHistory.tsx
│   │       ├── ProfileForm.tsx
│   │       └── VIPStatus.tsx
│   ├── lib/
│   │   ├── locale.ts                      # NEW: Locale utilities
│   │   └── api/
│   │       └── translations.ts            # NEW: Translation API calls
│   └── i18n.ts                            # UPDATE: SSR-safe config
│
server/
├── api/
│   ├── models.py                          # UPDATE: Add translation models
│   ├── serializers.py                     # UPDATE: Add translation serializers
│   ├── urls.py                            # UPDATE: Add new routes
│   ├── views/
│   │   ├── PublicViews.py                 # NEW: Locale-aware public endpoints
│   │   ├── TranslationViews.py            # NEW: Auto-translate endpoint
│   │   └── ClientViews.py                 # NEW: Client portal endpoints
│   └── services/
│       ├── translation_service.py         # NEW
│       └── email_service.py               # UPDATE: Add OTP emails
└── .env                                   # UPDATE: Add TRANSLATION_MODE, SELF_HOSTED_TRANSLATE_URL
```

---

## Environment Variables

```env
# Translation Mode
TRANSLATION_MODE=MODE_B                    # MODE_A (strict) or MODE_B (fallback)
SELF_HOSTED_TRANSLATE_URL=                 # Optional: LibreTranslate URL

# Email (for OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=noreply@bottlebrothers.com
```

---

## Migration Steps

```bash
# 1. Create Django migrations
cd server
python manage.py makemigrations
python manage.py migrate

# 2. Create translation entries for existing content
python manage.py shell
>>> from api.models import Event, EventTranslation
>>> for event in Event.objects.all():
...     EventTranslation.objects.create(
...         event=event,
...         locale='sq',
...         title=event.title,
...         description=event.description
...     )

# 3. Run Next.js dev server
cd client
npm run dev

# 4. Test locale routing
# Visit http://localhost:3000 → should redirect to /sq
# Visit http://localhost:3000/en/events → should show English UI
```

---

## Implementation Order

1. **Phase 1**: Locale routing ✅ COMPLETED
   - ✅ Middleware for locale detection & redirect
   - ✅ [locale] directory structure with pages
   - ✅ Language switcher component
   - ✅ SSR-safe i18n config
   - ✅ LocaleProvider component
   - ✅ Header with locale-prefixed navigation
   - ✅ hreflang metadata in layout

2. **Phase 2**: Backend translations ✅ COMPLETED
   - ✅ Translation model (generic with ContentType)
   - ✅ TranslatableMixin for models
   - ✅ HomeSection model
   - ✅ StaticContent model
   - ✅ RestaurantInfo model
   - ✅ Updated serializers with locale support
   - ✅ Locale-aware public API endpoints (/api/public/*)
   - ✅ Admin CMS endpoints (/api/admin/*)

3. **Phase 3**: Admin translation UI ✅ COMPLETED
   - ✅ TranslationStatusBadge component
   - ✅ TranslationTabs component with auto-translate support
   - ✅ HomeSectionsManagement admin page
   - ✅ translations.ts API client
   - ✅ homeSections.ts API client
   - ✅ Admin sidebar with Home Sections link

4. **Phase 4**: Auto-translate ✅ COMPLETED
   - ✅ Translation provider interface (TranslationProvider abstract class)
   - ✅ LibreTranslateProvider implementation
   - ✅ CopyFallbackProvider for offline fallback
   - ✅ TranslationService with provider management
   - ✅ auto_translate API endpoint in TranslationViewSet
   - ✅ Frontend auto-translate button in TranslationTabs

5. **Phase 5**: Guest reservations ✅ COMPLETED
   - ✅ Reservation model updated with OTP fields (verification_code, email_otp_code, email_otp_expires_at, email_otp_attempts)
   - ✅ email_service.py with localized templates (OTP, confirmation, cancellation, reminder)
   - ✅ GuestReservationViews.py with all endpoints (create, verify, resend, lookup, cancel)
   - ✅ Reservation lookup page at /[locale]/reservations/lookup

6. **Phase 6**: Client portal ✅ COMPLETED
   - ✅ UserProfile model with loyalty points, VIP tier, phone, preferences
   - ✅ ClientPortalViews.py with register, login, profile, password change, reservations
   - ✅ clientAuth.ts API client with token management
   - ✅ ClientAuthContext for auth state management
   - ✅ Account layout and pages (login, register, profile)
   - ✅ Profile page with tabs (profile, reservations, security)
   - ✅ Link existing reservation feature
   - ✅ Header navigation updated with Account link

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Hydration mismatch with SSR | Use `suppressHydrationWarning` where needed, ensure locale is determined server-side |
| Migration breaks existing content | Create backup before migration, test on staging first |
| Email deliverability | Use established SMTP provider, implement retry logic |
| Auto-translate quality | Always mark as "needs review", require manual approval |

---

## Success Criteria

- [x] All public pages accessible via `/sq/...` and `/en/...` ✅
- [x] Language switcher works and persists choice ✅
- [x] Admin can create/edit content in both languages ✅
- [x] Translation status badges show correctly ✅
- [x] Publish workflow respects translation mode ✅
- [x] Auto-translate button works (with fallback) ✅
- [x] Guest can make reservation without account ✅
- [x] OTP email verification works ✅
- [x] Client can view reservation history after login ✅
- [x] No paid external APIs used ✅

---

**Ready for implementation approval?**
