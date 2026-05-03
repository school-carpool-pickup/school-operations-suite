import { Card } from '@/components/ui/card';

export interface StatMetric {
  label: string;
  value: string | number;
  colorClass?: string;
}

export function CRMStatCards({ metrics }: { metrics: StatMetric[] }) {
  const lgCols =
    metrics.length === 1
      ? 'lg:grid-cols-1'
      : metrics.length === 2
        ? 'lg:grid-cols-2'
        : metrics.length === 3
          ? 'lg:grid-cols-3'
          : metrics.length === 4
            ? 'lg:grid-cols-4'
            : 'lg:grid-cols-5';

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 ${lgCols} gap-4 mb-6`}>
      {metrics.map((metric) => (
        <Card
          key={metric.label}
          className="p-5 shadow-sm border-border flex flex-col justify-center min-w-[150px]"
        >
          <span className="text-sm font-medium text-muted-foreground mb-1">
            {metric.label}
          </span>
          <span
            className={`text-4xl font-bold tracking-tight ${metric.colorClass || 'text-foreground'}`}
          >
            {metric.value}
          </span>
        </Card>
      ))}
    </div>
  );
}
