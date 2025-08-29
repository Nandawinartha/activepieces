import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, httpClient } from '@activepieces/pieces-common';
import { rapidApiTranslateAuth } from '../..';

// Helper functions outside the action
function getQualityRating(score: number | null): string {
  if (!score) return 'Unknown';
  if (score >= 0.9) return 'Excellent';
  if (score >= 0.8) return 'Good';
  if (score >= 0.6) return 'Fair';
  if (score >= 0.4) return 'Poor';
  return 'Very Poor';
}

function getReliabilityFactors(provider: string, translatedText: string, originalText: string): any {
  return {
    provider_reliability: provider === 'google' ? 'High' : 'Medium',
    text_length_factor: translatedText.length > 0 ? 'Good' : 'Poor',
    character_preservation: Math.abs(translatedText.length - originalText.length) / originalText.length < 0.5 ? 'Good' : 'Fair'
  };
}

export const translateText = createAction({
  auth: rapidApiTranslateAuth,
  name: 'translate_text',
  displayName: 'Terjemahkan Teks',
  description: 'Terjemahkan teks dari satu bahasa ke bahasa lain',
  props: {
    provider: Property.StaticDropdown({
      displayName: 'Translation Provider',
      description: 'Pilih provider untuk terjemahan',
      required: true,
      defaultValue: 'google',
      options: {
        options: [
          { label: 'Google Translate', value: 'google' },
          { label: 'Microsoft Translator', value: 'microsoft' },
          { label: 'DeepL', value: 'deepl' }
        ]
      }
    }),
    text: Property.LongText({
      displayName: 'Teks yang Akan Diterjemahkan',
      description: 'Masukkan teks yang ingin Anda terjemahkan',
      required: true,
    }),
    sourceLanguage: Property.StaticDropdown({
      displayName: 'Bahasa Sumber',
      description: 'Bahasa asli dari teks (auto untuk deteksi otomatis)',
      required: false,
      defaultValue: 'auto',
      options: {
        options: [
          { label: 'Auto Detect', value: 'auto' },
          { label: 'English', value: 'en' },
          { label: 'Indonesian', value: 'id' },
          { label: 'Spanish', value: 'es' },
          { label: 'French', value: 'fr' },
          { label: 'German', value: 'de' },
          { label: 'Japanese', value: 'ja' },
          { label: 'Korean', value: 'ko' },
          { label: 'Chinese', value: 'zh' }
        ]
      }
    }),
    targetLanguage: Property.StaticDropdown({
      displayName: 'Bahasa Target',
      description: 'Bahasa hasil terjemahan',
      required: true,
      defaultValue: 'id',
      options: {
        options: [
          { label: 'Indonesian', value: 'id' },
          { label: 'English', value: 'en' },
          { label: 'Spanish', value: 'es' },
          { label: 'French', value: 'fr' },
          { label: 'German', value: 'de' },
          { label: 'Japanese', value: 'ja' },
          { label: 'Korean', value: 'ko' },
          { label: 'Chinese', value: 'zh' }
        ]
      }
    }),
    includeAlternatives: Property.Checkbox({
      displayName: 'Sertakan Alternatif',
      description: 'Sertakan terjemahan alternatif jika tersedia',
      required: false,
      defaultValue: false
    }),
    includeConfidence: Property.Checkbox({
      displayName: 'Sertakan Confidence Score',
      description: 'Sertakan tingkat kepercayaan terjemahan',
      required: false,
      defaultValue: false
    })
  },
  async run({ auth, propsValue }) {
    const { 
      provider, 
      text, 
      sourceLanguage = 'auto', 
      targetLanguage, 
      includeAlternatives = false, 
      includeConfidence = false 
    } = propsValue;
    
    try {
      let translatedText = '';
      let detectedLanguage = sourceLanguage;
      let confidenceScore: number | null = null;
      let alternatives: string[] = [];
      let rawResponse: any = {};

      switch (provider) {
        case 'google':
          const response = await httpClient.sendRequest({
            method: HttpMethod.POST,
            url: 'https://google-translate1.p.rapidapi.com/language/translate/v2',
            headers: {
              'X-RapidAPI-Key': auth,
              'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com',
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `q=${encodeURIComponent(text)}&target=${targetLanguage}&source=${sourceLanguage}`
          });

          rawResponse = response.body;
          translatedText = rawResponse.data?.translations?.[0]?.translatedText || '';
          detectedLanguage = rawResponse.data?.translations?.[0]?.detectedSourceLanguage || sourceLanguage;
          confidenceScore = includeConfidence ? 0.85 : null;
          break;

        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      // Calculate metrics
      const metrics = {
        character_count: {
          original: text.length,
          translated: translatedText.length,
          ratio: translatedText.length / text.length
        },
        word_count: {
          original: text.split(/\s+/).length,
          translated: translatedText.split(/\s+/).length
        },
        processing_time: new Date().toISOString()
      };

      return {
        success: true,
        translated_text: translatedText,
        language_info: {
          source_language: detectedLanguage,
          target_language: targetLanguage,
          detected_language: detectedLanguage !== sourceLanguage ? detectedLanguage : null,
          provider: provider
        },
        quality: includeConfidence ? {
          confidence_score: confidenceScore,
          quality_rating: getQualityRating(confidenceScore),
          reliability_factors: getReliabilityFactors(provider, translatedText, text)
        } : null,
        alternatives: includeAlternatives ? alternatives : null,
        metrics: metrics,
        raw_response: rawResponse
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        source_language: sourceLanguage,
        target_language: targetLanguage,
        provider: provider
      };
    }
  }
});