import {
  createAction,
  Property,
} from '@activepieces/pieces-framework';
import {
  HttpMethod,
  httpClient,
} from '@activepieces/pieces-common';
import { rapidApiTranslateAuth } from '../..';

export const detectLanguage = createAction({
  auth: rapidApiTranslateAuth,
  name: 'detect_language',
  displayName: 'Deteksi Bahasa',
  description: 'Mendeteksi bahasa dari teks yang diberikan',
  props: {
    text: Property.LongText({
      displayName: 'Teks untuk Dideteksi',
      description: 'Masukkan teks yang ingin dideteksi bahasanya',
      required: true,
      placeholder: 'Masukkan teks di sini...'
    }),
    provider: Property.StaticDropdown({
      displayName: 'Detection Provider',
      description: 'Pilih provider untuk deteksi bahasa',
      required: false,
      defaultValue: 'google',
      options: {
        options: [
          { label: 'Google Translate', value: 'google' },
          { label: 'Microsoft Translator', value: 'microsoft' },
          { label: 'Language Detection API', value: 'langdetect' }
        ]
      }
    })
  },
  async run({ auth, propsValue }) {
    const { text, provider = 'google' } = propsValue;
    
    try {
      let url: string;
      let hostHeader: string;
      
      switch (provider) {
        case 'google':
          url = 'https://google-translate1.p.rapidapi.com/language/translate/v2/detect';
          hostHeader = 'google-translate1.p.rapidapi.com';
          break;
        case 'microsoft':
          url = 'https://microsoft-translator-text.p.rapidapi.com/detect';
          hostHeader = 'microsoft-translator-text.p.rapidapi.com';
          break;
        default:
          url = 'https://language-detection.p.rapidapi.com/detect';
          hostHeader = 'language-detection.p.rapidapi.com';
      }

      const response = await httpClient.sendRequest({
        method: HttpMethod.POST,
        url: url,
        headers: {
          'X-RapidAPI-Key': auth,
          'X-RapidAPI-Host': hostHeader,
          'Content-Type': 'application/json'
        },
        body: provider === 'microsoft' ? [{ text }] : { q: text }
      });

      const data = response.body;
      
      // Normalize response
      let language = 'unknown';
      let confidence = 0;
      
      if (provider === 'google') {
        language = data.data?.detections?.[0]?.[0]?.language || 'unknown';
        confidence = data.data?.detections?.[0]?.[0]?.confidence || 0;
      } else if (provider === 'microsoft') {
        language = data[0]?.language || 'unknown';
        confidence = data[0]?.score || 0;
      }
      
      return {
        success: true,
        detected_language: {
          code: language,
          name: this.getLanguageName(language),
          confidence: confidence,
          confidence_level: this.getConfidenceLevel(confidence)
        },
        text_analysis: {
          character_count: text.length,
          word_count: text.split(/\s+/).length,
          sentence_count: text.split(/[.!?]+/).length
        },
        provider: provider,
        raw_response: data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        provider: provider
      };
    }
  },
  
  getLanguageName(code: string): string {
    const languages: { [key: string]: string } = {
      'en': 'English', 'id': 'Indonesian', 'ja': 'Japanese',
      'ko': 'Korean', 'zh': 'Chinese', 'es': 'Spanish',
      'fr': 'French', 'de': 'German', 'it': 'Italian',
      'pt': 'Portuguese', 'ru': 'Russian', 'ar': 'Arabic'
    };
    return languages[code] || code;
  },
  
  getConfidenceLevel(score: number): string {
    if (score >= 0.9) return 'Very High';
    if (score >= 0.8) return 'High';
    if (score >= 0.6) return 'Medium';
    if (score >= 0.4) return 'Low';
    return 'Very Low';
  }
});