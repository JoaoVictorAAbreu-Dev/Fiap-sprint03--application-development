import type { VegetationClassification } from '@/domain/entities/vegetation-monitoring.entity';

type VegetationClassificationBadgeProps = {
  classification: VegetationClassification;
};

const classificationClass: Record<VegetationClassification, string> = {
  Normal: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
  Atenção: 'bg-amber-100 text-amber-800 ring-amber-600/20',
  Risco: 'bg-orange-100 text-orange-800 ring-orange-600/20',
  Crítico: 'bg-rose-100 text-rose-800 ring-rose-600/20',
};

export const VegetationClassificationBadge = ({
  classification,
}: VegetationClassificationBadgeProps) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${classificationClass[classification]}`}
  >
    {classification}
  </span>
);
