import { createCustomApiCallAction } from '@activepieces/pieces-common';
import { PieceAuth, createPiece } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { analyzeImage } from './lib/actions/analyze-image';
import { extractText } from './lib/actions/extract-text';
import { detectObjects } from './lib/actions/detect-objects';
import { generateImageDescription } from './lib/actions/generate-description';
import { faceDetection } from './lib/actions/face-detection';

const markdown = `
Untuk mendapatkan RapidAPI Key untuk AI Vision API, ikuti langkah berikut:

1. Kunjungi [RapidAPI Hub](https://rapidapi.com/hub)
2. Daftar atau login ke akun RapidAPI Anda
3. Subscribe ke AI Vision API yang diinginkan:
   - **Computer Vision API** (Microsoft Azure)
   - **Google Cloud Vision** (comprehensive analysis)
   - **Amazon Rekognition** (AWS service)
   - **Clarifai API** (custom models)
   - **API4AI** (multiple AI services)
4. Salin **X-RapidAPI-Key** dari dashboard
5. Masukkan key tersebut di field API Key di bawah

**Catatan**: Piece ini mendukung multiple AI vision providers untuk analisis gambar yang komprehensif.
`;

export const rapidApiAiVisionAuth = PieceAuth.SecretText({
  displayName: 'RapidAPI Key',
  description: markdown,
  required: true,
});

export const rapidApiAiVision = createPiece({
  displayName: 'RapidAPI AI Vision',
  description: 'Layanan AI untuk analisis gambar, OCR, object detection, dan computer vision menggunakan RapidAPI',
  minimumSupportedRelease: '0.36.1',
  logoUrl: 'https://cdn.activepieces.com/pieces/rapidapi.png',
  categories: [PieceCategory.ARTIFICIAL_INTELLIGENCE],
  auth: rapidApiAiVisionAuth,
  actions: [
    analyzeImage,
    extractText,
    detectObjects,
    generateImageDescription,
    faceDetection,
    createCustomApiCallAction({
      auth: rapidApiAiVisionAuth,
      baseUrl: () => 'https://microsoft-computer-vision3.p.rapidapi.com',
      authMapping: async (auth) => ({
        'X-RapidAPI-Key': auth as string,
        'X-RapidAPI-Host': 'microsoft-computer-vision3.p.rapidapi.com',
      }),
    }),
  ],
  authors: ['activepieces-community'],
  triggers: [],
});