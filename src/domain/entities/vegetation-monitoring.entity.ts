import type { Locality } from '@/domain/entities/locality.entity';

export type VegetationClassification = 'Normal' | 'Atenção' | 'Risco' | 'Crítico';

export type VegetationHeightBand = {
  label: string;
  maxHeightCm: number;
  classification: VegetationClassification;
  recommendedAction: string;
};

export type VegetationMonitoringPoint = Locality & {
  heightCm: number;
  classification: VegetationClassification;
  recommendedAction: string;
};
