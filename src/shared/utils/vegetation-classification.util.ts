import type { Locality } from '@/domain/entities/locality.entity';
import type {
  VegetationHeightBand,
  VegetationMonitoringPoint,
} from '@/domain/entities/vegetation-monitoring.entity';
import {
  MONITORED_VEGETATION_HEIGHTS_CM,
  VEGETATION_HEIGHT_BANDS,
} from '@/shared/constants/vegetation-height-bands';

export const classifyVegetationHeight = (heightCm: number): VegetationHeightBand => {
  if (!Number.isFinite(heightCm) || heightCm < 0) {
    throw new RangeError('A altura da vegetação deve ser um número finito maior ou igual a zero.');
  }

  const [normalBand, attentionBand, riskBand, criticalBand] = VEGETATION_HEIGHT_BANDS;

  if (heightCm <= normalBand.maxHeightCm) {
    return normalBand;
  }

  if (heightCm <= attentionBand.maxHeightCm) {
    return attentionBand;
  }

  if (heightCm <= riskBand.maxHeightCm) {
    return riskBand;
  }

  return criticalBand;
};

export const buildVegetationMonitoringPoints = (
  localities: readonly Locality[],
  heightsCm: readonly number[] = MONITORED_VEGETATION_HEIGHTS_CM,
): VegetationMonitoringPoint[] => {
  if (heightsCm.length === 0) {
    throw new RangeError('Informe ao menos uma altura para classificar os pontos monitorados.');
  }

  const points: VegetationMonitoringPoint[] = [];

  localities.forEach((locality, index) => {
    const heightCm = heightsCm[index % heightsCm.length];
    const band = classifyVegetationHeight(heightCm);

    points.push({
      ...locality,
      heightCm,
      classification: band.classification,
      recommendedAction: band.recommendedAction,
    });
  });

  return points;
};
