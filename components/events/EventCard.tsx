/**
 * Event Card Component
 * 
 * Displays a single event with KPIs and actions
 */

'use client';

import Link from 'next/link';
import { Calendar, MapPin, Copy, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import EventKpiBadges from './EventKpiBadges';
import type { EventKPIs } from '@/lib/events/eventKpiUtils';
import { formatDateKorean } from '@/lib/utils/date';

export interface EventWithKPIs {
  id: string;
  title: string;
  code: string;
  start_date: string;
  end_date: string;
  status: 'planning' | 'active' | 'archived';
  location?: string | null;
  kpis: EventKPIs;
}

interface EventCardProps {
  event: EventWithKPIs;
}

export default function EventCard({ event }: EventCardProps) {
  const getStatusVariant = (
    status: 'planning' | 'active' | 'archived'
  ): 'default' | 'success' | 'info' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'planning':
        return 'info';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: 'planning' | 'active' | 'archived'): string => {
    switch (status) {
      case 'planning':
        return 'Planned';
      case 'active':
        return 'Ongoing';
      case 'archived':
        return 'Archived';
      default:
        return status;
    }
  };

  const dateRange = `${formatDateKorean(event.start_date)} - ${formatDateKorean(event.end_date)}`;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{event.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{dateRange}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
            <Badge variant={getStatusVariant(event.status)} className="w-fit">
              {getStatusLabel(event.status)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <EventKpiBadges kpis={event.kpis} />
        <div className="flex items-center gap-2 pt-4 border-t">
          <Link href={`/admin/events/${event.id}/dashboard`} className="flex-1">
            <Button variant="primary" className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open
            </Button>
          </Link>
          <Link href={`/admin/events/${event.id}/duplicate`}>
            <Button variant="secondary">
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

