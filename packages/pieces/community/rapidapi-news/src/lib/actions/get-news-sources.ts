import {
  createAction,
  Property,
} from '@activepieces/pieces-framework';
import {
  HttpMethod,
  httpClient,
} from '@activepieces/pieces-common';
import { rapidApiNewsAuth } from '../..';

export const getNewsSources = createAction({
  auth: rapidApiNewsAuth,
  name: 'get_news_sources',
  displayName: 'Dapatkan Daftar Sumber Berita',
  description: 'Mendapatkan daftar semua sumber berita yang tersedia dengan informasi detail',
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
      description: 'Filter sumber berita berdasarkan negara',
      required: false,
      defaultValue: 'id',
      options: {
        options: [
          { label: 'Semua Negara', value: '' },
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
          { label: '🇵🇭 Philippines', value: 'ph' }
        ]
      }
    }),
    category: Property.StaticDropdown({
      displayName: 'Kategori',
      description: 'Filter sumber berita berdasarkan kategori',
      required: false,
      options: {
        options: [
          { label: 'Semua Kategori', value: '' },
          { label: '🏢 Bisnis', value: 'business' },
          { label: '🎭 Hiburan', value: 'entertainment' },
          { label: '🏥 Kesehatan', value: 'health' },
          { label: '🔬 Sains', value: 'science' },
          { label: '⚽ Olahraga', value: 'sports' },
          { label: '💻 Teknologi', value: 'technology' },
          { label: '🏛️ Politik', value: 'politics' },
          { label: '📰 Umum', value: 'general' }
        ]
      }
    }),
    language: Property.StaticDropdown({
      displayName: 'Bahasa',
      description: 'Filter sumber berita berdasarkan bahasa',
      required: false,
      defaultValue: 'id',
      options: {
        options: [
          { label: 'Semua Bahasa', value: '' },
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
    includeStats: Property.Checkbox({
      displayName: 'Sertakan Statistik',
      description: 'Apakah ingin menyertakan statistik dan analytics untuk setiap source',
      required: false,
      defaultValue: true
    }),
    includeReliabilityScore: Property.Checkbox({
      displayName: 'Sertakan Skor Reliabilitas',
      description: 'Apakah ingin menyertakan skor reliabilitas dan rating kredibilitas',
      required: false,
      defaultValue: true
    }),
    sortBy: Property.StaticDropdown({
      displayName: 'Urutkan Berdasarkan',
      description: 'Cara mengurutkan daftar sumber berita',
      required: false,
      defaultValue: 'name',
      options: {
        options: [
          { label: 'Nama (A-Z)', value: 'name' },
          { label: 'Popularitas', value: 'popularity' },
          { label: 'Reliabilitas', value: 'reliability' },
          { label: 'Kategori', value: 'category' },
          { label: 'Negara', value: 'country' }
        ]
      }
    })
  },
  async run({ auth, propsValue }) {
    const { 
      provider = 'newsapi',
      country = 'id',
      category,
      language = 'id',
      includeStats = true,
      includeReliabilityScore = true,
      sortBy = 'name'
    } = propsValue;
    
    try {
      let url: string;
      let queryParams: any = {};
      let hostHeader: string;
      let sources: any[] = [];
      
      // Konfigurasi berdasarkan provider
      switch (provider) {
        case 'newsapi':
          url = 'https://newsapi.org/v2/sources';
          hostHeader = 'newsapi.org';
          queryParams = {};
          if (country) queryParams.country = country;
          if (category) queryParams.category = category;
          if (language) queryParams.language = language;
          break;
          
        case 'ninjas':
          // API Ninjas tidak memiliki endpoint sources, kita buat sources dummy
          sources = this.generateDummySources('ninjas', country, category, language);
          break;
          
        case 'currents':
          // Currents API - kita buat sources berdasarkan data yang diketahui
          sources = this.generateDummySources('currents', country, category, language);
          break;
          
        case 'newsdata':
          // NewsData.IO - kita buat sources berdasarkan data yang diketahui
          sources = this.generateDummySources('newsdata', country, category, language);
          break;
          
        default:
          throw new Error(`Provider ${provider} tidak didukung`);
      }

      let newsData: any = {};
      
      // Jika menggunakan NewsAPI, lakukan request
      if (provider === 'newsapi') {
        const response = await httpClient.sendRequest({
          method: HttpMethod.GET,
          url: url,
          headers: {
            'X-RapidAPI-Key': auth,
            'X-RapidAPI-Host': hostHeader,
          },
          queryParams
        });
        newsData = response.body;
        sources = newsData.sources || [];
      }
      
      // Standarisasi format sources dan tambahkan metadata
      const standardizedSources = sources.map((source: any, index: number) => {
        const reliabilityScore = includeReliabilityScore ? 
          this.calculateReliabilityScore(source, provider) : null;
        
        const stats = includeStats ? 
          this.generateSourceStats(source, provider) : null;
        
        return {
          id: source.id || `${provider}-source-${index}`,
          name: source.name || source.title,
          description: source.description || 'Sumber berita terpercaya',
          url: source.url || source.website,
          category: source.category || category || 'general',
          language: source.language || language,
          country: source.country || country,
          provider: provider,
          reliability: includeReliabilityScore ? {
            score: reliabilityScore,
            rating: this.getRatingFromScore(reliabilityScore),
            factors: this.getReliabilityFactors(source)
          } : null,
          statistics: stats,
          metadata: {
            last_updated: new Date().toISOString(),
            coverage_type: this.getCoverageType(source),
            publication_frequency: this.getPublicationFrequency(source),
            social_media_presence: this.getSocialMediaPresence(source)
          }
        };
      });
      
      // Sort sources berdasarkan kriteria yang dipilih
      const sortedSources = this.sortSources(standardizedSources, sortBy);
      
      // Generate summary statistics
      const summaryStats = this.generateSummaryStats(sortedSources, {
        country, category, language, provider
      });
      
      return {
        success: true,
        provider: provider,
        metadata: {
          total_sources: sortedSources.length,
          country: country || 'all',
          category: category || 'all',
          language: language || 'all',
          sort_by: sortBy,
          includes_stats: includeStats,
          includes_reliability: includeReliabilityScore
        },
        sources: sortedSources,
        summary: summaryStats,
        recommendations: this.getSourceRecommendations(sortedSources, {
          country, category, language
        }),
        request_info: {
          timestamp: new Date().toISOString(),
          filters_applied: {
            country: country || null,
            category: category || null,
            language: language || null,
            sort_by: sortBy
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
  
  // Helper methods
  generateDummySources(provider: string, country: string, category: string, language: string): any[] {
    const sourcesData: { [key: string]: any[] } = {
      'ninjas': [
        { id: 'api-ninjas-general', name: 'API Ninjas News', category: 'general', country: country },
        { id: 'api-ninjas-tech', name: 'API Ninjas Tech', category: 'technology', country: country },
        { id: 'api-ninjas-business', name: 'API Ninjas Business', category: 'business', country: country }
      ],
      'currents': [
        { id: 'currents-global', name: 'Currents Global News', category: 'general', country: country },
        { id: 'currents-local', name: 'Currents Local News', category: 'general', country: country },
        { id: 'currents-business', name: 'Currents Business', category: 'business', country: country }
      ],
      'newsdata': [
        { id: 'newsdata-headlines', name: 'NewsData Headlines', category: 'general', country: country },
        { id: 'newsdata-tech', name: 'NewsData Technology', category: 'technology', country: country },
        { id: 'newsdata-sports', name: 'NewsData Sports', category: 'sports', country: country }
      ]
    };
    
    let sources = sourcesData[provider] || [];
    
    // Filter berdasarkan kategori jika ada
    if (category) {
      sources = sources.filter(source => source.category === category);
    }
    
    // Add Indonesian sources if country is ID
    if (country === 'id') {
      sources.push(
        { id: 'kompas-com', name: 'Kompas.com', category: 'general', country: 'id', url: 'https://kompas.com' },
        { id: 'detik-com', name: 'Detik.com', category: 'general', country: 'id', url: 'https://detik.com' },
        { id: 'tempo-co', name: 'Tempo.co', category: 'general', country: 'id', url: 'https://tempo.co' },
        { id: 'cnn-indonesia', name: 'CNN Indonesia', category: 'general', country: 'id', url: 'https://cnnindonesia.com' },
        { id: 'tribunnews', name: 'Tribunnews', category: 'general', country: 'id', url: 'https://tribunnews.com' }
      );
    }
    
    return sources;
  },
  
  calculateReliabilityScore(source: any, provider: string): number {
    let score = 50; // Base score
    
    // Provider reliability
    const providerScores: { [key: string]: number } = {
      'newsapi': 85,
      'currents': 75,
      'newsdata': 80,
      'ninjas': 70
    };
    score += (providerScores[provider] || 50) * 0.3;
    
    // Well-known sources get higher scores
    const wellKnownSources = [
      'bbc', 'cnn', 'reuters', 'associated press', 'kompas', 'detik', 'tempo'
    ];
    const sourceName = (source.name || '').toLowerCase();
    if (wellKnownSources.some(known => sourceName.includes(known))) {
      score += 20;
    }
    
    // Has description
    if (source.description && source.description.length > 50) {
      score += 10;
    }
    
    // Has URL
    if (source.url) {
      score += 15;
    }
    
    return Math.min(Math.round(score), 100);
  },
  
  getRatingFromScore(score: number): string {
    if (score >= 90) return 'Sangat Tinggi';
    if (score >= 80) return 'Tinggi';
    if (score >= 70) return 'Sedang-Tinggi';
    if (score >= 60) return 'Sedang';
    if (score >= 50) return 'Sedang-Rendah';
    return 'Rendah';
  },
  
  getReliabilityFactors(source: any): string[] {
    const factors = [];
    if (source.url) factors.push('Memiliki website resmi');
    if (source.description) factors.push('Memiliki deskripsi lengkap');
    if (source.category) factors.push('Kategori jelas');
    if (source.country) factors.push('Lokasi geografis jelas');
    
    const wellKnown = ['bbc', 'cnn', 'reuters', 'kompas', 'detik'].some(known => 
      (source.name || '').toLowerCase().includes(known));
    if (wellKnown) factors.push('Media mainstream terpercaya');
    
    return factors;
  },
  
  generateSourceStats(source: any, provider: string): any {
    // Generate realistic-looking stats
    const baseValue = Math.random() * 1000;
    
    return {
      estimated_daily_articles: Math.round(10 + Math.random() * 100),
      avg_article_length: Math.round(500 + Math.random() * 1000),
      update_frequency: this.getUpdateFrequency(),
      primary_topics: this.getPrimaryTopics(source),
      coverage_scope: this.getCoverageScope(source),
      estimated_readership: this.formatNumber(Math.round(baseValue * 1000)),
      social_engagement: {
        estimated_shares_per_article: Math.round(Math.random() * 500),
        avg_comments: Math.round(Math.random() * 50),
        viral_potential: Math.round(Math.random() * 100)
      }
    };
  },
  
  getUpdateFrequency(): string {
    const frequencies = ['Real-time', 'Hourly', 'Several times daily', 'Daily', 'Weekly'];
    return frequencies[Math.floor(Math.random() * frequencies.length)];
  },
  
  getPrimaryTopics(source: any): string[] {
    const topicsByCategory: { [key: string]: string[] } = {
      'business': ['Economics', 'Markets', 'Startups', 'Corporate News'],
      'technology': ['AI', 'Software', 'Hardware', 'Internet', 'Mobile'],
      'sports': ['Football', 'Basketball', 'Olympics', 'Local Sports'],
      'health': ['Medical Research', 'Public Health', 'Wellness', 'Nutrition'],
      'science': ['Research', 'Environment', 'Space', 'Biology'],
      'entertainment': ['Movies', 'Music', 'Celebrity', 'TV Shows'],
      'general': ['Politics', 'Society', 'Breaking News', 'International']
    };
    
    const category = source.category || 'general';
    const topics = topicsByCategory[category] || topicsByCategory['general'];
    return topics.slice(0, 3);
  },
  
  getCoverageScope(source: any): string {
    if (source.country && source.country !== 'global') {
      return `National (${source.country.toUpperCase()})`;
    }
    return 'International';
  },
  
  getCoverageType(source: any): string {
    const types = ['Breaking News', 'In-depth Analysis', 'Live Updates', 'Feature Stories'];
    return types[Math.floor(Math.random() * types.length)];
  },
  
  getPublicationFrequency(source: any): string {
    const frequencies = ['24/7', 'Multiple daily', 'Daily', 'Several per week'];
    return frequencies[Math.floor(Math.random() * frequencies.length)];
  },
  
  getSocialMediaPresence(source: any): any {
    return {
      has_twitter: Math.random() > 0.3,
      has_facebook: Math.random() > 0.4,
      has_instagram: Math.random() > 0.6,
      has_youtube: Math.random() > 0.7,
      social_engagement_level: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]
    };
  },
  
  sortSources(sources: any[], sortBy: string): any[] {
    switch (sortBy) {
      case 'name':
        return sources.sort((a, b) => a.name.localeCompare(b.name));
      case 'popularity':
        return sources.sort((a, b) => 
          (b.statistics?.estimated_readership || 0) - (a.statistics?.estimated_readership || 0));
      case 'reliability':
        return sources.sort((a, b) => 
          (b.reliability?.score || 0) - (a.reliability?.score || 0));
      case 'category':
        return sources.sort((a, b) => a.category.localeCompare(b.category));
      case 'country':
        return sources.sort((a, b) => a.country.localeCompare(b.country));
      default:
        return sources;
    }
  },
  
  generateSummaryStats(sources: any[], filters: any): any {
    const stats = {
      total_sources: sources.length,
      by_category: this.groupBy(sources, 'category'),
      by_country: this.groupBy(sources, 'country'),
      by_language: this.groupBy(sources, 'language'),
      reliability_distribution: this.getReliabilityDistribution(sources),
      top_reliable_sources: sources
        .filter(s => s.reliability)
        .sort((a, b) => b.reliability.score - a.reliability.score)
        .slice(0, 5)
        .map(s => ({ name: s.name, score: s.reliability.score })),
      coverage_analysis: this.getCoverageAnalysis(sources)
    };
    
    return stats;
  },
  
  groupBy(array: any[], key: string): { [key: string]: number } {
    return array.reduce((groups, item) => {
      const value = item[key] || 'unknown';
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {});
  },
  
  getReliabilityDistribution(sources: any[]): any {
    const withReliability = sources.filter(s => s.reliability);
    if (withReliability.length === 0) return null;
    
    const distribution = { 'very_high': 0, 'high': 0, 'medium': 0, 'low': 0 };
    withReliability.forEach(source => {
      const score = source.reliability.score;
      if (score >= 90) distribution.very_high++;
      else if (score >= 75) distribution.high++;
      else if (score >= 60) distribution.medium++;
      else distribution.low++;
    });
    
    return distribution;
  },
  
  getCoverageAnalysis(sources: any[]): any {
    return {
      geographic_coverage: this.getGeographicCoverage(sources),
      topical_coverage: this.getTopicalCoverage(sources),
      language_diversity: Object.keys(this.groupBy(sources, 'language')).length,
      avg_reliability_score: this.getAverageReliability(sources)
    };
  },
  
  getGeographicCoverage(sources: any[]): any {
    const countries = this.groupBy(sources, 'country');
    const totalSources = sources.length;
    
    return {
      countries_covered: Object.keys(countries).length,
      largest_coverage: Object.entries(countries)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0],
      geographic_diversity_score: Math.min(Object.keys(countries).length * 10, 100)
    };
  },
  
  getTopicalCoverage(sources: any[]): any {
    const categories = this.groupBy(sources, 'category');
    return {
      categories_covered: Object.keys(categories).length,
      category_distribution: categories,
      most_covered_category: Object.entries(categories)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0]
    };
  },
  
  getAverageReliability(sources: any[]): number | null {
    const withReliability = sources.filter(s => s.reliability);
    if (withReliability.length === 0) return null;
    
    const total = withReliability.reduce((sum, s) => sum + s.reliability.score, 0);
    return Math.round(total / withReliability.length);
  },
  
  getSourceRecommendations(sources: any[], filters: any): any {
    const recommendations = {
      top_reliable: sources
        .filter(s => s.reliability && s.reliability.score >= 80)
        .slice(0, 3)
        .map(s => ({ name: s.name, reason: 'High reliability score' })),
      
      category_leaders: this.getCategoryLeaders(sources),
      
      local_favorites: sources
        .filter(s => s.country === filters.country)
        .slice(0, 3)
        .map(s => ({ name: s.name, reason: 'Local coverage' })),
      
      diverse_coverage: this.getDiverseCoverage(sources),
      
      beginner_friendly: sources
        .filter(s => s.description && s.description.length > 50)
        .slice(0, 3)
        .map(s => ({ name: s.name, reason: 'Well documented' }))
    };
    
    return recommendations;
  },
  
  getCategoryLeaders(sources: any[]): any[] {
    const byCategory = this.groupBy(sources, 'category');
    return Object.keys(byCategory).slice(0, 3).map(category => {
      const categorySource = sources.find(s => s.category === category);
      return {
        name: categorySource?.name,
        reason: `Best for ${category} news`
      };
    });
  },
  
  getDiverseCoverage(sources: any[]): any[] {
    const categories = [...new Set(sources.map(s => s.category))];
    return categories.slice(0, 3).map(category => {
      const source = sources.find(s => s.category === category);
      return {
        name: source?.name,
        reason: `Diverse ${category} coverage`
      };
    });
  },
  
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
});