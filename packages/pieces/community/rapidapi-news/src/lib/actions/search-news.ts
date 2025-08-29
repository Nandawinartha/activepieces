import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, httpClient } from '@activepieces/pieces-common';
import { rapidApiNewsAuth } from '../..';

export const searchNews = createAction({
  auth: rapidApiNewsAuth,
  name: 'search_news',
  displayName: 'Cari Berita',
  description: 'Cari berita berdasarkan kata kunci',
  props: {
    provider: Property.StaticDropdown({
      displayName: 'Search Provider',
      required: true,
      defaultValue: 'newsapi',
      options: {
        options: [
          { label: 'NewsAPI', value: 'newsapi' },
          { label: 'News Catcher', value: 'newscatcher' }
        ]
      }
    }),
    query: Property.LongText({
      displayName: 'Query Pencarian',
      description: 'Keyword atau query untuk mencari berita',
      required: true,
    }),
    searchIn: Property.StaticMultiSelectDropdown({
      displayName: 'Cari Dalam',
      required: false,
      defaultValue: ['title', 'description'],
      options: {
        options: [
          { label: 'Title', value: 'title' },
          { label: 'Description', value: 'description' },
          { label: 'Content', value: 'content' }
        ]
      }
    }),
    sortBy: Property.StaticDropdown({
      displayName: 'Urutkan Berdasarkan',
      required: false,
      defaultValue: 'publishedAt',
      options: {
        options: [
          { label: 'Published Date', value: 'publishedAt' },
          { label: 'Relevancy', value: 'relevancy' },
          { label: 'Popularity', value: 'popularity' }
        ]
      }
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
    fromDate: Property.DateTime({
      displayName: 'Dari Tanggal',
      description: 'Tanggal mulai pencarian (format: YYYY-MM-DD)',
      required: false,
    }),
    toDate: Property.DateTime({
      displayName: 'Sampai Tanggal',
      description: 'Tanggal akhir pencarian (format: YYYY-MM-DD)',
      required: false,
    }),
    domains: Property.ShortText({
      displayName: 'Domain Sumber',
      description: 'Batasi pencarian pada domain tertentu (pisah dengan koma)',
      required: false,
    }),
    excludeDomains: Property.ShortText({
      displayName: 'Kecualikan Domain',
      description: 'Kecualikan domain tertentu dari hasil pencarian',
      required: false,
    }),
    pageSize: Property.Number({
      displayName: 'Jumlah Artikel',
      description: 'Jumlah artikel per halaman (maksimal 100)',
      required: false,
      defaultValue: 20,
    }),
    page: Property.Number({
      displayName: 'Halaman',
      description: 'Nomor halaman untuk pagination',
      required: false,
      defaultValue: 1,
    })
  },
  async run({ auth, propsValue }) {
    const { 
      provider, 
      query, 
      searchIn = ['title', 'description'], 
      sortBy = 'publishedAt',
      language = 'en',
      fromDate,
      toDate,
      domains,
      excludeDomains,
      pageSize = 20,
      page = 1
    } = propsValue;
    
    try {
      let url = '';
      let headers: any = {};
      let queryParams: any = {};

      switch (provider) {
        case 'newsapi':
          url = 'https://newsapi.org/v2/everything';
          headers = {
            'X-API-Key': auth,
            'Content-Type': 'application/json'
          };
          queryParams = {
            q: query,
            searchIn: searchIn.join(','),
            sortBy: sortBy,
            language: language,
            pageSize: Math.min(pageSize, 100),
            page: page
          };
          
          if (fromDate) queryParams.from = fromDate;
          if (toDate) queryParams.to = toDate;
          if (domains) queryParams.domains = domains;
          if (excludeDomains) queryParams.excludeDomains = excludeDomains;
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
      const totalResults = response.body.totalResults || 0;
      
      // Simple processing
      const processedArticles = articles.map((article: any, index: number) => ({
        id: `search-${page}-${index}`,
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: {
          id: article.source?.id,
          name: article.source?.name || 'Unknown'
        },
        author: article.author || null,
        relevancy_score: 0.8, // Simple mock score
        search_highlights: query.toLowerCase().split(' ').filter(term => 
          article.title?.toLowerCase().includes(term) || 
          article.description?.toLowerCase().includes(term)
        )
      }));

      return {
        success: true,
        articles: processedArticles,
        search_info: {
          query: query,
          total_results: totalResults,
          page: page,
          page_size: pageSize,
          search_in: searchIn,
          sort_by: sortBy,
          language: language
        },
        pagination: {
          current_page: page,
          total_pages: Math.ceil(totalResults / pageSize),
          has_next_page: page * pageSize < totalResults,
          has_previous_page: page > 1
        },
        request_info: {
          provider: provider,
          timestamp: new Date().toISOString(),
          filters_applied: {
            date_range: fromDate || toDate ? { from: fromDate, to: toDate } : null,
            domains: domains || null,
            exclude_domains: excludeDomains || null
          }
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        query: query,
        provider: provider
      };
    }
  }
});