import { describe, expect, it } from 'vitest';
import type { Locality } from '@/domain/entities/locality.entity';
import {
  buildVegetationMonitoringPoints,
  classifyVegetationHeight,
} from '@/shared/utils/vegetation-classification.util';

const localities: Locality[] = [
  { name: 'Trecho A', latitude: -23.5, longitude: -46.6 },
  { name: 'Trecho B', latitude: -23.6, longitude: -46.7 },
  { name: 'Trecho C', latitude: -23.7, longitude: -46.8 },
  { name: 'Trecho D', latitude: -23.8, longitude: -46.9 },
];

describe('vegetation-classification.util', () => {
  it.each([
    [0, 'Normal'],
    [30, 'Normal'],
    [30.1, 'Atenção'],
    [50, 'Atenção'],
    [50.1, 'Risco'],
    [80, 'Risco'],
    [80.1, 'Crítico'],
  ])('classifies %s cm as %s', (heightCm, expectedClassification) => {
    expect(classifyVegetationHeight(heightCm).classification).toBe(expectedClassification);
  });

  it('rejects negative and non-finite heights', () => {
    expect(() => classifyVegetationHeight(-1)).toThrow(RangeError);
    expect(() => classifyVegetationHeight(Number.NaN)).toThrow(RangeError);
  });

  it('builds one classified result with an action for every locality', () => {
    const result = buildVegetationMonitoringPoints(localities, [20, 40, 70, 90]);

    expect(result).toHaveLength(4);
    expect(result.map((point) => point.classification)).toEqual(['Normal', 'Atenção', 'Risco', 'Crítico']);
    expect(result.every((point) => point.recommendedAction.length > 0)).toBe(true);
  });

  it('rejects an empty height dataset', () => {
    expect(() => buildVegetationMonitoringPoints(localities, [])).toThrow(RangeError);
  });
});
