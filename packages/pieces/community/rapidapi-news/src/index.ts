import { createCustomApiCallAction } from '@activepieces/pieces-common';
import { PieceAuth, createPiece } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { getTopHeadlines } from './lib/actions/get-top-headlines';
import { searchNews } from './lib/actions/search-news';
// import { getNewsByCategory } from './lib/actions/get-news-by-category';
import { getNewsSources } from './lib/actions/get-news-sources';
import { getTrendingNews } from './lib/actions/get-trending-news';

const markdown = `
Untuk mendapatkan RapidAPI Key untuk News API, ikuti langkah berikut:

1. Kunjungi [RapidAPI Hub](https://rapidapi.com/hub)
2. Daftar atau login ke akun RapidAPI Anda
3. Subscribe ke News API yang diinginkan:
   - **NewsAPI.org** (populer untuk berita global)
   - **News API by API-Ninjas** (gratis tier bagus)
   - **Currents API** (real-time news)
   - **News Data IO** (comprehensive coverage)
4. Salin **X-RapidAPI-Key** dari dashboard
5. Masukkan key tersebut di field API Key di bawah

**Catatan**: Piece ini mendukung multiple News API providers. Pastikan endpoint yang Anda gunakan sesuai dengan provider yang di-subscribe.
`;

export const rapidApiNewsAuth = PieceAuth.SecretText({
  displayName: 'RapidAPI Key',
  description: markdown,
  required: true,
});

export const rapidApiNews = createPiece({
  displayName: 'RapidAPI News',
  description: 'Akses berita terkini dari berbagai sumber menggunakan News APIs di RapidAPI',
  minimumSupportedRelease: '0.36.1',
  logoUrl: 'https://cdn.activepieces.com/pieces/rapidapi.png',
  categories: [PieceCategory.PRODUCTIVITY],
  auth: rapidApiNewsAuth,
  actions: [
    getTopHeadlines,
    searchNews,
    getTrendingNews,
    getNewsSources,
    createCustomApiCallAction({
      auth: rapidApiNewsAuth,
      baseUrl: () => 'https://newsapi.org',
      authMapping: async (auth) => ({
        'X-RapidAPI-Key': auth as string,
        'X-RapidAPI-Host': 'newsapi.org',
      }),
    }),
  ],
  authors: ['activepieces-community'],
  triggers: [],
});