import {
  createAction,
  Property,
} from '@activepieces/pieces-framework';
import {
  HttpMethod,
  httpClient,
} from '@activepieces/pieces-common';
import { rapidApiWeatherAuth } from '../..';

export const getWeatherForecast = createAction({
  auth: rapidApiWeatherAuth,
  name: 'get_weather_forecast',
  displayName: 'Dapatkan Prakiraan Cuaca',
  description: 'Mendapatkan prakiraan cuaca untuk beberapa hari ke depan',
  props: {
    location: Property.ShortText({
      displayName: 'Lokasi',
      description: 'Nama kota, koordinat lat,lon, kode pos, atau IP address',
      required: true,

    }),
    days: Property.StaticDropdown({
      displayName: 'Jumlah Hari',
      description: 'Berapa hari prakiraan cuaca yang diinginkan',
      required: true,
      defaultValue: '3',
      options: {
        options: [
          { label: '1 Hari', value: '1' },
          { label: '3 Hari', value: '3' },
          { label: '5 Hari', value: '5' },
          { label: '7 Hari', value: '7' },
          { label: '10 Hari', value: '10' }
        ]
      }
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
      description: 'Apakah ingin menyertakan prakiraan cuaca per jam',
      required: false,
      defaultValue: false
    }),
    includeAqi: Property.Checkbox({
      displayName: 'Sertakan Data Kualitas Udara',
      description: 'Apakah ingin menyertakan informasi Air Quality Index (AQI)',
      required: false,
      defaultValue: true
    }),
    includeAlerts: Property.Checkbox({
      displayName: 'Sertakan Peringatan Cuaca',
      description: 'Apakah ingin menyertakan peringatan/alert cuaca',
      required: false,
      defaultValue: true
    })
  },
  async run({ auth, propsValue }) {
    const { 
      location, 
      days = '3', 
      language = 'id', 
      includeHourly = false,
      includeAqi = true,
      includeAlerts = true 
    } = propsValue;
    
    try {
      const response = await httpClient.sendRequest({
        method: HttpMethod.GET,
        url: 'https://weatherapi-com.p.rapidapi.com/forecast.json',
        headers: {
          'X-RapidAPI-Key': auth,
          'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com',
        },
        queryParams: {
          q: location,
          days: days,
          lang: language,
          aqi: includeAqi ? 'yes' : 'no',
          alerts: includeAlerts ? 'yes' : 'no'
        }
      });

      const weatherData = response.body;
      
      // Proses data forecast
      const forecastDays = weatherData.forecast.forecastday.map((day: any) => ({
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
          daily_will_it_rain: day.day.daily_will_it_rain,
          daily_chance_of_rain: day.day.daily_chance_of_rain,
          daily_will_it_snow: day.day.daily_will_it_snow,
          daily_chance_of_snow: day.day.daily_chance_of_snow,
          condition: {
            text: day.day.condition.text,
            icon: day.day.condition.icon,
            code: day.day.condition.code
          },
          uv: day.day.uv,
          air_quality: includeAqi ? day.day.air_quality : null
        },
        astro: {
          sunrise: day.astro.sunrise,
          sunset: day.astro.sunset,
          moonrise: day.astro.moonrise,
          moonset: day.astro.moonset,
          moon_phase: day.astro.moon_phase,
          moon_illumination: day.astro.moon_illumination,
          is_moon_up: day.astro.is_moon_up,
          is_sun_up: day.astro.is_sun_up
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
        current: weatherData.current,
        forecast: {
          forecastday: forecastDays
        },
        alerts: includeAlerts ? weatherData.alerts : null,
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