import {
  createAction,
  Property,
} from '@activepieces/pieces-framework';
import {
  HttpMethod,
  httpClient,
} from '@activepieces/pieces-common';
import { rapidApiAiVisionAuth } from '../..';

// Helper functions outside the action
function normalizeAnalysisResult(data: any, provider: string, features: string[]): any {
  const result: any = {};
  
  if (features.includes('objects')) {
    result.objects = extractObjects(data, provider);
  }
  
  if (features.includes('colors')) {
    result.colors = extractColors(data, provider);
  }
  
  if (features.includes('text')) {
    result.text = extractTextData(data, provider);
  }
  
  if (features.includes('faces')) {
    result.faces = extractFaces(data, provider);
  }
  
  result.general_info = extractGeneralInfo(data, provider);
  
  return result;
}

function extractObjects(data: any, provider: string): any[] {
  switch (provider) {
    case 'microsoft':
      return data.objects?.map((obj: any) => ({
        name: obj.object,
        confidence: obj.confidence,
        bounding_box: obj.rectangle
      })) || [];
    case 'google':
      return data.localizedObjectAnnotations?.map((obj: any) => ({
        name: obj.name,
        confidence: obj.score,
        bounding_box: obj.boundingPoly
      })) || [];
    default:
      return [];
  }
}

function extractColors(data: any, provider: string): any {
  switch (provider) {
    case 'microsoft':
      return {
        dominant_colors: data.color?.dominantColors || [],
        accent_color: data.color?.accentColor,
        is_bw_image: data.color?.isBwImg
      };
    case 'google':
      return {
        dominant_colors: data.imagePropertiesAnnotation?.dominantColors?.colors || []
      };
    default:
      return {};
  }
}

function extractTextData(data: any, provider: string): any {
  switch (provider) {
    case 'microsoft':
      return {
        text_content: data.readResult?.content || '',
        lines: data.readResult?.lines || []
      };
    case 'google':
      return {
        text_content: data.textAnnotations?.[0]?.description || '',
        lines: data.textAnnotations || []
      };
    default:
      return {};
  }
}

function extractFaces(data: any, provider: string): any[] {
  switch (provider) {
    case 'microsoft':
      return data.faces?.map((face: any) => ({
        age: face.age,
        gender: face.gender,
        emotion: face.emotion,
        bounding_box: face.faceRectangle
      })) || [];
    case 'google':
      return data.faceAnnotations?.map((face: any) => ({
        emotions: face.emotionLikelihood,
        bounding_box: face.boundingPoly
      })) || [];
    default:
      return [];
  }
}

function extractGeneralInfo(data: any, provider: string): any {
  return {
    analysis_provider: provider,
    processing_time: new Date().toISOString(),
    confidence_score: calculateOverallConfidence(data, provider),
    image_quality: assessImageQuality(data, provider)
  };
}

function calculateOverallConfidence(data: any, provider: string): number {
  switch (provider) {
    case 'microsoft':
      const descriptions = data.description?.captions || [];
      return descriptions.length > 0 ? descriptions[0].confidence : 0;
    default:
      return 0;
  }
}

function assessImageQuality(data: any, provider: string): string {
  // Simple quality assessment
  const hasHighResolution = true; // Placeholder logic
  const hasGoodContrast = true; // Placeholder logic
  
  if (hasHighResolution && hasGoodContrast) return 'High';
  if (hasHighResolution || hasGoodContrast) return 'Medium';
  return 'Low';
}

export const analyzeImage = createAction({
  auth: rapidApiAiVisionAuth,
  name: 'analyze_image',
  displayName: 'Analisis Gambar Komprehensif',
  description: 'Melakukan analisis komprehensif pada gambar termasuk objek, scene, colors, dan metadata',
  props: {
    imageInput: Property.StaticDropdown({
      displayName: 'Input Method',
      required: true,
      defaultValue: 'url',
      options: {
        options: [
          { label: 'Image URL', value: 'url' },
          { label: 'Base64 Data', value: 'base64' }
        ]
      }
    }),
    imageUrl: Property.ShortText({
      displayName: 'Image URL',
      description: 'URL publik dari gambar yang akan dianalisis',
      required: false,
    }),
    imageData: Property.LongText({
      displayName: 'Base64 Image Data',
      description: 'Data gambar dalam format base64',
      required: false,
    }),
    provider: Property.StaticDropdown({
      displayName: 'AI Provider',
      required: false,
      defaultValue: 'microsoft',
      options: {
        options: [
          { label: 'Microsoft Computer Vision', value: 'microsoft' },
          { label: 'Google Cloud Vision', value: 'google' },
          { label: 'Clarifai', value: 'clarifai' },
          { label: 'API4AI', value: 'api4ai' }
        ]
      }
    }),
    analysisFeatures: Property.StaticMultiSelectDropdown({
      displayName: 'Analysis Features',
      required: false,
      defaultValue: ['objects', 'colors'],
      options: {
        options: [
          { label: 'Object Detection', value: 'objects' },
          { label: 'Color Analysis', value: 'colors' },
          { label: 'Text Extraction (OCR)', value: 'text' },
          { label: 'Face Detection', value: 'faces' },
          { label: 'Scene Classification', value: 'scenes' }
        ]
      }
    })
  },
  async run({ auth, propsValue }) {
    const { imageInput, imageUrl, imageData, provider, analysisFeatures } = propsValue;
    
    // Validate input
    if (imageInput === 'url' && !imageUrl) {
      throw new Error('Image URL is required when using URL input method');
    }
    if (imageInput === 'base64' && !imageData) {
      throw new Error('Image data is required when using base64 input method');
    }

    try {
      // Construct the request based on provider
      let url = '';
      let headers: any = {
        'X-RapidAPI-Key': auth,
        'X-RapidAPI-Host': '',
        'Content-Type': 'application/json'
      };
      
      let body: any = {};
      
      switch (provider) {
        case 'microsoft':
          url = 'https://microsoft-computer-vision3.p.rapidapi.com/analyze';
          headers['X-RapidAPI-Host'] = 'microsoft-computer-vision3.p.rapidapi.com';
          body = imageInput === 'url' ? { url: imageUrl } : { data: imageData };
          break;
        case 'google':
          url = 'https://google-cloud-vision.p.rapidapi.com/v1/images:annotate';
          headers['X-RapidAPI-Host'] = 'google-cloud-vision.p.rapidapi.com';
          body = {
            requests: [{
              image: imageInput === 'url' ? { source: { imageUri: imageUrl } } : { content: imageData },
              features: (analysisFeatures || []).map(feature => ({ type: feature.toUpperCase(), maxResults: 10 }))
            }]
          };
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      const response = await httpClient.sendRequest({
        method: HttpMethod.POST,
        url: url,
        headers: headers,
        body: body,
      });

      const analysisData = response.body;
      
      // Normalize response berdasarkan provider
      const normalizedResult = normalizeAnalysisResult(analysisData, provider, analysisFeatures || []);
      
      return {
        success: true,
        provider: provider,
        image_info: {
          source_type: imageInput,
          analysis_timestamp: new Date().toISOString(),
          features_analyzed: analysisFeatures || []
        },
        analysis_results: normalizedResult,
        raw_response: analysisData
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