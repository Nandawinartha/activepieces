import {
  createAction,
  Property,
} from '@activepieces/pieces-framework';
import {
  HttpMethod,
  httpClient,
} from '@activepieces/pieces-common';
import { rapidApiTranslateAuth } from '../..';

export const batchTranslate = createAction({
  auth: rapidApiTranslateAuth,
  name: 'batch_translate',
  displayName: 'Terjemahan Batch',
  description: 'Menerjemahkan multiple teks sekaligus dalam satu request',
  props: {
    texts: Property.Json({
      displayName: 'Array Teks',
      description: 'Array berisi teks-teks yang akan diterjemahkan',
      required: true,
      defaultValue: ["Hello world", "How are you?", "Thank you"]
    }),
    sourceLanguage: Property.StaticDropdown({
      displayName: 'Bahasa Sumber',
      required: false,
      defaultValue: 'auto',
      options: {
        options: [
          { label: 'Auto Detect', value: 'auto' },
          { label: 'English', value: 'en' },
          { label: 'Indonesian', value: 'id' },
          { label: 'Japanese', value: 'ja' },
          { label: 'Korean', value: 'ko' },
          { label: 'Chinese', value: 'zh' }
        ]
      }
    }),
    targetLanguage: Property.StaticDropdown({
      displayName: 'Bahasa Target',
      required: true,
      defaultValue: 'id',
      options: {
        options: [
          { label: 'Indonesian', value: 'id' },
          { label: 'English', value: 'en' },
          { label: 'Japanese', value: 'ja' },
          { label: 'Korean', value: 'ko' },
          { label: 'Chinese', value: 'zh' }
        ]
      }
    })
  },
  async run({ auth, propsValue }) {
    const { texts, sourceLanguage = 'auto', targetLanguage } = propsValue;
    
    try {
      const textArray = Array.isArray(texts) ? texts : [texts];
      const results = [];
      
      for (const text of textArray) {
        const response = await httpClient.sendRequest({
          method: HttpMethod.POST,
          url: 'https://google-translate1.p.rapidapi.com/language/translate/v2',
          headers: {
            'X-RapidAPI-Key': auth,
            'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com',
            'Content-Type': 'application/json'
          },
          body: {
            q: text,
            target: targetLanguage,
            source: sourceLanguage === 'auto' ? undefined : sourceLanguage
          }
        });
        
        const translation = response.body.data?.translations?.[0];
        results.push({
          original: text,
          translated: translation?.translatedText || '',
          detected_language: translation?.detectedSourceLanguage || sourceLanguage
        });
      }
      
      return {
        success: true,
        batch_results: results,
        summary: {
          total_texts: textArray.length,
          successfully_translated: results.filter(r => r.translated).length,
          source_language: sourceLanguage,
          target_language: targetLanguage
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
});