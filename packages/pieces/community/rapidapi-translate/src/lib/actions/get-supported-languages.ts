import {
  createAction,
  Property,
} from '@activepieces/pieces-framework';
import {
  HttpMethod,
  httpClient,
} from '@activepieces/pieces-common';
import { rapidApiTranslateAuth } from '../..';

export const getSupportedLanguages = createAction({
  auth: rapidApiTranslateAuth,
  name: 'get_supported_languages',
  displayName: 'Dapatkan Bahasa yang Didukung',
  description: 'Mendapatkan daftar semua bahasa yang didukung oleh translation provider',
  props: {
    provider: Property.StaticDropdown({
      displayName: 'Provider',
      required: false,
      defaultValue: 'google',
      options: {
        options: [
          { label: 'Google Translate', value: 'google' },
          { label: 'Microsoft Translator', value: 'microsoft' }
        ]
      }
    })
  },
  async run({ auth, propsValue }) {
    const { provider = 'google' } = propsValue;
    
    try {
      let url: string;
      let hostHeader: string;
      
      if (provider === 'google') {
        url = 'https://google-translate1.p.rapidapi.com/language/translate/v2/languages';
        hostHeader = 'google-translate1.p.rapidapi.com';
      } else {
        url = 'https://microsoft-translator-text.p.rapidapi.com/languages';
        hostHeader = 'microsoft-translator-text.p.rapidapi.com';
      }

      const response = await httpClient.sendRequest({
        method: HttpMethod.GET,
        url: url,
        headers: {
          'X-RapidAPI-Key': auth,
          'X-RapidAPI-Host': hostHeader
        }
      });

      const data = response.body;
      let languages = [];
      
      if (provider === 'google') {
        languages = data.data?.languages || [];
      } else {
        languages = Object.entries(data.translation || {}).map(([code, info]: [string, any]) => ({
          language: code,
          name: info.name
        }));
      }
      
      return {
        success: true,
        provider: provider,
        supported_languages: languages,
        total_count: languages.length,
        popular_languages: languages.slice(0, 20)
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        provider: provider
      };
    }
  }
});