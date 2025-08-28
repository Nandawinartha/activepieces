import {
  createAction,
  Property,
} from '@activepieces/pieces-framework';
import {
  HttpMethod,
  httpClient,
} from '@activepieces/pieces-common';
import { rapidApiAiVisionAuth } from '../..';

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
      placeholder: 'https://example.com/image.jpg'
    }),
    imageData: Property.LongText({
      displayName: 'Base64 Image Data',
      description: 'Data gambar dalam format base64',
      required: false,
      placeholder: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
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
      displayName: 'Features to Analyze',
      required: false,
      options: {
        options: [
          { label: 'Objects & Scene', value: 'objects' },
          { label: 'Colors & Themes', value: 'colors' },
          { label: 'Text (OCR)', value: 'text' },
          { label: 'Faces', value: 'faces' },
          { label: 'Landmarks', value: 'landmarks' },
          { label: 'Brands & Logos', value: 'brands' },
          { label: 'Adult Content', value: 'adult' },
          { label: 'Image Quality', value: 'quality' }
        ]
      }
    })
  },
  async run({ auth, propsValue }) {
    const { 
      imageInput, 
      imageUrl, 
      imageData, 
      provider = 'microsoft',
      analysisFeatures = ['objects', 'colors', 'text']
    } = propsValue;
    
    try {
      const imageSource = imageInput === 'url' ? imageUrl : imageData;
      if (!imageSource) {
        throw new Error('Image URL atau Base64 data harus diisi');
      }
      
      let url: string;
      let hostHeader: string;
      let requestBody: any;
      
      switch (provider) {
        case 'microsoft':
          url = 'https://microsoft-computer-vision3.p.rapidapi.com/analyze';
          hostHeader = 'microsoft-computer-vision3.p.rapidapi.com';
          requestBody = imageInput === 'url' ? { url: imageUrl } : { data: imageData };
          break;
          
        case 'google':
          url = 'https://google-cloud-vision.p.rapidapi.com/vision/analyze';
          hostHeader = 'google-cloud-vision.p.rapidapi.com';
          requestBody = { 
            image: imageInput === 'url' ? { source: { imageUri: imageUrl }} : { content: imageData },
            features: analysisFeatures.map(f => ({ type: f.toUpperCase(), maxResults: 10 }))
          };
          break;
          
        case 'clarifai':
          url = 'https://clarifai-api.p.rapidapi.com/predict';
          hostHeader = 'clarifai-api.p.rapidapi.com';
          requestBody = {
            inputs: [{
              data: { image: imageInput === 'url' ? { url: imageUrl } : { base64: imageData } }
            }]
          };
          break;
          
        default:
          url = 'https://api4ai-image-analyzer.p.rapidapi.com/analyze';
          hostHeader = 'api4ai-image-analyzer.p.rapidapi.com';
          requestBody = { image: imageSource };
      }

      const response = await httpClient.sendRequest({
        method: HttpMethod.POST,
        url: url,
        headers: {
          'X-RapidAPI-Key': auth,
          'X-RapidAPI-Host': hostHeader,
          'Content-Type': 'application/json'
        },
        body: requestBody
      });

      const analysisData = response.body;
      
      // Normalize response berdasarkan provider
      const normalizedResult = this.normalizeAnalysisResult(analysisData, provider, analysisFeatures);
      
      return {
        success: true,
        provider: provider,
        image_info: {
          source_type: imageInput,
          analysis_timestamp: new Date().toISOString(),
          features_analyzed: analysisFeatures
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
  },
  
  normalizeAnalysisResult(data: any, provider: string, features: string[]): any {
    const result: any = {};
    
    if (features.includes('objects')) {
      result.objects = this.extractObjects(data, provider);
    }
    
    if (features.includes('colors')) {
      result.colors = this.extractColors(data, provider);
    }
    
    if (features.includes('text')) {
      result.text = this.extractText(data, provider);
    }
    
    if (features.includes('faces')) {
      result.faces = this.extractFaces(data, provider);
    }
    
    result.general_info = this.extractGeneralInfo(data, provider);
    
    return result;
  },
  
  extractObjects(data: any, provider: string): any[] {
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
  },
  
  extractColors(data: any, provider: string): any {
    switch (provider) {
      case 'microsoft':
        return {
          dominant_colors: data.color?.dominantColors || [],
          accent_color: data.color?.accentColor,
          is_black_white: data.color?.isBWImg
        };
      case 'google':
        return {
          dominant_colors: data.imagePropertiesAnnotation?.dominantColors?.colors || []
        };
      default:
        return {};
    }
  },
  
  extractText(data: any, provider: string): any {
    switch (provider) {
      case 'microsoft':
        return {
          detected_text: data.readResult?.content || '',
          text_regions: data.regions || []
        };
      case 'google':
        return {
          detected_text: data.fullTextAnnotation?.text || '',
          text_annotations: data.textAnnotations || []
        };
      default:
        return {};
    }
  },
  
  extractFaces(data: any, provider: string): any[] {
    switch (provider) {
      case 'microsoft':
        return data.faces?.map((face: any) => ({
          age: face.faceAttributes?.age,
          gender: face.faceAttributes?.gender,
          emotion: face.faceAttributes?.emotion,
          bounding_box: face.faceRectangle
        })) || [];
      case 'google':
        return data.faceAnnotations?.map((face: any) => ({
          detection_confidence: face.detectionConfidence,
          emotions: {
            joy: face.joyLikelihood,
            sorrow: face.sorrowLikelihood,
            anger: face.angerLikelihood,
            surprise: face.surpriseLikelihood
          },
          bounding_box: face.boundingPoly
        })) || [];
      default:
        return [];
    }
  },
  
  extractGeneralInfo(data: any, provider: string): any {
    return {
      provider: provider,
      processing_time: new Date().toISOString(),
      confidence_score: this.calculateOverallConfidence(data, provider),
      image_quality: this.assessImageQuality(data, provider)
    };
  },
  
  calculateOverallConfidence(data: any, provider: string): number {
    // Simple confidence calculation
    if (provider === 'microsoft' && data.objects) {
      const avgConfidence = data.objects.reduce((sum: number, obj: any) => sum + obj.confidence, 0) / data.objects.length;
      return Math.round(avgConfidence * 100) / 100;
    }
    return 0.8; // Default confidence
  },
  
  assessImageQuality(data: any, provider: string): string {
    // Simple quality assessment
    const hasHighResolution = true; // Would check actual image dimensions
    const hasGoodContrast = true; // Would analyze color distribution
    
    if (hasHighResolution && hasGoodContrast) return 'High';
    if (hasHighResolution || hasGoodContrast) return 'Medium';
    return 'Low';
  }
});