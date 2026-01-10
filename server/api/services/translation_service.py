# server/api/services/translation_service.py
"""
Translation service for auto-translate functionality.
Supports multiple providers with fallback to copy mode.
"""

import os
import requests
import logging
from abc import ABC, abstractmethod
from typing import Dict, Optional

logger = logging.getLogger(__name__)


class TranslationProvider(ABC):
    """Abstract base class for translation providers"""

    @abstractmethod
    def translate(self, text: str, source_lang: str, target_lang: str) -> Dict:
        """
        Translate text from source language to target language.

        Returns:
            dict: {
                'translated_text': str,
                'is_auto_translated': bool,
                'needs_review': bool,
                'provider': str,
                'error': Optional[str]
            }
        """
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """Check if the provider is configured and available"""
        pass


class LibreTranslateProvider(TranslationProvider):
    """
    LibreTranslate provider for self-hosted translation.
    See: https://github.com/LibreTranslate/LibreTranslate
    """

    def __init__(self, url: str, api_key: Optional[str] = None):
        self.url = url.rstrip('/')
        self.api_key = api_key

    def is_available(self) -> bool:
        if not self.url:
            return False
        try:
            response = requests.get(f"{self.url}/languages", timeout=5)
            return response.status_code == 200
        except Exception as e:
            logger.warning(f"LibreTranslate not available: {e}")
            return False

    def translate(self, text: str, source_lang: str, target_lang: str) -> Dict:
        if not text or not text.strip():
            return {
                'translated_text': text,
                'is_auto_translated': False,
                'needs_review': False,
                'provider': 'none',
                'error': None
            }

        try:
            payload = {
                'q': text,
                'source': source_lang,
                'target': target_lang,
                'format': 'text'
            }
            if self.api_key:
                payload['api_key'] = self.api_key

            response = requests.post(
                f"{self.url}/translate",
                json=payload,
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                return {
                    'translated_text': data.get('translatedText', text),
                    'is_auto_translated': True,
                    'needs_review': True,
                    'provider': 'libretranslate',
                    'error': None
                }
            else:
                logger.error(f"LibreTranslate error: {response.status_code} - {response.text}")
                return {
                    'translated_text': text,
                    'is_auto_translated': False,
                    'needs_review': True,
                    'provider': 'libretranslate',
                    'error': f"API error: {response.status_code}"
                }

        except requests.exceptions.Timeout:
            logger.error("LibreTranslate timeout")
            return {
                'translated_text': text,
                'is_auto_translated': False,
                'needs_review': True,
                'provider': 'libretranslate',
                'error': 'Translation timeout'
            }
        except Exception as e:
            logger.error(f"LibreTranslate error: {e}")
            return {
                'translated_text': text,
                'is_auto_translated': False,
                'needs_review': True,
                'provider': 'libretranslate',
                'error': str(e)
            }


class CopyFallbackProvider(TranslationProvider):
    """
    Fallback provider that copies source text when no translation API is available.
    Useful for development or when translation service is unavailable.
    """

    def is_available(self) -> bool:
        return True  # Always available as fallback

    def translate(self, text: str, source_lang: str, target_lang: str) -> Dict:
        return {
            'translated_text': text,
            'is_auto_translated': False,
            'needs_review': True,
            'provider': 'copy_fallback',
            'error': None
        }


class TranslationService:
    """Main translation service that manages providers"""

    def __init__(self):
        self.providers = []
        self._initialize_providers()

    def _initialize_providers(self):
        """Initialize available translation providers"""

        # Check for LibreTranslate
        libre_url = os.environ.get('LIBRETRANSLATE_URL', os.environ.get('SELF_HOSTED_TRANSLATE_URL'))
        libre_key = os.environ.get('LIBRETRANSLATE_API_KEY')

        if libre_url:
            provider = LibreTranslateProvider(libre_url, libre_key)
            if provider.is_available():
                self.providers.append(provider)
                logger.info(f"LibreTranslate provider initialized: {libre_url}")

        # Always add copy fallback as last resort
        self.providers.append(CopyFallbackProvider())

    def translate(self, text: str, source_lang: str, target_lang: str) -> Dict:
        """
        Translate text using available providers.
        Falls back to next provider if one fails.
        """
        if not text or not text.strip():
            return {
                'translated_text': text,
                'is_auto_translated': False,
                'needs_review': False,
                'provider': 'none',
                'error': None
            }

        # Normalize language codes
        lang_map = {
            'sq': 'sq',  # Albanian
            'en': 'en',  # English
        }
        source = lang_map.get(source_lang, source_lang)
        target = lang_map.get(target_lang, target_lang)

        for provider in self.providers:
            if provider.is_available():
                result = provider.translate(text, source, target)
                if not result.get('error'):
                    return result
                logger.warning(f"Provider {result.get('provider')} failed: {result.get('error')}")

        # Should never reach here as CopyFallbackProvider always works
        return {
            'translated_text': text,
            'is_auto_translated': False,
            'needs_review': True,
            'provider': 'none',
            'error': 'No translation providers available'
        }

    def translate_fields(
        self,
        fields: Dict[str, str],
        source_lang: str,
        target_lang: str
    ) -> Dict[str, Dict]:
        """
        Translate multiple fields at once.

        Args:
            fields: Dictionary of field_name -> text
            source_lang: Source language code
            target_lang: Target language code

        Returns:
            Dictionary of field_name -> translation result
        """
        results = {}
        for field_name, text in fields.items():
            results[field_name] = self.translate(text, source_lang, target_lang)
        return results

    def get_active_provider(self) -> Optional[str]:
        """Get the name of the first available provider"""
        for provider in self.providers:
            if provider.is_available():
                if isinstance(provider, LibreTranslateProvider):
                    return 'libretranslate'
                elif isinstance(provider, CopyFallbackProvider):
                    return 'copy_fallback'
        return None


# Singleton instance
_translation_service = None


def get_translation_service() -> TranslationService:
    """Get or create the translation service singleton"""
    global _translation_service
    if _translation_service is None:
        _translation_service = TranslationService()
    return _translation_service
