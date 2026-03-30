'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface BreakdownItem {
  label: string;
  count: number;
  percentage: number;
  color?: string;
}

interface BreakdownListCardProps {
  title: string;
  description?: string;
  items: BreakdownItem[];
  total: number;
}

const DEFAULT_COLORS = [
  'bg-accent-blue',
  'bg-blue-500',
  'bg-blue-400',
  'bg-blue-300',
  'bg-blue-200',
];

export function BreakdownListCard({ title, description, items, total }: BreakdownListCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-3 h-3 rounded-full',
                      item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
                    )}
                  />
                  <span className="font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{item.count}</span>
                  <span className="font-medium min-w-[3rem] text-right">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
                  )}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
