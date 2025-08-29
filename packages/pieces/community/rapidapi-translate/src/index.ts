import { createCustomApiCallAction } from '@activepieces/pieces-common';
import { PieceAuth, createPiece } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { translateText } from './lib/actions/translate-text';
import { detectLanguage } from './lib/actions/detect-language';
import { batchTranslate } from './lib/actions/batch-translate';
import { getSupportedLanguages } from './lib/actions/get-supported-languages';
import { translateDocument } from './lib/actions/translate-document';

const markdown = `
Untuk mendapatkan RapidAPI Key untuk Translation API, ikuti langkah berikut:

1. Kunjungi [RapidAPI Hub](https://rapidapi.com/hub)
2. Daftar atau login ke akun RapidAPI Anda
3. Subscribe ke Translation API yang diinginkan:
   - **Google Translate** (paling akurat, paid)
   - **Microsoft Translator** (enterprise grade)
   - **DeepL API** (quality terbaik untuk EU languages)
   - **MyMemory Translation** (free tier bagus)
   - **Translate Plus** (multi-provider)
4. Salin **X-RapidAPI-Key** dari dashboard
5. Masukkan key tersebut di field API Key di bawah

**Catatan**: Piece ini mendukung multiple translation providers. Pastikan endpoint yang Anda gunakan sesuai dengan provider yang di-subscribe.
`;

export const rapidApiTranslateAuth = PieceAuth.SecretText({
  displayName: 'RapidAPI Key',
  description: markdown,
  required: true,
});

export const rapidApiTranslate = createPiece({
  displayName: 'RapidAPI Translate',
  description: 'Layanan terjemahan multi-bahasa menggunakan berbagai Translation APIs di RapidAPI',
  minimumSupportedRelease: '0.36.1',
  logoUrl: 'https://cdn.activepieces.com/pieces/rapidapi.png',
  categories: [PieceCategory.PRODUCTIVITY],
  auth: rapidApiTranslateAuth,
  actions: [
    translateText,
    detectLanguage,
    batchTranslate,
    getSupportedLanguages,
    translateDocument,
    createCustomApiCallAction({
      auth: rapidApiTranslateAuth,
      baseUrl: () => 'https://google-translate1.p.rapidapi.com',
      authMapping: async (auth) => ({
        'X-RapidAPI-Key': auth as string,
        'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com',
      }),
    }),
  ],
  authors: ['activepieces-community'],
  triggers: [],
});