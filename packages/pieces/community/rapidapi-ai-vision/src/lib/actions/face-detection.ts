import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, httpClient } from '@activepieces/pieces-common';
import { rapidApiAiVisionAuth } from '../..';

export const faceDetection = createAction({
  auth: rapidApiAiVisionAuth,
  name: 'face_detection',
  displayName: 'Face Detection & Analysis',
  description: 'Deteksi wajah dan analisis karakteristik seperti umur, gender, emosi',
  props: {
    imageUrl: Property.ShortText({
      displayName: 'Image URL',
      required: true,
    }),
    includeAttributes: Property.Checkbox({
      displayName: 'Include Face Attributes',
      description: 'Analisis umur, gender, emosi, dll',
      required: false,
      defaultValue: true
    })
  },
  async run({ auth, propsValue }) {
    const { imageUrl, includeAttributes = true } = propsValue;
    
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
        queryParams: { visualFeatures: 'Faces' }
      });

      const faces = response.body.faces || [];

      return {
        success: true,
        face_detection: {
          total_faces: faces.length,
          faces: faces.map((face: any, index: number) => ({
            face_id: index + 1,
            bounding_box: face.faceRectangle,
            attributes: includeAttributes ? {
              age: face.faceAttributes?.age,
              gender: face.faceAttributes?.gender,
              emotion: face.faceAttributes?.emotion,
              facial_hair: face.faceAttributes?.facialHair,
              glasses: face.faceAttributes?.glasses
            } : null
          }))
        },
        analysis_options: {
          attributes_included: includeAttributes,
          detection_confidence: 0.8
        }
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
});