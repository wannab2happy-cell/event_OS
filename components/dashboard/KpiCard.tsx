/**
 * KPI Card Component
 * 
 * Displays a single KPI metric with optional delta
 */

interface KpiCardProps {
  label: string;
  value: string | number;
  deltaText?: string;
  tone?: 'positive' | 'negative' | 'neutral';
}

export default function KpiCard({ label, value, deltaText, tone = 'neutral' }: KpiCardProps) {
  const toneColors = {
    positive: 'text-emerald-600',
    negative: 'text-rose-600',
    neutral: 'text-muted-foreground',
  };

  return (
    <div className="rounded-xl border bg-card px-4 py-3 flex flex-col gap-1">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="text-xl md:text-2xl font-semibold">{value}</div>
      {deltaText && (
        <div className={`text-xs ${toneColors[tone]}`}>{deltaText}</div>
      )}
    </div>
  );
}

