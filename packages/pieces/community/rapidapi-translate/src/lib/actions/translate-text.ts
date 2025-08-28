import {
  createAction,
  Property,
} from '@activepieces/pieces-framework';
import {
  HttpMethod,
  httpClient,
} from '@activepieces/pieces-common';
import { rapidApiTranslateAuth } from '../..';

export const translateText = createAction({
  auth: rapidApiTranslateAuth,
  name: 'translate_text',
  displayName: 'Terjemahkan Teks',
  description: 'Menerjemahkan teks dari satu bahasa ke bahasa lain dengan berbagai provider',
  props: {
    provider: Property.StaticDropdown({
      displayName: 'Translation Provider',
      description: 'Pilih provider translation yang ingin digunakan',
      required: true,
      defaultValue: 'google',
      options: {
        options: [
          { label: 'Google Translate (Akurat)', value: 'google' },
          { label: 'Microsoft Translator (Enterprise)', value: 'microsoft' },
          { label: 'DeepL (Quality Terbaik)', value: 'deepl' },
          { label: 'MyMemory (Free)', value: 'mymemory' },
          { label: 'Translate Plus (Multi)', value: 'translateplus' }
        ]
      }
    }),
    text: Property.LongText({
      displayName: 'Teks yang Akan Diterjemahkan',
      description: 'Masukkan teks yang ingin Anda terjemahkan',
      required: true,
      placeholder: 'Masukkan teks di sini...'
    }),
    sourceLanguage: Property.StaticDropdown({
      displayName: 'Bahasa Sumber',
      description: 'Bahasa asli dari teks (auto untuk deteksi otomatis)',
      required: false,
      defaultValue: 'auto',
      options: {
        options: [
          { label: 'Deteksi Otomatis', value: 'auto' },
          { label: '🇮🇩 Bahasa Indonesia', value: 'id' },
          { label: '🇺🇸 English', value: 'en' },
          { label: '🇯🇵 日本語 (Japanese)', value: 'ja' },
          { label: '🇰🇷 한국어 (Korean)', value: 'ko' },
          { label: '🇨🇳 中文 (Chinese)', value: 'zh' },
          { label: '🇪🇸 Español (Spanish)', value: 'es' },
          { label: '🇫🇷 Français (French)', value: 'fr' },
          { label: '🇩🇪 Deutsch (German)', value: 'de' },
          { label: '🇮🇹 Italiano (Italian)', value: 'it' },
          { label: '🇵🇹 Português (Portuguese)', value: 'pt' },
          { label: '🇷🇺 Русский (Russian)', value: 'ru' },
          { label: '🇦🇪 العربية (Arabic)', value: 'ar' },
          { label: '🇹🇭 ไทย (Thai)', value: 'th' },
          { label: '🇻🇳 Tiếng Việt (Vietnamese)', value: 'vi' },
          { label: '🇲🇾 Bahasa Melayu', value: 'ms' },
          { label: '🇳🇱 Nederlands (Dutch)', value: 'nl' },
          { label: '🇸🇪 Svenska (Swedish)', value: 'sv' },
          { label: '🇳🇴 Norsk (Norwegian)', value: 'no' },
          { label: '🇮🇳 हिंदी (Hindi)', value: 'hi' }
        ]
      }
    }),
    targetLanguage: Property.StaticDropdown({
      displayName: 'Bahasa Target',
      description: 'Bahasa tujuan untuk hasil terjemahan',
      required: true,
      defaultValue: 'en',
      options: {
        options: [
          { label: '🇮🇩 Bahasa Indonesia', value: 'id' },
          { label: '🇺🇸 English', value: 'en' },
          { label: '🇯🇵 日本語 (Japanese)', value: 'ja' },
          { label: '🇰🇷 한국어 (Korean)', value: 'ko' },
          { label: '🇨🇳 中文 (Chinese)', value: 'zh' },
          { label: '🇪🇸 Español (Spanish)', value: 'es' },
          { label: '🇫🇷 Français (French)', value: 'fr' },
          { label: '🇩🇪 Deutsch (German)', value: 'de' },
          { label: '🇮🇹 Italiano (Italian)', value: 'it' },
          { label: '🇵🇹 Português (Portuguese)', value: 'pt' },
          { label: '🇷🇺 Русский (Russian)', value: 'ru' },
          { label: '🇦🇪 العربية (Arabic)', value: 'ar' },
          { label: '🇹🇭 ไทย (Thai)', value: 'th' },
          { label: '🇻🇳 Tiếng Việt (Vietnamese)', value: 'vi' },
          { label: '🇲🇾 Bahasa Melayu', value: 'ms' },
          { label: '🇳🇱 Nederlands (Dutch)', value: 'nl' },
          { label: '🇸🇪 Svenska (Swedish)', value: 'sv' },
          { label: '🇳🇴 Norsk (Norwegian)', value: 'no' },
          { label: '🇮🇳 हिंदी (Hindi)', value: 'hi' }
        ]
      }
    }),
    includeAlternatives: Property.Checkbox({
      displayName: 'Sertakan Alternatif Terjemahan',
      description: 'Dapatkan beberapa opsi terjemahan untuk teks yang sama',
      required: false,
      defaultValue: false
    }),
    preserveFormatting: Property.Checkbox({
      displayName: 'Pertahankan Format',
      description: 'Pertahankan line breaks dan basic formatting',
      required: false,
      defaultValue: true
    }),
    includeConfidence: Property.Checkbox({
      displayName: 'Sertakan Confidence Score',
      description: 'Dapatkan skor kepercayaan untuk kualitas terjemahan',
      required: false,
      defaultValue: true
    })
  },
  async run({ auth, propsValue }) {
    const { 
      provider = 'google',
      text,
      sourceLanguage = 'auto',
      targetLanguage,
      includeAlternatives = false,
      preserveFormatting = true,
      includeConfidence = true
    } = propsValue;
    
    try {
      let url: string;
      let requestBody: any = {};
      let hostHeader: string;
      let method = HttpMethod.POST;
      
      // Konfigurasi berdasarkan provider
      switch (provider) {
        case 'google':
          url = 'https://google-translate1.p.rapidapi.com/language/translate/v2';
          hostHeader = 'google-translate1.p.rapidapi.com';
          requestBody = {
            q: text,
            target: targetLanguage,
            source: sourceLanguage === 'auto' ? undefined : sourceLanguage,
            format: preserveFormatting ? 'text' : 'html'
          };
          break;
          
        case 'microsoft':
          url = 'https://microsoft-translator-text.p.rapidapi.com/translate';
          hostHeader = 'microsoft-translator-text.p.rapidapi.com';
          requestBody = [{
            text: text
          }];
          break;
          
        case 'deepl':
          url = 'https://deepl-translate.p.rapidapi.com/translate';
          hostHeader = 'deepl-translate.p.rapidapi.com';
          requestBody = {
            text: text,
            source_lang: sourceLanguage === 'auto' ? undefined : sourceLanguage.toUpperCase(),
            target_lang: targetLanguage.toUpperCase(),
            preserve_formatting: preserveFormatting
          };
          break;
          
        case 'mymemory':
          url = 'https://mymemory-translation-memory.p.rapidapi.com/translate';
          hostHeader = 'mymemory-translation-memory.p.rapidapi.com';
          method = HttpMethod.GET;
          break;
          
        case 'translateplus':
          url = 'https://translate-plus.p.rapidapi.com/translate';
          hostHeader = 'translate-plus.p.rapidapi.com';
          requestBody = {
            text: text,
            source: sourceLanguage,
            target: targetLanguage
          };
          break;
          
        default:
          throw new Error(`Provider ${provider} tidak didukung`);
      }

      let response;
      
      if (method === HttpMethod.GET) {
        // For MyMemory (GET request)
        response = await httpClient.sendRequest({
          method: HttpMethod.GET,
          url: url,
          headers: {
            'X-RapidAPI-Key': auth,
            'X-RapidAPI-Host': hostHeader,
          },
          queryParams: {
            q: text,
            langpair: `${sourceLanguage}|${targetLanguage}`
          }
        });
      } else {
        // For other providers (POST request)
        const headers: any = {
          'X-RapidAPI-Key': auth,
          'X-RapidAPI-Host': hostHeader,
          'Content-Type': 'application/json'
        };
        
        // Microsoft needs special query params
        if (provider === 'microsoft') {
          response = await httpClient.sendRequest({
            method: HttpMethod.POST,
            url: `${url}?api-version=3.0&to=${targetLanguage}${sourceLanguage !== 'auto' ? `&from=${sourceLanguage}` : ''}`,
            headers,
            body: requestBody
          });
        } else {
          response = await httpClient.sendRequest({
            method: HttpMethod.POST,
            url: url,
            headers,
            body: requestBody
          });
        }
      }

      const translationData = response.body;
      
      // Normalize response berdasarkan provider
      let translatedText = '';
      let detectedLanguage = sourceLanguage;
      let confidenceScore = null;
      let alternatives: string[] = [];
      
      switch (provider) {
        case 'google':
          const googleData = translationData.data?.translations?.[0];
          translatedText = googleData?.translatedText || '';
          detectedLanguage = googleData?.detectedSourceLanguage || sourceLanguage;
          break;
          
        case 'microsoft':
          const msData = translationData[0];
          translatedText = msData?.translations?.[0]?.text || '';
          detectedLanguage = msData?.detectedLanguage?.language || sourceLanguage;
          confidenceScore = msData?.detectedLanguage?.score;
          break;
          
        case 'deepl':
          translatedText = translationData.translations?.[0]?.text || '';
          detectedLanguage = translationData.translations?.[0]?.detected_source_language?.toLowerCase() || sourceLanguage;
          break;
          
        case 'mymemory':
          translatedText = translationData.responseData?.translatedText || '';
          confidenceScore = translationData.responseData?.match;
          break;
          
        case 'translateplus':
          translatedText = translationData.translations?.translation || '';
          break;
      }
      
      // Calculate additional metrics
      const metrics = {
        character_count: {
          original: text.length,
          translated: translatedText.length,
          change_ratio: translatedText.length / text.length
        },
        word_count: {
          original: text.split(/\s+/).length,
          translated: translatedText.split(/\s+/).length
        },
        processing_time: Date.now() // Will be calculated in actual implementation
      };
      
      // Generate alternatives if requested
      if (includeAlternatives && provider === 'google') {
        // In real implementation, you might call multiple times or use different approaches
        alternatives = [translatedText]; // Simplified for demo
      }
      
      return {
        success: true,
        provider: provider,
        translation: {
          original_text: text,
          translated_text: translatedText,
          source_language: detectedLanguage,
          target_language: targetLanguage,
          detected_language: sourceLanguage === 'auto' ? detectedLanguage : null
        },
        quality: includeConfidence ? {
          confidence_score: confidenceScore,
          quality_rating: this.getQualityRating(confidenceScore),
          reliability_factors: this.getReliabilityFactors(provider, translatedText, text)
        } : null,
        alternatives: includeAlternatives ? alternatives : null,
        metrics: metrics,
        metadata: {
          provider_used: provider,
          translation_time: new Date().toISOString(),
          formatting_preserved: preserveFormatting,
          auto_detection_used: sourceLanguage === 'auto'
        },
        raw_response: translationData
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        error_code: error.response?.status || 'UNKNOWN_ERROR',
        provider: provider,
        details: error.response?.data || null
      };
    }
  },
  
  // Helper methods
  getQualityRating(score: number | null): string {
    if (!score) return 'Unknown';
    if (score >= 0.9) return 'Excellent';
    if (score >= 0.8) return 'Good';
    if (score >= 0.7) return 'Fair';
    if (score >= 0.6) return 'Poor';
    return 'Very Poor';
  },
  
  getReliabilityFactors(provider: string, translated: string, original: string): string[] {
    const factors = [];
    
    // Provider reliability
    const providerRatings: { [key: string]: string } = {
      'google': 'High accuracy provider',
      'microsoft': 'Enterprise-grade quality',
      'deepl': 'Superior quality for EU languages',
      'mymemory': 'Community-driven translations',
      'translateplus': 'Multi-provider aggregation'
    };
    
    if (providerRatings[provider]) {
      factors.push(providerRatings[provider]);
    }
    
    // Length consistency
    const lengthRatio = translated.length / original.length;
    if (lengthRatio > 0.5 && lengthRatio < 2.0) {
      factors.push('Appropriate length consistency');
    }
    
    // Structure preservation
    if (original.includes('\n') && translated.includes('\n')) {
      factors.push('Paragraph structure preserved');
    }
    
    // Special characters
    const hasSpecialChars = /[^\w\s]/.test(original);
    if (hasSpecialChars && /[^\w\s]/.test(translated)) {
      factors.push('Special characters handled');
    }
    
    return factors;
  }
});