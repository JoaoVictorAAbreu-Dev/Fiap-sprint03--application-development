import type { VegetationHeightBand } from '@/domain/entities/vegetation-monitoring.entity';

export const VEGETATION_HEIGHT_BANDS: readonly VegetationHeightBand[] = [
  {
    label: '0 a 30 cm',
    maxHeightCm: 30,
    classification: 'Normal',
    recommendedAction: 'Manter o monitoramento de rotina.',
  },
  {
    label: 'Acima de 30 até 50 cm',
    maxHeightCm: 50,
    classification: 'Atenção',
    recommendedAction: 'Aumentar a frequência de inspeção do ponto.',
  },
  {
    label: 'Acima de 50 até 80 cm',
    maxHeightCm: 80,
    classification: 'Risco',
    recommendedAction: 'Programar o serviço de roçada.',
  },
  {
    label: 'Acima de 80 cm',
    maxHeightCm: Number.POSITIVE_INFINITY,
    classification: 'Crítico',
    recommendedAction: 'Realizar intervenção imediata e sinalizar a área.',
  },
];

export const MONITORED_VEGETATION_HEIGHTS_CM: readonly number[] = [18, 32, 47, 56, 68, 76, 84, 93, 105, 28];
