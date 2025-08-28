# RapidAPI Weather Piece

Piece ini memungkinkan Anda mengakses berbagai layanan cuaca melalui RapidAPI platform. Dengan piece ini, Anda dapat:

## 🌤️ Fitur Utama

- **Cuaca Real-time**: Dapatkan kondisi cuaca saat ini untuk lokasi manapun
- **Prakiraan Cuaca**: Forecast hingga 10 hari ke depan dengan data per jam
- **Data Historis**: Akses data cuaca historis hingga 7 hari sebelumnya
- **Peringatan Cuaca**: Notifikasi alert cuaca ekstrem dan berbahaya
- **Multi-bahasa**: Support 10+ bahasa termasuk Bahasa Indonesia
- **Kualitas Udara**: Informasi Air Quality Index (AQI)

## 🚀 Cara Penggunaan

1. Dapatkan RapidAPI Key dari [RapidAPI Hub](https://rapidapi.com/hub)
2. Subscribe ke Weather API (rekomendasi: WeatherAPI)
3. Masukkan API Key ke konfigurasi piece
4. Mulai gunakan actions yang tersedia

## 🔧 Actions Tersedia

### 1. Get Current Weather
Mendapatkan kondisi cuaca real-time dengan informasi lengkap termasuk:
- Suhu, kelembaban, tekanan udara
- Kecepatan angin dan arahnya
- Visibilitas dan indeks UV
- Kondisi cuaca dan ikon
- Data kualitas udara (AQI)

### 2. Get Weather Forecast
Prakiraan cuaca untuk 1-10 hari ke depan dengan opsi:
- Data per hari atau per jam
- Informasi astronomi (sunrise/sunset)
- Probabilitas hujan dan salju
- Alert cuaca jika ada

### 3. Get Weather History
Data cuaca historis dengan fitur:
- Single date atau date range
- Summary statistik
- Data per jam (opsional)
- Perbandingan periode

### 4. Get Weather Alerts
Peringatan cuaca ekstrem dengan:
- Filter berdasarkan tingkat keparahan
- Status aktif/expired
- Detail instruksi keselamatan
- Coverage area yang terdampak

## 📋 Format Response

Semua actions mengembalikan response terstruktur dengan:

```json
{
  "success": true,
  "location": { /* Info lokasi */ },
  "data": { /* Data cuaca sesuai action */ },
  "raw_response": { /* Response lengkap dari API */ }
}
```

## ⚠️ Error Handling

Jika terjadi error, response akan berformat:

```json
{
  "success": false,
  "error": "Error message",
  "error_code": "HTTP_STATUS_OR_CODE", 
  "details": { /* Detail error jika ada */ }
}
```

## 🌍 Supported Languages

- 🇮🇩 Bahasa Indonesia (id)
- 🇺🇸 English (en)
- 🇨🇳 中文 (zh)
- 🇪🇸 Español (es)
- 🇫🇷 Français (fr)
- 🇩🇪 Deutsch (de)
- 🇵🇹 Português (pt)
- 🇯🇵 日本語 (ja)
- 🇰🇷 한국어 (ko)
- 🇷🇺 Русский (ru)

## 📍 Location Formats

Piece ini mendukung berbagai format lokasi:
- Nama kota: `Jakarta`, `New York`, `London`
- Koordinat: `-6.2088,106.8456`
- Kode pos: `10001`
- IP address: `192.168.1.1`
- Auto IP: `auto:ip`

## 💡 Tips Penggunaan

1. **Untuk Production**: Gunakan koordinat lat,lon untuk akurasi terbaik
2. **Monitoring**: Enable alerts untuk sistem monitoring cuaca
3. **Bahasa**: Sesuaikan bahasa dengan target audience
4. **Rate Limits**: Perhatikan quota RapidAPI subscription Anda
5. **Caching**: Consider caching untuk data yang tidak perlu real-time

## 🔗 API Provider

Piece ini menggunakan WeatherAPI melalui RapidAPI platform. WeatherAPI menyediakan:
- Global coverage untuk 3+ juta lokasi
- Real-time dan forecast data
- Historis data hingga 2015
- 99.9% uptime SLA