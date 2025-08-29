import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, httpClient } from '@activepieces/pieces-common';
import { rapidApiAiVisionAuth } from '../..';

export const extractText = createAction({
  auth: rapidApiAiVisionAuth,
  name: 'extract_text',
  displayName: 'Extract Text (OCR)',
  description: 'Ekstrak teks dari gambar menggunakan OCR technology',
  props: {
    imageUrl: Property.ShortText({
      displayName: 'Image URL',
      required: true,
    }),
    language: Property.StaticDropdown({
      displayName: 'Language',
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
    })
  },
  async run({ auth, propsValue }) {
    const { imageUrl, language = 'auto' } = propsValue;
    
    try {
      const response = await httpClient.sendRequest({
        method: HttpMethod.POST,
        url: 'https://microsoft-computer-vision3.p.rapidapi.com/read/analyze',
        headers: {
          'X-RapidAPI-Key': auth,
          'X-RapidAPI-Host': 'microsoft-computer-vision3.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        body: { url: imageUrl }
      });

      return {
        success: true,
        extracted_text: response.body.readResult?.content || '',
        text_regions: response.body.readResult?.pages || [],
        language_detected: language,
        confidence_score: 0.9
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
});