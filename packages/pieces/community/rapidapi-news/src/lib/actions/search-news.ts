import {
  createAction,
  Property,
} from '@activepieces/pieces-framework';
import {
  HttpMethod,
  httpClient,
} from '@activepieces/pieces-common';
import { rapidApiNewsAuth } from '../..';

export const searchNews = createAction({
  auth: rapidApiNewsAuth,
  name: 'search_news',
  displayName: 'Cari Berita',
  description: 'Mencari berita berdasarkan keyword, topik, atau query tertentu',
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
    query: Property.LongText({
      displayName: 'Query Pencarian',
      description: 'Keyword atau query untuk mencari berita. Gunakan operator AND, OR, NOT untuk pencarian advanced',
      required: true,
      placeholder: 'AI teknologi, "artificial intelligence" AND Indonesia, blockchain OR cryptocurrency'
    }),
    searchIn: Property.StaticMultiSelectDropdown({
      displayName: 'Cari Dalam',
      description: 'Tentukan di bagian mana pencarian dilakukan',
      required: false,
      options: {
        options: [
          { label: 'Judul', value: 'title' },
          { label: 'Deskripsi', value: 'description' },
          { label: 'Konten', value: 'content' }
        ]
      }
    }),
    sortBy: Property.StaticDropdown({
      displayName: 'Urutkan Berdasarkan',
      description: 'Cara mengurutkan hasil pencarian',
      required: false,
      defaultValue: 'publishedAt',
      options: {
        options: [
          { label: 'Tanggal Publikasi (Terbaru)', value: 'publishedAt' },
          { label: 'Relevansi', value: 'relevancy' },
          { label: 'Popularitas', value: 'popularity' }
        ]
      }
    }),
    language: Property.StaticDropdown({
      displayName: 'Bahasa',
      description: 'Bahasa artikel yang dicari',
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
    fromDate: Property.DateTime({
      displayName: 'Dari Tanggal',
      description: 'Tanggal mulai pencarian (format: YYYY-MM-DD)',
      required: false,
      validators: []
    }),
    toDate: Property.DateTime({
      displayName: 'Sampai Tanggal',
      description: 'Tanggal akhir pencarian (format: YYYY-MM-DD)',
      required: false,
      validators: []
    }),
    domains: Property.ShortText({
      displayName: 'Domain Sumber',
      description: 'Batasi pencarian pada domain tertentu (pisah dengan koma)',
      required: false,
      placeholder: 'bbc.co.uk,cnn.com,kompas.com'
    }),
    excludeDomains: Property.ShortText({
      displayName: 'Kecualikan Domain',
      description: 'Kecualikan domain tertentu dari hasil pencarian',
      required: false,
      placeholder: 'example.com,spam-site.com'
    }),
    pageSize: Property.Number({
      displayName: 'Jumlah Artikel',
      description: 'Berapa banyak artikel yang ingin ditampilkan (max 100)',
      required: false,
      defaultValue: 20,
      validators: []
    }),
    page: Property.Number({
      displayName: 'Halaman',
      description: 'Halaman hasil pencarian (mulai dari 1)',
      required: false,
      defaultValue: 1,
      validators: []
    })
  },
  async run({ auth, propsValue }) {
    const { 
      provider = 'newsapi',
      query,
      searchIn,
      sortBy = 'publishedAt',
      language = 'id',
      fromDate,
      toDate,
      domains,
      excludeDomains,
      pageSize = 20,
      page = 1
    } = propsValue;
    
    try {
      let url: string;
      let queryParams: any = {};
      let hostHeader: string;
      
      // Format tanggal ke ISO string
      const formatDate = (dateString: string) => {
        return new Date(dateString).toISOString().split('T')[0];
      };
      
      // Konfigurasi berdasarkan provider
      switch (provider) {
        case 'newsapi':
          url = 'https://newsapi.org/v2/everything';
          hostHeader = 'newsapi.org';
          queryParams = {
            q: query,
            pageSize: Math.min(pageSize, 100),
            page: page,
            sortBy: sortBy,
            language: language
          };
          if (searchIn && searchIn.length > 0) queryParams.searchIn = searchIn.join(',');
          if (fromDate) queryParams.from = formatDate(fromDate);
          if (toDate) queryParams.to = formatDate(toDate);
          if (domains) queryParams.domains = domains;
          if (excludeDomains) queryParams.excludeDomains = excludeDomains;
          break;
          
        case 'ninjas':
          url = 'https://api.api-ninjas.com/v1/news';
          hostHeader = 'api.api-ninjas.com';
          queryParams = {
            q: query,
            limit: Math.min(pageSize, 50)
          };
          break;
          
        case 'currents':
          url = 'https://currentsapi.services/v1/search';
          hostHeader = 'currentsapi.services';
          queryParams = {
            keywords: query,
            page_size: Math.min(pageSize, 200),
            page_number: page,
            language: language
          };
          if (fromDate) queryParams.start_date = formatDate(fromDate);
          if (toDate) queryParams.end_date = formatDate(toDate);
          break;
          
        case 'newsdata':
          url = 'https://newsdata.io/api/1/news';
          hostHeader = 'newsdata.io';
          queryParams = {
            q: query,
            size: Math.min(pageSize, 50),
            page: page,
            language: language
          };
          if (fromDate) queryParams.from_date = formatDate(fromDate);
          if (toDate) queryParams.to_date = formatDate(toDate);
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
        id: article.id || `search-${index}`,
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
        relevancy_score: this.calculateRelevancy(article, query),
        search_highlights: this.extractHighlights(article, query)
      }));
      
      return {
        success: true,
        provider: provider,
        search_query: query,
        metadata: {
          total_results: totalResults,
          returned_articles: standardizedArticles.length,
          current_page: page,
          page_size: pageSize,
          total_pages: Math.ceil(totalResults / pageSize),
          has_more_results: (page * pageSize) < totalResults
        },
        articles: standardizedArticles,
        search_summary: {
          query: query,
          search_scope: searchIn || ['title', 'description', 'content'],
          date_range: {
            from: fromDate || null,
            to: toDate || null
          },
          filters: {
            language: language,
            domains: domains || null,
            exclude_domains: excludeDomains || null,
            sort_by: sortBy
          }
        },
        request_info: {
          timestamp: new Date().toISOString(),
          search_terms: query.split(/\s+/).filter(term => term.length > 2)
        },
        raw_response: newsData
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        error_code: error.response?.status || 'UNKNOWN_ERROR',
        provider: provider,
        search_query: query,
        details: error.response?.data || null
      };
    }
  },
  
  // Helper methods
  calculateRelevancy(article: any, query: string): number {
    const searchTerms = query.toLowerCase().split(/\s+/);
    const titleText = (article.title || '').toLowerCase();
    const descText = (article.description || '').toLowerCase();
    
    let score = 0;
    searchTerms.forEach(term => {
      if (titleText.includes(term)) score += 3;
      if (descText.includes(term)) score += 1;
    });
    
    return Math.min(score / searchTerms.length, 5);
  },
  
  extractHighlights(article: any, query: string): string[] {
    const searchTerms = query.toLowerCase().split(/\s+/);
    const text = `${article.title || ''} ${article.description || ''}`.toLowerCase();
    
    return searchTerms.filter(term => text.includes(term));
  }
});