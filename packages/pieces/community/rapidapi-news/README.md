# RapidAPI News Piece

Piece yang powerful untuk mengakses berbagai layanan berita melalui RapidAPI platform. Dengan piece ini, Anda dapat mengintegrasikan berita dari multiple providers dalam satu interface yang konsisten.

## 📰 Fitur Utama

- **Multi-Provider Support**: Mendukung NewsAPI.org, API Ninjas, Currents API, dan NewsData.IO
- **Berita Terkini**: Akses headline dan breaking news real-time
- **Advanced Search**: Pencarian berita dengan query complex dan filters
- **Berita per Kategori**: Filter berdasarkan business, tech, sports, dll
- **Trending Analysis**: Deteksi berita viral dengan analytics mendalam
- **Source Management**: Kelola dan evaluasi sumber berita
- **Multi-bahasa**: Support 14+ bahasa termasuk Bahasa Indonesia
- **Smart Analytics**: Sentiment analysis, trending score, dan engagement metrics

## 🚀 Cara Penggunaan

1. Dapatkan RapidAPI Key dari [RapidAPI Hub](https://rapidapi.com/hub)
2. Subscribe ke salah satu News API provider:
   - **NewsAPI.org** (recommended untuk production)
   - **News API by API-Ninjas** (bagus untuk development)
   - **Currents API** (real-time news)
   - **NewsData.IO** (comprehensive coverage)
3. Masukkan API Key ke konfigurasi piece
4. Pilih provider dan mulai gunakan actions

## 🔧 Actions Tersedia

### 1. Get Top Headlines
Mendapatkan berita utama terkini dengan fitur:
- **Multi-provider support** dengan response yang dinormalisasi
- **Filter negara** untuk berita lokal/internasional
- **Kategori** (bisnis, teknologi, olahraga, dll)
- **Multi-bahasa** dengan 14+ pilihan bahasa
- **Source filtering** untuk media tertentu
- **Smart pagination** dengan kontrol page size

**Response Format**:
```json
{
  "success": true,
  "provider": "newsapi",
  "metadata": {
    "total_results": 150,
    "returned_articles": 20,
    "country": "id",
    "category": "technology"
  },
  "articles": [
    {
      "id": "article-1",
      "title": "Judul Berita",
      "description": "Deskripsi singkat",
      "url": "https://...",
      "image": "https://...",
      "published_at": "2024-01-01T12:00:00Z",
      "source": { "name": "Source Name" },
      "author": "Nama Penulis",
      "category": "technology"
    }
  ]
}
```

### 2. Search News
Pencarian berita advanced dengan kemampuan:
- **Complex queries** dengan operator AND, OR, NOT
- **Search scope** (title, description, content)
- **Date range filtering** untuk periode tertentu
- **Domain filtering** dan exclusion
- **Relevancy scoring** dan highlight extraction
- **Pagination** dengan metadata lengkap

**Contoh Query**:
- `"artificial intelligence" AND Indonesia`
- `blockchain OR cryptocurrency`
- `covid NOT vaccine`

### 3. Get News by Category
Berita terkategorisasi dengan analytics:
- **13+ kategori** (business, tech, sports, health, dll)
- **Timeframe filtering** (today, 24h, 1w, 1m)
- **Analytics mode** dengan sentiment analysis
- **Trending keywords** extraction
- **Publication timeline** analysis
- **Top sources** breakdown

**Special Features**:
- Read time estimation
- Word count analysis
- Engagement metrics
- Related topics suggestion

### 4. Get Trending News
Deteksi berita viral dengan algoritma trending:
- **6 jenis trending**: Viral, Popular, Breaking, Global, Local
- **Trending score calculation** berdasarkan multiple factors
- **Viral metrics**: velocity, peak potential, social signals
- **Hashtag extraction** dan trending topics
- **Regional analysis** untuk trending lokal
- **Engagement indicators**: question titles, emotional words, etc

**Trending Algorithm**:
- Recency factor (semakin baru semakin tinggi score)
- Title engagement (panjang optimal, keywords, questions)
- Content quality (ada gambar, deskripsi lengkap)
- Viral keywords detection

### 5. Get News Sources
Manajemen sumber berita dengan evaluasi:
- **Source discovery** dari semua provider
- **Reliability scoring** dengan multiple criteria
- **Detailed statistics** per source
- **Coverage analysis** (geographic, topical)
- **Source recommendations** berdasarkan needs
- **Filtering** by country, category, language

**Reliability Factors**:
- Provider reputation
- Website presence
- Content quality
- Update frequency
- Social media presence

## 🎯 Use Cases

### 1. News Monitoring & Alerts
```javascript
// Monitor breaking news tentang topik tertentu
const breakingNews = await getTrendingNews({
  trendingType: 'breaking',
  query: 'your-topic',
  timeWindow: '1h'
});
```

### 2. Content Curation
```javascript
// Kurasi konten untuk social media
const trendingContent = await getTrendingNews({
  trendingType: 'viral',
  region: 'id',
  includeHashtags: true
});
```

### 3. Market Research
```javascript
// Analisis sentimen pasar
const businessNews = await getNewsByCategory({
  category: 'business',
  includeAnalytics: true,
  timeframe: '1w'
});
```

### 4. Source Evaluation
```javascript
// Evaluasi kredibilitas sumber
const sources = await getNewsSources({
  includeReliabilityScore: true,
  sortBy: 'reliability'
});
```

## 📊 Analytics Features

### Sentiment Analysis
- **Automatic sentiment detection** pada setiap artikel
- **Keyword-based analysis** dengan emotional indicators
- **Percentage breakdown** (positive, negative, neutral)

### Trending Analytics
- **Trending score calculation** dengan transparent algorithm
- **Viral velocity tracking** dan peak potential
- **Social engagement indicators**
- **Regional trending patterns**

### Source Analytics
- **Reliability scoring** dengan multiple criteria
- **Coverage analysis** (geographic & topical)
- **Publication frequency** tracking
- **Social media presence** evaluation

## 🌍 Multi-Provider Strategy

Piece ini dirancang untuk **provider flexibility**:

1. **NewsAPI.org**: Best untuk production, comprehensive coverage
2. **API Ninjas**: Good untuk development, simple API
3. **Currents API**: Real-time news, good regional coverage
4. **NewsData.IO**: Comprehensive data, good for analytics

**Response Normalization**: Semua provider menghasilkan format response yang konsisten, memudahkan switching antar provider tanpa mengubah code.

## 🔧 Advanced Configuration

### Rate Limiting
- Respect quota dari masing-masing provider
- Implement caching untuk data yang tidak perlu real-time
- Use pagination untuk large datasets

### Error Handling
Comprehensive error handling dengan informative messages:
```json
{
  "success": false,
  "error": "API quota exceeded",
  "error_code": "429",
  "provider": "newsapi",
  "details": { /* Provider specific error */ }
}
```

### Performance Tips
1. **Caching**: Cache sources list dan trending topics
2. **Batch Processing**: Group multiple requests
3. **Selective Fields**: Hanya request data yang dibutuhkan
4. **Provider Fallback**: Implement fallback ke provider lain

## 🛡️ Best Practices

### 1. Source Verification
- Selalu gunakan `includeReliabilityScore: true`
- Cross-reference dengan multiple sources
- Monitor source performance over time

### 2. Content Quality
- Filter artikel dengan image untuk engagement
- Prioritize articles dengan content length optimal
- Use sentiment analysis untuk content curation

### 3. Performance Optimization
- Implement smart caching strategy
- Use pagination untuk large result sets
- Monitor API quota usage

### 4. Legal Compliance
- Respect copyright dan attribution requirements
- Follow API provider terms of service
- Implement proper attribution untuk published content

## 📈 Monitoring & Analytics

### Key Metrics to Track
- **API response times** per provider
- **Success rates** dan error frequencies
- **Content freshness** dan update frequencies
- **Source reliability** trends over time
- **Trending accuracy** dan viral prediction success

### Performance Monitoring
```javascript
// Track performance metrics
const performanceMetrics = {
  response_time: endTime - startTime,
  articles_returned: response.articles.length,
  provider_used: response.provider,
  success_rate: response.success ? 1 : 0
};
```

## 🔮 Future Enhancements

Planned features untuk versi mendatang:
- **AI-powered content summarization**
- **Real-time notification system**
- **Advanced sentiment analysis dengan ML**
- **Custom trending algorithm configuration**
- **Multi-language automatic translation**
- **Image analysis dan captioning**
- **Social media integration**
- **Duplicate detection across sources**

## 💡 Tips & Tricks

1. **Optimal Query Construction**: Gunakan quotes untuk exact phrases, boolean operators untuk precision
2. **Time Window Selection**: Gunakan 24h untuk trending, 1w untuk analysis
3. **Provider Selection**: NewsAPI untuk production, Ninjas untuk testing
4. **Language Consistency**: Pastikan language setting konsisten across requests
5. **Category Mapping**: Map categories ke business needs Anda