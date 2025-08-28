import {
  createAction,
  Property,
} from '@activepieces/pieces-framework';
import {
  AuthenticationType,
  HttpMethod,
  httpClient,
} from '@activepieces/pieces-common';
import { rapidApiWeatherAuth } from '../..';

export const getCurrentWeather = createAction({
  auth: rapidApiWeatherAuth,
  name: 'get_current_weather',
  displayName: 'Dapatkan Cuaca Saat Ini',
  description: 'Mendapatkan informasi cuaca real-time untuk lokasi tertentu',
  props: {
    location: Property.ShortText({
      displayName: 'Lokasi',
      description: 'Nama kota, koordinat lat,lon, kode pos, atau IP address',
      required: true,
      placeholder: 'Jakarta, -6.2088,106.8456, 10001, atau auto:ip'
    }),
    language: Property.StaticDropdown({
      displayName: 'Bahasa',
      description: 'Bahasa untuk response cuaca',
      required: false,
      defaultValue: 'id',
      options: {
        options: [
          { label: 'Bahasa Indonesia', value: 'id' },
          { label: 'English', value: 'en' },
          { label: '中文', value: 'zh' },
          { label: 'Español', value: 'es' },
          { label: 'Français', value: 'fr' },
          { label: 'Deutsch', value: 'de' },
          { label: 'Português', value: 'pt' },
          { label: '日本語', value: 'ja' },
          { label: '한국어', value: 'ko' },
          { label: 'Русский', value: 'ru' }
        ]
      }
    }),
    includeAqi: Property.Checkbox({
      displayName: 'Sertakan Data Kualitas Udara',
      description: 'Apakah ingin menyertakan informasi Air Quality Index (AQI)',
      required: false,
      defaultValue: true
    })
  },
  async run({ auth, propsValue }) {
    const { location, language = 'id', includeAqi = true } = propsValue;
    
    try {
      const response = await httpClient.sendRequest({
        method: HttpMethod.GET,
        url: 'https://weatherapi-com.p.rapidapi.com/current.json',
        headers: {
          'X-RapidAPI-Key': auth,
          'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com',
        },
        queryParams: {
          q: location,
          lang: language,
          aqi: includeAqi ? 'yes' : 'no'
        }
      });

      const weatherData = response.body;
      
      // Struktur response yang dioptimalkan
      return {
        success: true,
        location: {
          name: weatherData.location.name,
          region: weatherData.location.region,
          country: weatherData.location.country,
          lat: weatherData.location.lat,
          lon: weatherData.location.lon,
          timezone: weatherData.location.tz_id,
          localtime: weatherData.location.localtime
        },
        current: {
          last_updated: weatherData.current.last_updated,
          temp_c: weatherData.current.temp_c,
          temp_f: weatherData.current.temp_f,
          is_day: weatherData.current.is_day,
          condition: {
            text: weatherData.current.condition.text,
            icon: weatherData.current.condition.icon,
            code: weatherData.current.condition.code
          },
          wind_mph: weatherData.current.wind_mph,
          wind_kph: weatherData.current.wind_kph,
          wind_degree: weatherData.current.wind_degree,
          wind_dir: weatherData.current.wind_dir,
          pressure_mb: weatherData.current.pressure_mb,
          pressure_in: weatherData.current.pressure_in,
          precip_mm: weatherData.current.precip_mm,
          precip_in: weatherData.current.precip_in,
          humidity: weatherData.current.humidity,
          cloud: weatherData.current.cloud,
          feelslike_c: weatherData.current.feelslike_c,
          feelslike_f: weatherData.current.feelslike_f,
          vis_km: weatherData.current.vis_km,
          vis_miles: weatherData.current.vis_miles,
          uv: weatherData.current.uv,
          gust_mph: weatherData.current.gust_mph,
          gust_kph: weatherData.current.gust_kph
        },
        air_quality: includeAqi ? weatherData.current.air_quality : null,
        raw_response: weatherData
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        error_code: error.response?.status || 'UNKNOWN_ERROR',
        details: error.response?.data || null
      };
    }
  },
});