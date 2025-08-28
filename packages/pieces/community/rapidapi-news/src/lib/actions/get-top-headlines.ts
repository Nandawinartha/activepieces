import {
  createAction,
  Property,
} from '@activepieces/pieces-framework';
import {
  HttpMethod,
  httpClient,
} from '@activepieces/pieces-common';
import { rapidApiNewsAuth } from '../..';

export const getTopHeadlines = createAction({
  auth: rapidApiNewsAuth,
  name: 'get_top_headlines',
  displayName: 'Dapatkan Berita Utama',
  description: 'Mendapatkan berita utama terkini dari berbagai sumber',
  props: {
    provider: Property.StaticDropdown({
      displayName: 'News Provider',
      description: 'Pilih provider News API yang ingin digunakan',
      required: true,
      defaultValue: 'newsapi',
      options: {
        options: [
          { label: 'NewsAPI.org', value: 'newsapi' },
          { label: 'News API by API-Ninjas', value: 'ninjas' },
          { label: 'Currents API', value: 'currents' },
          { label: 'News Data IO', value: 'newsdata' }
        ]
      }
    }),
    country: Property.StaticDropdown({
      displayName: 'Negara',
      description: 'Pilih negara untuk berita (opsional)',
      required: false,
      defaultValue: 'id',
      options: {
        options: [
          { label: 'Indonesia', value: 'id' },
          { label: 'United States', value: 'us' },
          { label: 'United Kingdom', value: 'gb' },
          { label: 'Australia', value: 'au' },
          { label: 'Canada', value: 'ca' },
          { label: 'Germany', value: 'de' },
          { label: 'France', value: 'fr' },
          { label: 'Japan', value: 'jp' },
          { label: 'China', value: 'cn' },
          { label: 'India', value: 'in' },
          { label: 'South Korea', value: 'kr' },
          { label: 'Singapore', value: 'sg' },
          { label: 'Malaysia', value: 'my' },
          { label: 'Thailand', value: 'th' },
          { label: 'Philippines', value: 'ph' },
          { label: 'Global (All)', value: '' }
        ]
      }
    }),
    category: Property.StaticDropdown({
      displayName: 'Kategori',
      description: 'Kategori berita (opsional)',
      required: false,
      options: {
        options: [
          { label: 'Semua Kategori', value: '' },
          { label: 'Bisnis', value: 'business' },
          { label: 'Hiburan', value: 'entertainment' },
          { label: 'Kesehatan', value: 'health' },
          { label: 'Sains', value: 'science' },
          { label: 'Olahraga', value: 'sports' },
          { label: 'Teknologi', value: 'technology' },
          { label: 'Politik', value: 'politics' },
          { label: 'Umum', value: 'general' }
        ]
      }
    }),
    pageSize: Property.Number({
      displayName: 'Jumlah Artikel',
      description: 'Berapa banyak artikel yang ingin ditampilkan (max 100)',
      required: false,
      defaultValue: 20,
      validators: []
    }),
    language: Property.StaticDropdown({
      displayName: 'Bahasa',
      description: 'Bahasa artikel (opsional)',
      required: false,
      defaultValue: 'id',
      options: {
        options: [
          { label: 'Bahasa Indonesia', value: 'id' },
          { label: 'English', value: 'en' },
          { label: 'العربية', value: 'ar' },
          { label: 'Deutsch', value: 'de' },
          { label: 'Español', value: 'es' },
          { label: 'Français', value: 'fr' },
          { label: 'עברית', value: 'he' },
          { label: 'Italiano', value: 'it' },
          { label: 'Nederlands', value: 'nl' },
          { label: 'Norsk', value: 'no' },
          { label: 'Português', value: 'pt' },
          { label: 'Русский', value: 'ru' },
          { label: 'Svenska', value: 'sv' },
          { label: '中文', value: 'zh' }
        ]
      }
    }),
    sources: Property.ShortText({
      displayName: 'Sumber Berita',
      description: 'Daftar sumber berita dipisah koma (opsional). Contoh: bbc-news,cnn,reuters',
      required: false,
      placeholder: 'bbc-news,cnn,reuters'
    })
  },
  async run({ auth, propsValue }) {
    const { 
      provider = 'newsapi',
      country = 'id',
      category,
      pageSize = 20,
      language = 'id',
      sources
    } = propsValue;
    
    try {
      let url: string;
      let queryParams: any = {};
      let hostHeader: string;
      
      // Konfigurasi berdasarkan provider
      switch (provider) {
        case 'newsapi':
          url = 'https://newsapi.org/v2/top-headlines';
          hostHeader = 'newsapi.org';
          queryParams = {
            pageSize: Math.min(pageSize, 100),
            language: language
          };
          if (country) queryParams.country = country;
          if (category) queryParams.category = category;
          if (sources) queryParams.sources = sources;
          break;
          
        case 'ninjas':
          url = 'https://api.api-ninjas.com/v1/news';
          hostHeader = 'api.api-ninjas.com';
          queryParams = {
            limit: Math.min(pageSize, 50)
          };
          if (category) queryParams.category = category;
          break;
          
        case 'currents':
          url = 'https://currentsapi.services/v1/latest-news';
          hostHeader = 'currentsapi.services';
          queryParams = {
            page_size: Math.min(pageSize, 200),
            language: language
          };
          if (country) queryParams.country = country;
          if (category) queryParams.category = category;
          break;
          
        case 'newsdata':
          url = 'https://newsdata.io/api/1/news';
          hostHeader = 'newsdata.io';
          queryParams = {
            size: Math.min(pageSize, 50),
            language: language
          };
          if (country) queryParams.country = country;
          if (category) queryParams.category = category;
          break;
          
        default:
          throw new Error(`Provider ${provider} tidak didukung`);
      }

      const response = await httpClient.sendRequest({
        method: HttpMethod.GET,
        url: url,
        headers: {
          'X-RapidAPI-Key': auth,
          'X-RapidAPI-Host': hostHeader,
        },
        queryParams
      });

      const newsData = response.body;
      
      // Normalize response berdasarkan provider
      let articles: any[] = [];
      let totalResults = 0;
      
      if (provider === 'newsapi') {
        articles = newsData.articles || [];
        totalResults = newsData.totalResults || 0;
      } else if (provider === 'ninjas') {
        articles = newsData || [];
        totalResults = articles.length;
      } else if (provider === 'currents') {
        articles = newsData.news || [];
        totalResults = articles.length;
      } else if (provider === 'newsdata') {
        articles = newsData.results || [];
        totalResults = newsData.totalResults || 0;
      }
      
      // Standarisasi format artikel
      const standardizedArticles = articles.map((article: any, index: number) => ({
        id: article.id || `article-${index}`,
        title: article.title || article.headline,
        description: article.description || article.excerpt || article.snippet,
        content: article.content || article.description,
        url: article.url || article.link,
        image: article.urlToImage || article.image || article.image_url,
        published_at: article.publishedAt || article.published || article.pubDate,
        source: {
          name: article.source?.name || article.author || provider,
          url: article.source?.url || article.url
        },
        author: article.author || null,
        category: article.category || category || 'general',
        language: article.language || language
      }));
      
      return {
        success: true,
        provider: provider,
        metadata: {
          total_results: totalResults,
          returned_articles: standardizedArticles.length,
          country: country || 'global',
          category: category || 'all',
          language: language,
          page_size: pageSize
        },
        articles: standardizedArticles,
        request_info: {
          timestamp: new Date().toISOString(),
          filters_applied: {
            country: country || null,
            category: category || null,
            language: language,
            sources: sources || null
          }
        },
        raw_response: newsData
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        error_code: error.response?.status || 'UNKNOWN_ERROR',
        provider: provider,
        details: error.response?.data || null
      };
    }
  },
});