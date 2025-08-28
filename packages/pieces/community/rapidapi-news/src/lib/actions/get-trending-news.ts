import {
  createAction,
  Property,
} from '@activepieces/pieces-framework';
import {
  HttpMethod,
  httpClient,
} from '@activepieces/pieces-common';
import { rapidApiNewsAuth } from '../..';

export const getTrendingNews = createAction({
  auth: rapidApiNewsAuth,
  name: 'get_trending_news',
  displayName: 'Dapatkan Berita Trending',
  description: 'Mendapatkan berita yang sedang trending dan viral saat ini',
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
    trendingType: Property.StaticDropdown({
      displayName: 'Jenis Trending',
      description: 'Pilih jenis berita trending yang diinginkan',
      required: false,
      defaultValue: 'viral',
      options: {
        options: [
          { label: '🔥 Viral (Most Shared)', value: 'viral' },
          { label: '📈 Popular (Most Read)', value: 'popular' },
          { label: '💬 Most Discussed', value: 'discussed' },
          { label: '⚡ Breaking News', value: 'breaking' },
          { label: '🌍 Global Trending', value: 'global' },
          { label: '📍 Local Trending', value: 'local' }
        ]
      }
    }),
    region: Property.StaticDropdown({
      displayName: 'Wilayah',
      description: 'Pilih wilayah untuk trending news',
      required: false,
      defaultValue: 'id',
      options: {
        options: [
          { label: '🇮🇩 Indonesia', value: 'id' },
          { label: '🇺🇸 United States', value: 'us' },
          { label: '🇬🇧 United Kingdom', value: 'gb' },
          { label: '🇦🇺 Australia', value: 'au' },
          { label: '🇨🇦 Canada', value: 'ca' },
          { label: '🇩🇪 Germany', value: 'de' },
          { label: '🇫🇷 France', value: 'fr' },
          { label: '🇯🇵 Japan', value: 'jp' },
          { label: '🇨🇳 China', value: 'cn' },
          { label: '🇮🇳 India', value: 'in' },
          { label: '🇰🇷 South Korea', value: 'kr' },
          { label: '🇸🇬 Singapore', value: 'sg' },
          { label: '🇲🇾 Malaysia', value: 'my' },
          { label: '🇹🇭 Thailand', value: 'th' },
          { label: '🇵🇭 Philippines', value: 'ph' },
          { label: '🌍 Global', value: 'global' }
        ]
      }
    }),
    timeWindow: Property.StaticDropdown({
      displayName: 'Window Waktu',
      description: 'Pilih periode waktu untuk analisis trending',
      required: false,
      defaultValue: '24h',
      options: {
        options: [
          { label: '1 Jam Terakhir', value: '1h' },
          { label: '6 Jam Terakhir', value: '6h' },
          { label: '24 Jam Terakhir', value: '24h' },
          { label: '3 Hari Terakhir', value: '3d' },
          { label: '1 Minggu Terakhir', value: '1w' }
        ]
      }
    }),
    language: Property.StaticDropdown({
      displayName: 'Bahasa',
      description: 'Bahasa artikel trending',
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
      description: 'Berapa banyak artikel trending yang ingin ditampilkan (max 50)',
      required: false,
      defaultValue: 20,
      validators: []
    }),
    includeTrendingScore: Property.Checkbox({
      displayName: 'Sertakan Trending Score',
      description: 'Apakah ingin menyertakan skor trending dan analytics',
      required: false,
      defaultValue: true
    }),
    includeHashtags: Property.Checkbox({
      displayName: 'Sertakan Hashtags',
      description: 'Apakah ingin menyertakan hashtags dan topik viral',
      required: false,
      defaultValue: true
    })
  },
  async run({ auth, propsValue }) {
    const { 
      provider = 'newsapi',
      trendingType = 'viral',
      region = 'id',
      timeWindow = '24h',
      language = 'id',
      pageSize = 20,
      includeTrendingScore = true,
      includeHashtags = true
    } = propsValue;
    
    try {
      let url: string;
      let queryParams: any = {};
      let hostHeader: string;
      
      // Calculate date range based on time window
      const getTimeRange = (window: string) => {
        const now = new Date();
        const fromDate = new Date();
        
        switch (window) {
          case '1h':
            fromDate.setHours(now.getHours() - 1);
            break;
          case '6h':
            fromDate.setHours(now.getHours() - 6);
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
        }
        
        return {
          from: fromDate.toISOString(),
          to: now.toISOString()
        };
      };
      
      const timeRange = getTimeRange(timeWindow);
      
      // Konfigurasi berdasarkan provider dan trending type
      switch (provider) {
        case 'newsapi':
          url = 'https://newsapi.org/v2/top-headlines';
          hostHeader = 'newsapi.org';
          queryParams = {
            pageSize: Math.min(pageSize, 100),
            sortBy: 'popularity', // untuk trending
            language: language
          };
          if (region !== 'global') queryParams.country = region;
          break;
          
        case 'ninjas':
          url = 'https://api.api-ninjas.com/v1/news';
          hostHeader = 'api.api-ninjas.com';
          queryParams = {
            limit: Math.min(pageSize, 50)
          };
          break;
          
        case 'currents':
          url = 'https://currentsapi.services/v1/latest-news';
          hostHeader = 'currentsapi.services';
          queryParams = {
            page_size: Math.min(pageSize, 200),
            language: language,
            type: 'trending' // Currents specific parameter
          };
          if (region !== 'global') queryParams.country = region;
          break;
          
        case 'newsdata':
          url = 'https://newsdata.io/api/1/news';
          hostHeader = 'newsdata.io';
          queryParams = {
            size: Math.min(pageSize, 50),
            language: language,
            prioritydomain: 'top' // NewsData.io parameter untuk trending
          };
          if (region !== 'global') queryParams.country = region;
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
      
      // Calculate trending score untuk setiap artikel
      const articlesWithTrending = articles.map((article: any, index: number) => {
        const trendingScore = this.calculateTrendingScore(article, trendingType, timeWindow);
        
        return {
          id: article.id || `trending-${index}`,
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
          category: article.category || 'trending',
          language: article.language || language,
          trending_data: includeTrendingScore ? {
            score: trendingScore,
            rank: index + 1,
            type: trendingType,
            engagement_indicators: this.getEngagementIndicators(article),
            viral_metrics: this.getViralMetrics(article, timeWindow)
          } : null,
          hashtags: includeHashtags ? this.extractHashtags(article) : null
        };
      });
      
      // Sort berdasarkan trending score
      if (includeTrendingScore) {
        articlesWithTrending.sort((a, b) => 
          (b.trending_data?.score || 0) - (a.trending_data?.score || 0)
        );
        
        // Update ranking setelah sorting
        articlesWithTrending.forEach((article, index) => {
          if (article.trending_data) {
            article.trending_data.rank = index + 1;
          }
        });
      }
      
      // Generate trending analytics
      const trendingAnalytics = this.generateTrendingAnalytics(
        articlesWithTrending, 
        trendingType, 
        timeWindow, 
        region
      );
      
      return {
        success: true,
        provider: provider,
        trending_type: trendingType,
        metadata: {
          total_results: totalResults,
          returned_articles: articlesWithTrending.length,
          region: region,
          language: language,
          time_window: timeWindow,
          time_range: timeRange,
          analysis_timestamp: new Date().toISOString()
        },
        articles: articlesWithTrending,
        trending_analytics: trendingAnalytics,
        trending_summary: {
          top_trending_topics: this.getTopTrendingTopics(articlesWithTrending),
          viral_hashtags: includeHashtags ? this.getViralHashtags(articlesWithTrending) : null,
          trending_sources: this.getTrendingSources(articlesWithTrending),
          regional_highlights: this.getRegionalHighlights(articlesWithTrending, region)
        },
        request_info: {
          timestamp: new Date().toISOString(),
          filters_applied: {
            trending_type: trendingType,
            region: region,
            language: language,
            time_window: timeWindow
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
        trending_type: trendingType,
        details: error.response?.data || null
      };
    }
  },
  
  // Helper methods untuk trending analytics
  calculateTrendingScore(article: any, trendingType: string, timeWindow: string): number {
    let score = 0;
    
    // Base score dari recency
    const publishedDate = new Date(article.publishedAt || article.published || article.pubDate || Date.now());
    const hoursAgo = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60);
    const recencyScore = Math.max(0, 100 - hoursAgo * 2); // Semakin baru semakin tinggi
    
    // Title engagement score
    const titleLength = (article.title || '').length;
    const titleScore = titleLength > 50 && titleLength < 100 ? 20 : 10;
    
    // Content quality score
    const hasImage = article.urlToImage || article.image ? 15 : 0;
    const hasContent = article.content || article.description ? 10 : 0;
    
    // Keywords trending score
    const trendingKeywords = ['viral', 'breaking', 'exclusive', 'trending', 'hot', 'popular'];
    const titleText = (article.title || '').toLowerCase();
    const keywordScore = trendingKeywords.filter(keyword => titleText.includes(keyword)).length * 5;
    
    score = recencyScore + titleScore + hasImage + hasContent + keywordScore;
    
    // Adjust berdasarkan trending type
    switch (trendingType) {
      case 'viral':
        score += keywordScore * 2;
        break;
      case 'breaking':
        score += recencyScore * 0.5;
        break;
      case 'popular':
        score += titleScore * 1.5;
        break;
    }
    
    return Math.min(score, 100);
  },
  
  getEngagementIndicators(article: any) {
    const title = article.title || '';
    const description = article.description || '';
    
    return {
      has_question_in_title: title.includes('?'),
      has_numbers_in_title: /\d/.test(title),
      title_word_count: title.split(/\s+/).length,
      description_word_count: description.split(/\s+/).length,
      has_call_to_action: /read more|click here|learn more|find out/i.test(description),
      emotional_words: this.countEmotionalWords(title + ' ' + description)
    };
  },
  
  getViralMetrics(article: any, timeWindow: string) {
    const publishedDate = new Date(article.publishedAt || article.published || Date.now());
    const now = new Date();
    const hoursAgo = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60);
    
    return {
      recency_hours: Math.round(hoursAgo * 100) / 100,
      viral_velocity: this.calculateViralVelocity(article, hoursAgo),
      peak_potential: this.calculatePeakPotential(article),
      social_signals: this.extractSocialSignals(article)
    };
  },
  
  extractHashtags(article: any): string[] {
    const text = `${article.title || ''} ${article.description || ''}`.toLowerCase();
    const commonHashtags = [
      '#breaking', '#viral', '#trending', '#news', '#update',
      '#indonesia', '#global', '#technology', '#politics', '#business'
    ];
    
    return commonHashtags.filter(hashtag => 
      text.includes(hashtag.substring(1))
    );
  },
  
  generateTrendingAnalytics(articles: any[], trendingType: string, timeWindow: string, region: string) {
    return {
      total_trending_articles: articles.length,
      avg_trending_score: articles.reduce((sum, article) => 
        sum + (article.trending_data?.score || 0), 0) / articles.length,
      score_distribution: this.getScoreDistribution(articles),
      time_analysis: this.getTimeAnalysis(articles, timeWindow),
      regional_trends: this.getRegionalTrends(articles, region),
      category_breakdown: this.getCategoryBreakdown(articles),
      viral_patterns: this.getViralPatterns(articles, trendingType)
    };
  },
  
  getTopTrendingTopics(articles: any[]): string[] {
    const allTitles = articles.map(article => article.title || '').join(' ').toLowerCase();
    const words = allTitles.match(/\b\w{4,}\b/g) || [];
    const wordCount: { [key: string]: number } = {};
    
    words.forEach(word => {
      if (!['this', 'that', 'with', 'from', 'they', 'have', 'been', 'will'].includes(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
    
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  },
  
  getViralHashtags(articles: any[]): string[] {
    const allHashtags: string[] = [];
    articles.forEach(article => {
      if (article.hashtags) {
        allHashtags.push(...article.hashtags);
      }
    });
    
    const hashtagCount: { [key: string]: number } = {};
    allHashtags.forEach(hashtag => {
      hashtagCount[hashtag] = (hashtagCount[hashtag] || 0) + 1;
    });
    
    return Object.entries(hashtagCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([hashtag]) => hashtag);
  },
  
  getTrendingSources(articles: any[]) {
    const sourceCount: { [key: string]: number } = {};
    articles.forEach(article => {
      const source = article.source.name;
      sourceCount[source] = (sourceCount[source] || 0) + 1;
    });
    
    return Object.entries(sourceCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([source, count]) => ({ source, count, percentage: (count / articles.length * 100).toFixed(1) }));
  },
  
  getRegionalHighlights(articles: any[], region: string) {
    return {
      region: region,
      total_articles: articles.length,
      top_local_story: articles[0] || null,
      avg_recency_hours: articles.reduce((sum, article) => 
        sum + (article.trending_data?.viral_metrics?.recency_hours || 0), 0) / articles.length
    };
  },
  
  // Additional helper methods
  countEmotionalWords(text: string): number {
    const emotionalWords = [
      'amazing', 'incredible', 'shocking', 'devastating', 'breakthrough',
      'crisis', 'victory', 'disaster', 'miracle', 'urgent', 'critical'
    ];
    return emotionalWords.filter(word => text.toLowerCase().includes(word)).length;
  },
  
  calculateViralVelocity(article: any, hoursAgo: number): number {
    // Simple viral velocity calculation
    if (hoursAgo < 1) return 100;
    if (hoursAgo < 6) return 80;
    if (hoursAgo < 24) return 60;
    return 30;
  },
  
  calculatePeakPotential(article: any): number {
    const title = article.title || '';
    const factors = [
      title.includes('?') ? 10 : 0,
      /\d/.test(title) ? 15 : 0,
      title.length > 50 && title.length < 100 ? 20 : 0,
      article.urlToImage ? 15 : 0
    ];
    return factors.reduce((sum, factor) => sum + factor, 0);
  },
  
  extractSocialSignals(article: any) {
    const title = article.title || '';
    return {
      has_trending_keywords: ['viral', 'trending', 'breaking'].some(word => 
        title.toLowerCase().includes(word)),
      shareability_score: this.calculateShareabilityScore(article),
      clickbait_indicators: this.getClickbaitIndicators(title)
    };
  },
  
  calculateShareabilityScore(article: any): number {
    let score = 0;
    const title = article.title || '';
    
    if (title.includes('?')) score += 20;
    if (/\d/.test(title)) score += 15;
    if (title.toLowerCase().includes('you')) score += 10;
    if (article.urlToImage) score += 25;
    if (article.description && article.description.length > 100) score += 10;
    
    return Math.min(score, 100);
  },
  
  getClickbaitIndicators(title: string): string[] {
    const indicators = [];
    if (title.includes('?')) indicators.push('question');
    if (/\d/.test(title)) indicators.push('numbers');
    if (title.toLowerCase().includes('you')) indicators.push('personal');
    if (/won't believe|shocking|amazing/i.test(title)) indicators.push('emotional');
    return indicators;
  },
  
  getScoreDistribution(articles: any[]) {
    const ranges = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
    articles.forEach(article => {
      const score = article.trending_data?.score || 0;
      if (score <= 20) ranges['0-20']++;
      else if (score <= 40) ranges['21-40']++;
      else if (score <= 60) ranges['41-60']++;
      else if (score <= 80) ranges['61-80']++;
      else ranges['81-100']++;
    });
    return ranges;
  },
  
  getTimeAnalysis(articles: any[], timeWindow: string) {
    const now = new Date();
    const periods: { [key: string]: number } = {};
    
    articles.forEach(article => {
      const publishedDate = new Date(article.published_at);
      const hoursAgo = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60));
      
      let period;
      if (hoursAgo < 1) period = '0-1h';
      else if (hoursAgo < 6) period = '1-6h';
      else if (hoursAgo < 24) period = '6-24h';
      else period = '24h+';
      
      periods[period] = (periods[period] || 0) + 1;
    });
    
    return periods;
  },
  
  getRegionalTrends(articles: any[], region: string) {
    return {
      region: region,
      dominant_topics: this.getTopTrendingTopics(articles).slice(0, 5),
      regional_keywords: this.getRegionalKeywords(articles, region)
    };
  },
  
  getCategoryBreakdown(articles: any[]) {
    const categories: { [key: string]: number } = {};
    articles.forEach(article => {
      const category = article.category || 'general';
      categories[category] = (categories[category] || 0) + 1;
    });
    
    return Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .map(([category, count]) => ({ category, count }));
  },
  
  getViralPatterns(articles: any[], trendingType: string) {
    return {
      trending_type: trendingType,
      peak_hours: this.getPeakHours(articles),
      common_patterns: this.getCommonPatterns(articles),
      viral_indicators: this.getViralIndicators(articles)
    };
  },
  
  getPeakHours(articles: any[]): number[] {
    const hours: { [key: number]: number } = {};
    articles.forEach(article => {
      const hour = new Date(article.published_at).getHours();
      hours[hour] = (hours[hour] || 0) + 1;
    });
    
    return Object.entries(hours)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
  },
  
  getCommonPatterns(articles: any[]): string[] {
    const patterns = [];
    const totalArticles = articles.length;
    
    const withImages = articles.filter(a => a.image).length;
    if (withImages / totalArticles > 0.7) patterns.push('high_visual_content');
    
    const withQuestions = articles.filter(a => a.title?.includes('?')).length;
    if (withQuestions / totalArticles > 0.3) patterns.push('question_driven');
    
    const recentArticles = articles.filter(a => {
      const hoursAgo = (Date.now() - new Date(a.published_at).getTime()) / (1000 * 60 * 60);
      return hoursAgo < 6;
    }).length;
    if (recentArticles / totalArticles > 0.5) patterns.push('real_time_trending');
    
    return patterns;
  },
  
  getViralIndicators(articles: any[]): any {
    return {
      avg_title_length: articles.reduce((sum, a) => sum + (a.title?.length || 0), 0) / articles.length,
      emotional_content_ratio: articles.filter(a => 
        this.countEmotionalWords(a.title + ' ' + a.description) > 0
      ).length / articles.length,
      multimedia_ratio: articles.filter(a => a.image).length / articles.length,
      recency_ratio: articles.filter(a => {
        const hoursAgo = (Date.now() - new Date(a.published_at).getTime()) / (1000 * 60 * 60);
        return hoursAgo < 24;
      }).length / articles.length
    };
  },
  
  getRegionalKeywords(articles: any[], region: string): string[] {
    const regionalTerms: { [key: string]: string[] } = {
      'id': ['indonesia', 'jakarta', 'jokowi', 'rupiah', 'nusantara'],
      'us': ['america', 'biden', 'congress', 'dollar', 'states'],
      'gb': ['britain', 'london', 'pound', 'parliament', 'uk'],
      'jp': ['japan', 'tokyo', 'yen', 'nintendo', 'anime'],
      'cn': ['china', 'beijing', 'yuan', 'xi', 'chinese']
    };
    
    const terms = regionalTerms[region] || [];
    const allText = articles.map(a => `${a.title} ${a.description}`).join(' ').toLowerCase();
    
    return terms.filter(term => allText.includes(term));
  }
});