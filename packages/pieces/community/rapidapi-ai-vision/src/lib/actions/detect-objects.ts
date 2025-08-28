import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, httpClient } from '@activepieces/pieces-common';
import { rapidApiAiVisionAuth } from '../..';

export const detectObjects = createAction({
  auth: rapidApiAiVisionAuth,
  name: 'detect_objects',
  displayName: 'Detect Objects',
  description: 'Deteksi dan identifikasi objek dalam gambar',
  props: {
    imageUrl: Property.ShortText({
      displayName: 'Image URL',
      required: true,
      placeholder: 'https://example.com/image.jpg'
    }),
    minConfidence: Property.Number({
      displayName: 'Minimum Confidence',
      required: false,
      defaultValue: 0.5,
      validators: []
    })
  },
  async run({ auth, propsValue }) {
    const { imageUrl, minConfidence = 0.5 } = propsValue;
    
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
        queryParams: { visualFeatures: 'Objects' }
      });

      const objects = response.body.objects?.filter((obj: any) => 
        obj.confidence >= minConfidence
      ) || [];

      return {
        success: true,
        detected_objects: objects.map((obj: any) => ({
          name: obj.object,
          confidence: obj.confidence,
          bounding_box: obj.rectangle
        })),
        total_objects: objects.length,
        confidence_threshold: minConfidence
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
});