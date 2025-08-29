import { createCustomApiCallAction } from '@activepieces/pieces-common';
import { PieceAuth, createPiece } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { getCurrentWeather } from './lib/actions/get-current-weather';
import { getWeatherForecast } from './lib/actions/get-weather-forecast';
import { getWeatherHistory } from './lib/actions/get-weather-history';
import { getWeatherAlerts } from './lib/actions/get-weather-alerts';

const markdown = `
Untuk mendapatkan RapidAPI Key, ikuti langkah berikut:

1. Kunjungi [RapidAPI Hub](https://rapidapi.com/hub)
2. Daftar atau login ke akun RapidAPI Anda
3. Subscribe ke Weather API (misalnya: WeatherAPI, OpenWeatherMap, atau Weather by API-Ninjas)
4. Salin **X-RapidAPI-Key** dari dashboard atau endpoint testing
5. Masukkan key tersebut di field API Key di bawah

**Catatan**: Pastikan Anda telah subscribe ke Weather API yang ingin digunakan di RapidAPI marketplace.
`;

export const rapidApiWeatherAuth = PieceAuth.SecretText({
  displayName: 'RapidAPI Key',
  description: markdown,
  required: true,
});

export const rapidApiWeather = createPiece({
  displayName: 'RapidAPI Weather',
  description: 'Akses data cuaca real-time dan forecast menggunakan berbagai Weather API di RapidAPI',
  minimumSupportedRelease: '0.36.1',
  logoUrl: 'https://cdn.activepieces.com/pieces/rapidapi.png',
  categories: [PieceCategory.PRODUCTIVITY],
  auth: rapidApiWeatherAuth,
  actions: [
    getCurrentWeather,
    getWeatherForecast,
    getWeatherHistory,
    getWeatherAlerts,
    createCustomApiCallAction({
      auth: rapidApiWeatherAuth,
      baseUrl: () => 'https://weatherapi-com.p.rapidapi.com',
      authMapping: async (auth) => ({
        'X-RapidAPI-Key': auth as string,
        'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com',
      }),
    }),
  ],
  authors: ['activepieces-community'],
  triggers: [],
});