import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { OpenMeteoCurrentDto } from '@/application/dto/open-meteo.dto';
import type { Locality } from '@/domain/entities/locality.entity';
import { openMeteoClient } from '@/infrastructure/http/open-meteo.client';
import { weatherService } from '@/infrastructure/services/weather.service';

vi.mock('@/infrastructure/http/open-meteo.client', () => ({
  openMeteoClient: {
    get: vi.fn(),
  },
}));

const localities: Locality[] = [
  { name: 'Trecho A', latitude: -23.5, longitude: -46.6 },
  { name: 'Trecho B', latitude: -22.9, longitude: -47.1 },
];

const buildCurrentWeather = (temperatureC: number): OpenMeteoCurrentDto => ({
  time: '2026-09-20T09:00',
  temperature_2m: temperatureC,
  relative_humidity_2m: 65,
  wind_speed_10m: 12,
  precipitation: 0,
  weather_code: 1,
});

describe('weather.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads all localities in one Open-Meteo batch request', async () => {
    vi.mocked(openMeteoClient.get).mockResolvedValueOnce({
      data: [
        { current: buildCurrentWeather(24) },
        { current: buildCurrentWeather(27) },
      ],
    });

    const result = await weatherService.getCurrentWeatherByLocalities(localities);

    expect(openMeteoClient.get).toHaveBeenCalledTimes(1);
    expect(openMeteoClient.get).toHaveBeenCalledWith('/v1/forecast', {
      params: {
        latitude: '-23.5,-22.9',
        longitude: '-46.6,-47.1',
        current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code',
      },
    });
    expect(result.map((snapshot) => snapshot.localityName)).toEqual(['Trecho A', 'Trecho B']);
    expect(result.map((snapshot) => snapshot.temperatureC)).toEqual([24, 27]);
  });

  it('normalizes the object response returned for a single locality', async () => {
    vi.mocked(openMeteoClient.get).mockResolvedValueOnce({
      data: { current: buildCurrentWeather(25) },
    });

    const result = await weatherService.getCurrentWeatherByLocalities([localities[0]]);

    expect(result).toHaveLength(1);
    expect(result[0]?.localityName).toBe('Trecho A');
  });

  it('does not call Open-Meteo when there are no localities', async () => {
    await expect(weatherService.getCurrentWeatherByLocalities([])).resolves.toEqual([]);
    expect(openMeteoClient.get).not.toHaveBeenCalled();
  });
});
