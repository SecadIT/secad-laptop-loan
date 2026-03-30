'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface ActivityItem {
  id: number | string;
  title: string;
  description: string;
  timestamp: string;
  type: 'asset' | 'loan';
  href?: string;
}

interface RecentActivityCardProps {
  title: string;
  description?: string;
  items: ActivityItem[];
  maxItems?: number;
}

export function RecentActivityCard({
  title,
  description,
  items,
  maxItems = 5,
}: RecentActivityCardProps) {
  const displayItems = items.slice(0, maxItems);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayItems.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="flex items-start gap-3 pb-4 border-b last:border-b-0 last:pb-0"
            >
              <div
                className={cn(
                  'w-2 h-2 rounded-full mt-2',
                  item.type === 'asset' ? 'bg-accent-blue' : 'bg-green-500'
                )}
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-none">{item.title}</p>
                  {item.href && (
                    <Link
                      href={item.href}
                      className="text-accent-blue hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
          {displayItems.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
