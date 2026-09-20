import axios from 'axios';
import type { OpenMeteoForecastDto } from '@/application/dto/open-meteo.dto';
import { toWeatherSnapshot } from '@/application/mappers/weather.mapper';
import type { Locality } from '@/domain/entities/locality.entity';
import type { WeatherSnapshot } from '@/domain/entities/weather.entity';
import { openMeteoClient } from '@/infrastructure/http/open-meteo.client';

const CURRENT_FIELDS = [
  'temperature_2m',
  'relative_humidity_2m',
  'wind_speed_10m',
  'precipitation',
  'weather_code',
].join(',');

export const weatherService = {
  async getCurrentWeatherByLocality(locality: Locality): Promise<WeatherSnapshot> {
    try {
      // Consulta somente campos atuais para reduzir payload e latencia da API externa.
      const response = await openMeteoClient.get<OpenMeteoForecastDto>('/v1/forecast', {
        params: {
          latitude: locality.latitude,
          longitude: locality.longitude,
          current: CURRENT_FIELDS,
        },
      });

      return toWeatherSnapshot(locality, response.data.current);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Open-Meteo request failed for "${locality.name}"`, { cause: error });
      }

      throw new Error(`Unexpected weather error for "${locality.name}"`, { cause: error });
    }
  },

  async getCurrentWeatherByLocalities(localities: Locality[]): Promise<WeatherSnapshot[]> {
    if (localities.length === 0) {
      return [];
    }

    try {
      // A Open-Meteo aceita coordenadas separadas por virgula e devolve uma lista
      // na mesma ordem, reduzindo dez requisicoes paralelas para uma chamada em lote.
      const response = await openMeteoClient.get<OpenMeteoForecastDto | OpenMeteoForecastDto[]>('/v1/forecast', {
        params: {
          latitude: localities.map((locality) => locality.latitude).join(','),
          longitude: localities.map((locality) => locality.longitude).join(','),
          current: CURRENT_FIELDS,
        },
      });

      const forecasts = Array.isArray(response.data) ? response.data : [response.data];

      if (forecasts.length !== localities.length) {
        throw new Error(`Expected ${localities.length} weather results, received ${forecasts.length}`);
      }

      return forecasts.map((forecast, index) => toWeatherSnapshot(localities[index], forecast.current));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error('Open-Meteo batch request failed', { cause: error });
      }

      throw new Error('Unexpected Open-Meteo batch response', { cause: error });
    }
  },
};
