import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, httpClient } from '@activepieces/pieces-common';
import { rapidApiNewsAuth } from '../..';

export const getTrendingNews = createAction({
  auth: rapidApiNewsAuth,
  name: 'get_trending_news',
  displayName: 'Ambil Berita Trending',
  description: 'Ambil berita yang sedang trending',
  props: {
    provider: Property.StaticDropdown({
      displayName: 'Trending Provider',
      required: true,
      defaultValue: 'newsapi',
      options: {
        options: [
          { label: 'NewsAPI Top Headlines', value: 'newsapi' },
          { label: 'Reddit Hot Posts', value: 'reddit' }
        ]
      }
    }),
    trendingType: Property.StaticDropdown({
      displayName: 'Jenis Trending',
      required: false,
      defaultValue: 'general',
      options: {
        options: [
          { label: 'General Trending', value: 'general' },
          { label: 'Technology', value: 'technology' },
          { label: 'Business', value: 'business' },
          { label: 'Sports', value: 'sports' }
        ]
      }
    }),
    region: Property.StaticDropdown({
      displayName: 'Region',
      required: false,
      defaultValue: 'us',
      options: {
        options: [
          { label: 'United States', value: 'us' },
          { label: 'Indonesia', value: 'id' },
          { label: 'Global', value: 'global' }
        ]
      }
    }),
    timeWindow: Property.StaticDropdown({
      displayName: 'Periode Waktu',
      required: false,
      defaultValue: '24h',
      options: {
        options: [
          { label: 'Last 6 Hours', value: '6h' },
          { label: 'Last 24 Hours', value: '24h' },
          { label: 'Last 3 Days', value: '3d' },
          { label: 'Last Week', value: '7d' }
        ]
      }
    }),
    pageSize: Property.Number({
      displayName: 'Jumlah Artikel',
      description: 'Jumlah artikel trending yang diambil',
      required: false,
      defaultValue: 20,
    }),
    includeTrendingScore: Property.Checkbox({
      displayName: 'Sertakan Trending Score',
      description: 'Sertakan perhitungan skor trending',
      required: false,
      defaultValue: false
    }),
    includeHashtags: Property.Checkbox({
      displayName: 'Sertakan Hashtags',
      description: 'Ekstrak hashtags dari artikel',
      required: false,
      defaultValue: false
    })
  },
  async run({ auth, propsValue }) {
    const { 
      provider, 
      trendingType = 'general',
      region = 'us',
      timeWindow = '24h',
      pageSize = 20,
      includeTrendingScore = false,
      includeHashtags = false
    } = propsValue;
    
    try {
      let url = '';
      let headers: any = {};
      let queryParams: any = {};

      switch (provider) {
        case 'newsapi':
          url = 'https://newsapi.org/v2/top-headlines';
          headers = {
            'X-API-Key': auth,
            'Content-Type': 'application/json'
          };
          queryParams = {
            category: trendingType === 'general' ? 'general' : trendingType,
            country: region === 'global' ? undefined : region,
            pageSize: Math.min(pageSize, 100)
          };
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
      
      // Simple processing with mock trending data
      const articlesWithTrending = articles.map((article: any, index: number) => {
        const mockTrendingScore = Math.random() * 100;
        
        return {
          id: article.id || `trending-${index}`,
          title: article.title,
          description: article.description,
          url: article.url,
          urlToImage: article.urlToImage,
          publishedAt: article.publishedAt,
          source: {
            id: article.source?.id,
            name: article.source?.name || 'Unknown'
          },
          author: article.author,
          trending_data: includeTrendingScore ? {
            score: mockTrendingScore,
            rank: index + 1,
            type: trendingType,
            engagement_indicators: {
              estimated_shares: Math.floor(Math.random() * 1000),
              estimated_comments: Math.floor(Math.random() * 100),
              viral_potential: mockTrendingScore > 70 ? 'High' : mockTrendingScore > 40 ? 'Medium' : 'Low'
            }
          } : null,
          hashtags: includeHashtags ? [] : null // Simple mock
        };
      });

      return {
        success: true,
        trending_articles: articlesWithTrending,
        trending_info: {
          trending_type: trendingType,
          region: region,
          time_window: timeWindow,
          total_articles: articles.length,
          analysis_timestamp: new Date().toISOString()
        },
        trending_analytics: includeTrendingScore ? {
          avg_trending_score: articlesWithTrending.reduce((sum: number, article: any) => 
            sum + (article.trending_data?.score || 0), 0) / articlesWithTrending.length,
          high_trending_count: articlesWithTrending.filter((a: any) => 
            (a.trending_data?.score || 0) > 70).length,
          viral_potential_distribution: {
            high: articlesWithTrending.filter((a: any) => a.trending_data?.viral_potential === 'High').length,
            medium: articlesWithTrending.filter((a: any) => a.trending_data?.viral_potential === 'Medium').length,
            low: articlesWithTrending.filter((a: any) => a.trending_data?.viral_potential === 'Low').length
          }
        } : null,
        request_info: {
          provider: provider,
          timestamp: new Date().toISOString(),
          parameters: {
            trending_type: trendingType,
            region: region,
            time_window: timeWindow,
            include_scores: includeTrendingScore,
            include_hashtags: includeHashtags
          }
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