import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, httpClient } from '@activepieces/pieces-common';
import { rapidApiNewsAuth } from '../..';

export const getTopHeadlines = createAction({
  auth: rapidApiNewsAuth,
  name: 'get_top_headlines',
  displayName: 'Ambil Berita Utama',
  description: 'Ambil berita utama dari berbagai sumber',
  props: {
    provider: Property.StaticDropdown({
      displayName: 'News Provider',
      required: true,
      defaultValue: 'newsapi',
      options: {
        options: [
          { label: 'NewsAPI', value: 'newsapi' },
          { label: 'Reuters', value: 'reuters' },
          { label: 'Associated Press', value: 'ap' }
        ]
      }
    }),
    country: Property.StaticDropdown({
      displayName: 'Negara',
      required: false,
      defaultValue: 'us',
      options: {
        options: [
          { label: 'United States', value: 'us' },
          { label: 'Indonesia', value: 'id' },
          { label: 'United Kingdom', value: 'gb' },
          { label: 'Australia', value: 'au' }
        ]
      }
    }),
    category: Property.StaticDropdown({
      displayName: 'Kategori',
      required: false,
      defaultValue: 'general',
      options: {
        options: [
          { label: 'General', value: 'general' },
          { label: 'Technology', value: 'technology' },
          { label: 'Business', value: 'business' },
          { label: 'Sports', value: 'sports' },
          { label: 'Science', value: 'science' }
        ]
      }
    }),
    pageSize: Property.Number({
      displayName: 'Jumlah Artikel',
      description: 'Jumlah artikel yang ingin diambil (maksimal 100)',
      required: false,
      defaultValue: 20,
    }),
    language: Property.StaticDropdown({
      displayName: 'Bahasa',
      required: false,
      defaultValue: 'en',
      options: {
        options: [
          { label: 'English', value: 'en' },
          { label: 'Indonesian', value: 'id' },
          { label: 'Spanish', value: 'es' }
        ]
      }
    }),
    sources: Property.ShortText({
      displayName: 'Sumber Berita',
      description: 'Daftar sumber berita dipisah koma (opsional). Contoh: bbc-news,cnn,reuters',
      required: false,
    })
  },
  async run({ auth, propsValue }) {
    const { provider, country, category, pageSize = 20, language, sources } = propsValue;
    
    try {
      let url = '';
      let headers: any = {};
      let queryParams: any = {};

      // Setup based on provider
      switch (provider) {
        case 'newsapi':
          url = 'https://newsapi.org/v2/top-headlines';
          headers = {
            'X-API-Key': auth,
            'Content-Type': 'application/json'
          };
          queryParams = {
            country: country,
            category: category,
            pageSize: Math.min(pageSize, 100),
            language: language
          };
          if (sources) {
            queryParams.sources = sources;
            delete queryParams.country; // NewsAPI doesn't allow both country and sources
          }
          break;
        
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      const response = await httpClient.sendRequest({
        method: HttpMethod.GET,
        url: url,
        headers: headers,
        queryParams: queryParams
      });

      const articles = response.body.articles || [];
      
      // Simple processing
      const processedArticles = articles.map((article: any, index: number) => ({
        id: `${provider}-${index}`,
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: article.source?.name || 'Unknown',
        author: article.author,
        content_snippet: article.content ? article.content.substring(0, 200) + '...' : null
      }));

      return {
        success: true,
        articles: processedArticles,
        total_results: articles.length,
        request_info: {
          provider: provider,
          country: country,
          category: category,
          language: language,
          timestamp: new Date().toISOString()
        }
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