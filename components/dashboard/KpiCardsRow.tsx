/**
 * KPI Cards Row Component
 * 
 * Displays a grid of KPI cards
 */

import KpiCard from './KpiCard';

export interface KpiDefinition {
  label: string;
  value: string | number;
  deltaText?: string;
  tone?: 'positive' | 'negative' | 'neutral';
}

interface KpiCardsRowProps {
  kpis: KpiDefinition[];
}

export default function KpiCardsRow({ kpis }: KpiCardsRowProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
      {kpis.map((kpi, index) => (
        <KpiCard key={index} {...kpi} />
      ))}
    </div>
  );
}

