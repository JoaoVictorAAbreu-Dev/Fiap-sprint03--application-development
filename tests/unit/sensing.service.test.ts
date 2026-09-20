import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sensingService } from '@/infrastructure/services/sensing.service';
import { nominatimClient } from '@/infrastructure/http/nominatim.client';

vi.mock('@/infrastructure/http/nominatim.client', () => ({
  nominatimClient: {
    get: vi.fn(),
  },
}));

describe('sensing.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns exactly 10 points using fallback when nominatim fails', async () => {
    vi.mocked(nominatimClient.get).mockRejectedValueOnce(new Error('network'));

    const result = await sensingService.getMonitoredLocalities({ limit: 10 });

    expect(result).toHaveLength(10);
    expect(result[0]?.name).toBe('Sao Paulo');
  });

  it('complements api data with fallback to reach 10 points', async () => {
    vi.mocked(nominatimClient.get).mockResolvedValueOnce({
      data: [
        { display_name: 'Campinas, Sao Paulo, Brasil', lat: '-22.90556', lon: '-47.06083' },
        { display_name: 'Sorocaba, Sao Paulo, Brasil', lat: '-23.50167', lon: '-47.45806' },
      ],
    });

    const result = await sensingService.getMonitoredLocalities({ limit: 10 });

    expect(result).toHaveLength(10);
    expect(result[0]?.name).toBe('Campinas, Sao Paulo, Brasil');
    expect(result[1]?.name).toBe('Sorocaba, Sao Paulo, Brasil');
  });
});
