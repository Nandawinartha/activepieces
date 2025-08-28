import {
  createAction,
  Property,
} from '@activepieces/pieces-framework';
import {
  HttpMethod,
  httpClient,
} from '@activepieces/pieces-common';
import { rapidApiWeatherAuth } from '../..';

export const getWeatherAlerts = createAction({
  auth: rapidApiWeatherAuth,
  name: 'get_weather_alerts',
  displayName: 'Dapatkan Peringatan Cuaca',
  description: 'Mendapatkan peringatan cuaca ekstrem dan alert untuk lokasi tertentu',
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
    severity: Property.StaticDropdown({
      displayName: 'Tingkat Peringatan',
      description: 'Filter berdasarkan tingkat keparahan peringatan',
      required: false,
      defaultValue: 'all',
      options: {
        options: [
          { label: 'Semua Tingkat', value: 'all' },
          { label: 'Minor', value: 'minor' },
          { label: 'Moderate', value: 'moderate' },
          { label: 'Severe', value: 'severe' },
          { label: 'Extreme', value: 'extreme' }
        ]
      }
    }),
    includeExpired: Property.Checkbox({
      displayName: 'Sertakan Alert yang Sudah Berakhir',
      description: 'Apakah ingin menyertakan peringatan yang sudah tidak aktif',
      required: false,
      defaultValue: false
    })
  },
  async run({ auth, propsValue }) {
    const { 
      location, 
      language = 'id',
      severity = 'all',
      includeExpired = false
    } = propsValue;
    
    try {
      // Menggunakan forecast endpoint dengan alerts=yes untuk mendapatkan alerts
      const response = await httpClient.sendRequest({
        method: HttpMethod.GET,
        url: 'https://weatherapi-com.p.rapidapi.com/forecast.json',
        headers: {
          'X-RapidAPI-Key': auth,
          'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com',
        },
        queryParams: {
          q: location,
          days: '1',
          lang: language,
          alerts: 'yes'
        }
      });

      const weatherData = response.body;
      let alerts = weatherData.alerts?.alert || [];
      
      // Filter berdasarkan severity jika bukan 'all'
      if (severity !== 'all') {
        alerts = alerts.filter((alert: any) => 
          alert.severity?.toLowerCase() === severity.toLowerCase()
        );
      }
      
      // Filter expired alerts jika tidak ingin disertakan
      if (!includeExpired) {
        const now = new Date();
        alerts = alerts.filter((alert: any) => {
          if (alert.expires) {
            return new Date(alert.expires) > now;
          }
          return true; // Jika tidak ada expires date, anggap masih aktif
        });
      }
      
      // Proses dan format alerts
      const processedAlerts = alerts.map((alert: any) => ({
        headline: alert.headline,
        msgtype: alert.msgtype,
        severity: alert.severity,
        urgency: alert.urgency,
        areas: alert.areas,
        category: alert.category,
        certainty: alert.certainty,
        event: alert.event,
        note: alert.note,
        effective: alert.effective,
        expires: alert.expires,
        desc: alert.desc,
        instruction: alert.instruction,
        is_active: alert.expires ? new Date(alert.expires) > new Date() : true
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
        alerts: {
          total_count: processedAlerts.length,
          active_count: processedAlerts.filter(alert => alert.is_active).length,
          alerts: processedAlerts
        },
        alerts_summary: {
          has_alerts: processedAlerts.length > 0,
          has_severe_alerts: processedAlerts.some(alert => 
            ['severe', 'extreme'].includes(alert.severity?.toLowerCase() || '')
          ),
          severity_breakdown: processedAlerts.reduce((acc: any, alert: any) => {
            const sev = alert.severity?.toLowerCase() || 'unknown';
            acc[sev] = (acc[sev] || 0) + 1;
            return acc;
          }, {}),
          categories: [...new Set(processedAlerts.map(alert => alert.category))],
          earliest_expiry: processedAlerts
            .filter(alert => alert.expires)
            .map(alert => alert.expires)
            .sort()[0] || null
        },
        filters_applied: {
          severity: severity,
          include_expired: includeExpired,
          language: language
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