import {
  createAction,
  Property,
} from '@activepieces/pieces-framework';
import {
  HttpMethod,
  httpClient,
} from '@activepieces/pieces-common';
import { rapidApiNewsAuth } from '../..';

export const getNewsByCategory = createAction({
  auth: rapidApiNewsAuth,
  name: 'get_news_by_category',
  displayName: 'Dapatkan Berita per Kategori',
  description: 'Mendapatkan berita terkini berdasarkan kategori tertentu',
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
    category: Property.StaticDropdown({
      displayName: 'Kategori',
      description: 'Pilih kategori berita yang diinginkan',
      required: true,
      defaultValue: 'technology',
      options: {
        options: [
          { label: '🏢 Bisnis', value: 'business' },
          { label: '🎭 Hiburan', value: 'entertainment' },
          { label: '🏥 Kesehatan', value: 'health' },
          { label: '🔬 Sains', value: 'science' },
          { label: '⚽ Olahraga', value: 'sports' },
          { label: '💻 Teknologi', value: 'technology' },
          { label: '🏛️ Politik', value: 'politics' },
          { label: '📰 Umum', value: 'general' },
          { label: '🌍 Internasional', value: 'world' },
          { label: '🏠 Domestik', value: 'domestic' },
          { label: '💰 Ekonomi', value: 'economics' },
          { label: '🎓 Pendidikan', value: 'education' },
          { label: '🌱 Lingkungan', value: 'environment' },
          { label: '🎨 Lifestyle', value: 'lifestyle' }
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
    timeframe: Property.StaticDropdown({
      displayName: 'Rentang Waktu',
      description: 'Pilih rentang waktu untuk berita',
      required: false,
      defaultValue: 'today',
      options: {
        options: [
          { label: 'Hari Ini', value: 'today' },
          { label: '24 Jam Terakhir', value: '24h' },
          { label: '3 Hari Terakhir', value: '3d' },
          { label: '1 Minggu Terakhir', value: '1w' },
          { label: '1 Bulan Terakhir', value: '1m' },
          { label: 'Semua Waktu', value: 'all' }
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
    pageSize: Property.Number({
      displayName: 'Jumlah Artikel',
      description: 'Berapa banyak artikel yang ingin ditampilkan (max 100)',
      required: false,
      defaultValue: 20,
      validators: []
    }),
    sortBy: Property.StaticDropdown({
      displayName: 'Urutkan Berdasarkan',
      description: 'Cara mengurutkan hasil',
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
    includeAnalytics: Property.Checkbox({
      displayName: 'Sertakan Analytics',
      description: 'Apakah ingin menyertakan analisis sentimen dan trending topics',
      required: false,
      defaultValue: true
    })
  },
  async run({ auth, propsValue }) {
    const { 
      provider = 'newsapi',
      category,
      country = 'id',
      timeframe = 'today',
      language = 'id',
      pageSize = 20,
      sortBy = 'publishedAt',
      includeAnalytics = true
    } = propsValue;
    
    try {
      let url: string;
      let queryParams: any = {};
      let hostHeader: string;
      
      // Calculate date range based on timeframe
      const getDateRange = (timeframe: string) => {
        const now = new Date();
        const fromDate = new Date();
        
        switch (timeframe) {
          case 'today':
            fromDate.setHours(0, 0, 0, 0);
            break;
          case '24h':
            fromDate.setDate(now.getDate() - 1);
            break;
          case '3d':
            fromDate.setDate(now.getDate() - 3);
            break;
          case '1w':
            fromDate.setDate(now.getDate() - 7);
            break;
          case '1m':
            fromDate.setMonth(now.getMonth() - 1);
            break;
          case 'all':
            return { from: null, to: null };
        }
        
        return {
          from: fromDate.toISOString().split('T')[0],
          to: now.toISOString().split('T')[0]
        };
      };
      
      const dateRange = getDateRange(timeframe);
      
      // Konfigurasi berdasarkan provider
      switch (provider) {
        case 'newsapi':
          url = 'https://newsapi.org/v2/top-headlines';
          hostHeader = 'newsapi.org';
          queryParams = {
            category: category,
            pageSize: Math.min(pageSize, 100),
            sortBy: sortBy,
            language: language
          };
          if (country) queryParams.country = country;
          break;
          
        case 'ninjas':
          url = 'https://api.api-ninjas.com/v1/news';
          hostHeader = 'api.api-ninjas.com';
          queryParams = {
            category: category,
            limit: Math.min(pageSize, 50)
          };
          break;
          
        case 'currents':
          url = 'https://currentsapi.services/v1/latest-news';
          hostHeader = 'currentsapi.services';
          queryParams = {
            category: category,
            page_size: Math.min(pageSize, 200),
            language: language
          };
          if (country) queryParams.country = country;
          if (dateRange.from) queryParams.start_date = dateRange.from;
          if (dateRange.to) queryParams.end_date = dateRange.to;
          break;
          
        case 'newsdata':
          url = 'https://newsdata.io/api/1/news';
          hostHeader = 'newsdata.io';
          queryParams = {
            category: category,
            size: Math.min(pageSize, 50),
            language: language
          };
          if (country) queryParams.country = country;
          if (dateRange.from) queryParams.from_date = dateRange.from;
          if (dateRange.to) queryParams.to_date = dateRange.to;
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
        id: article.id || `${category}-${index}`,
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
        category: category,
        language: article.language || language,
        engagement: {
          estimated_read_time: this.calculateReadTime(article.content || article.description),
          word_count: this.countWords(article.content || article.description)
        }
      }));
      
      // Generate analytics jika diminta
      let analytics = null;
      if (includeAnalytics) {
        analytics = this.generateAnalytics(standardizedArticles, category);
      }
      
      return {
        success: true,
        provider: provider,
        category: category,
        metadata: {
          total_results: totalResults,
          returned_articles: standardizedArticles.length,
          country: country || 'global',
          language: language,
          timeframe: timeframe,
          date_range: dateRange,
          sort_by: sortBy
        },
        articles: standardizedArticles,
        analytics: analytics,
        category_info: {
          name: category,
          description: this.getCategoryDescription(category),
          related_topics: this.getRelatedTopics(category)
        },
        request_info: {
          timestamp: new Date().toISOString(),
          filters_applied: {
            category: category,
            country: country || null,
            language: language,
            timeframe: timeframe
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
        category: category,
        details: error.response?.data || null
      };
    }
  },
  
  // Helper methods
  calculateReadTime(content: string): number {
    if (!content) return 0;
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  },
  
  countWords(content: string): number {
    if (!content) return 0;
    return content.split(/\s+/).length;
  },
  
  generateAnalytics(articles: any[], category: string) {
    const now = new Date();
    const last24h = articles.filter(article => {
      const pubDate = new Date(article.published_at);
      return (now.getTime() - pubDate.getTime()) < 24 * 60 * 60 * 1000;
    });
    
    return {
      total_articles: articles.length,
      articles_last_24h: last24h.length,
      avg_read_time: articles.reduce((sum, article) => 
        sum + article.engagement.estimated_read_time, 0) / articles.length,
      top_sources: this.getTopSources(articles),
      trending_keywords: this.extractTrendingKeywords(articles),
      publication_timeline: this.getPublicationTimeline(articles),
      sentiment_analysis: this.analyzeSentiment(articles)
    };
  },
  
  getTopSources(articles: any[]): any[] {
    const sourceCount: { [key: string]: number } = {};
    articles.forEach(article => {
      const source = article.source.name;
      sourceCount[source] = (sourceCount[source] || 0) + 1;
    });
    
    return Object.entries(sourceCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([source, count]) => ({ source, count }));
  },
  
  extractTrendingKeywords(articles: any[]): string[] {
    const allText = articles.map(article => 
      `${article.title} ${article.description}`).join(' ').toLowerCase();
    
    const words = allText.match(/\b\w{4,}\b/g) || [];
    const wordCount: { [key: string]: number } = {};
    
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  },
  
  getPublicationTimeline(articles: any[]) {
    const timeline: { [key: string]: number } = {};
    articles.forEach(article => {
      const date = new Date(article.published_at).toISOString().split('T')[0];
      timeline[date] = (timeline[date] || 0) + 1;
    });
    
    return Object.entries(timeline)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  },
  
  analyzeSentiment(articles: any[]) {
    // Simple sentiment analysis based on keywords
    const positiveWords = ['good', 'great', 'excellent', 'success', 'positive', 'growth', 'increase'];
    const negativeWords = ['bad', 'terrible', 'crisis', 'decline', 'decrease', 'problem', 'issue'];
    
    let positive = 0, negative = 0, neutral = 0;
    
    articles.forEach(article => {
      const text = `${article.title} ${article.description}`.toLowerCase();
      const hasPositive = positiveWords.some(word => text.includes(word));
      const hasNegative = negativeWords.some(word => text.includes(word));
      
      if (hasPositive && !hasNegative) positive++;
      else if (hasNegative && !hasPositive) negative++;
      else neutral++;
    });
    
    return {
      positive: { count: positive, percentage: (positive / articles.length * 100).toFixed(1) },
      negative: { count: negative, percentage: (negative / articles.length * 100).toFixed(1) },
      neutral: { count: neutral, percentage: (neutral / articles.length * 100).toFixed(1) }
    };
  },
  
  getCategoryDescription(category: string): string {
    const descriptions: { [key: string]: string } = {
      'business': 'Berita bisnis, ekonomi, keuangan, dan dunia usaha',
      'technology': 'Teknologi, inovasi, gadget, dan perkembangan digital',
      'health': 'Kesehatan, medis, dan kesejahteraan',
      'science': 'Sains, penelitian, dan penemuan ilmiah',
      'sports': 'Olahraga, pertandingan, dan prestasi atlet',
      'entertainment': 'Hiburan, selebriti, film, dan musik',
      'politics': 'Politik, pemerintahan, dan kebijakan publik',
      'general': 'Berita umum dan berbagai topik'
    };
    return descriptions[category] || 'Berita dalam kategori yang dipilih';
  },
  
  getRelatedTopics(category: string): string[] {
    const related: { [key: string]: string[] } = {
      'business': ['ekonomi', 'investasi', 'startup', 'keuangan', 'pasar saham'],
      'technology': ['AI', 'blockchain', 'IoT', 'cybersecurity', 'software'],
      'health': ['vaksin', 'pandemic', 'mental health', 'nutrition', 'medicine'],
      'science': ['research', 'climate', 'space', 'biology', 'physics'],
      'sports': ['football', 'basketball', 'olympics', 'championship', 'athlete'],
      'entertainment': ['movie', 'music', 'celebrity', 'streaming', 'gaming'],
      'politics': ['election', 'policy', 'government', 'international', 'law'],
      'general': ['breaking news', 'updates', 'current events', 'headlines']
    };
    return related[category] || [];
  }
});