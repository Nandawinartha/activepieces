import {
  createAction,
  Property,
} from '@activepieces/pieces-framework';
import {
  HttpMethod,
  httpClient,
} from '@activepieces/pieces-common';
import { rapidApiWeatherAuth } from '../..';

export const getWeatherHistory = createAction({
  auth: rapidApiWeatherAuth,
  name: 'get_weather_history',
  displayName: 'Dapatkan Data Cuaca Historis',
  description: 'Mendapatkan data cuaca historis untuk tanggal tertentu',
  props: {
    location: Property.ShortText({
      displayName: 'Lokasi',
      description: 'Nama kota, koordinat lat,lon, kode pos',
      required: true,

    }),
    date: Property.DateTime({
      displayName: 'Tanggal',
      description: 'Tanggal untuk mendapatkan data historis (format: YYYY-MM-DD)',
      required: true,

    }),
    endDate: Property.DateTime({
      displayName: 'Tanggal Akhir (Opsional)',
      description: 'Tanggal akhir untuk range data historis (maksimal 7 hari)',
      required: false,

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
    includeHourly: Property.Checkbox({
      displayName: 'Sertakan Data Per Jam',
      description: 'Apakah ingin menyertakan data cuaca per jam',
      required: false,
      defaultValue: false
    })
  },
  async run({ auth, propsValue }) {
    const { 
      location, 
      date,
      endDate,
      language = 'id', 
      includeHourly = false
    } = propsValue;
    
    try {
      // Format tanggal ke YYYY-MM-DD
      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      const startDate = formatDate(date);
      const queryParams: any = {
        q: location,
        dt: startDate,
        lang: language
      };

      // Jika ada end date, gunakan end_dt parameter
      if (endDate) {
        queryParams.end_dt = formatDate(endDate);
      }

      const response = await httpClient.sendRequest({
        method: HttpMethod.GET,
        url: 'https://weatherapi-com.p.rapidapi.com/history.json',
        headers: {
          'X-RapidAPI-Key': auth,
          'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com',
        },
        queryParams
      });

      const weatherData = response.body;
      
      // Proses data historis
      const historyDays = weatherData.forecast.forecastday.map((day: any) => ({
        date: day.date,
        date_epoch: day.date_epoch,
        day: {
          maxtemp_c: day.day.maxtemp_c,
          maxtemp_f: day.day.maxtemp_f,
          mintemp_c: day.day.mintemp_c,
          mintemp_f: day.day.mintemp_f,
          avgtemp_c: day.day.avgtemp_c,
          avgtemp_f: day.day.avgtemp_f,
          maxwind_mph: day.day.maxwind_mph,
          maxwind_kph: day.day.maxwind_kph,
          totalprecip_mm: day.day.totalprecip_mm,
          totalprecip_in: day.day.totalprecip_in,
          totalsnow_cm: day.day.totalsnow_cm,
          avgvis_km: day.day.avgvis_km,
          avgvis_miles: day.day.avgvis_miles,
          avghumidity: day.day.avghumidity,
          condition: {
            text: day.day.condition.text,
            icon: day.day.condition.icon,
            code: day.day.condition.code
          },
          uv: day.day.uv
        },
        astro: {
          sunrise: day.astro.sunrise,
          sunset: day.astro.sunset,
          moonrise: day.astro.moonrise,
          moonset: day.astro.moonset,
          moon_phase: day.astro.moon_phase,
          moon_illumination: day.astro.moon_illumination
        },
        hour: includeHourly ? day.hour : null
      }));
      
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
        history: {
          date_range: {
            start: startDate,
            end: endDate ? formatDate(endDate) : startDate
          },
          data: historyDays
        },
        summary: {
          total_days: historyDays.length,
          avg_temp_c: historyDays.reduce((sum: number, day: any) => sum + day.day.avgtemp_c, 0) / historyDays.length,
          max_temp_c: Math.max(...historyDays.map((day: any) => day.day.maxtemp_c)),
          min_temp_c: Math.min(...historyDays.map((day: any) => day.day.mintemp_c)),
          total_precip_mm: historyDays.reduce((sum: number, day: any) => sum + day.day.totalprecip_mm, 0)
        },
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