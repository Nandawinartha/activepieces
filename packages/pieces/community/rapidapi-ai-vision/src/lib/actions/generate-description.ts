import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, httpClient } from '@activepieces/pieces-common';
import { rapidApiAiVisionAuth } from '../..';

export const generateImageDescription = createAction({
  auth: rapidApiAiVisionAuth,
  name: 'generate_description',
  displayName: 'Generate Image Description',
  description: 'Generate deskripsi natural language untuk gambar',
  props: {
    imageUrl: Property.ShortText({
      displayName: 'Image URL',
      required: true,
      placeholder: 'https://example.com/image.jpg'
    }),
    language: Property.StaticDropdown({
      displayName: 'Description Language',
      required: false,
      defaultValue: 'en',
      options: {
        options: [
          { label: 'English', value: 'en' },
          { label: 'Indonesian', value: 'id' },
          { label: 'Spanish', value: 'es' },
          { label: 'French', value: 'fr' }
        ]
      }
    })
  },
  async run({ auth, propsValue }) {
    const { imageUrl, language = 'en' } = propsValue;
    
    try {
      const response = await httpClient.sendRequest({
        method: HttpMethod.POST,
        url: 'https://microsoft-computer-vision3.p.rapidapi.com/analyze',
        headers: {
          'X-RapidAPI-Key': auth,
          'X-RapidAPI-Host': 'microsoft-computer-vision3.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        body: { url: imageUrl },
        queryParams: { visualFeatures: 'Description,Tags' }
      });

      const description = response.body.description?.captions?.[0];
      const tags = response.body.tags || [];

      return {
        success: true,
        description: {
          text: description?.text || 'No description available',
          confidence: description?.confidence || 0,
          language: language
        },
        tags: tags.map((tag: any) => ({
          name: tag.name,
          confidence: tag.confidence
        })),
        alternative_descriptions: response.body.description?.captions || []
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
});