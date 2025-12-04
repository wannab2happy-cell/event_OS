'use client';

import Link from 'next/link';
import { MessageSquare, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { MessageTemplate } from '@/lib/mail/types';

interface MessageTemplateCardProps {
  template: MessageTemplate;
  eventId: string;
  onSend: (template: MessageTemplate) => void;
}

export function MessageTemplateCard({ template, eventId, onSend }: MessageTemplateCardProps) {
  const channelColors = {
    sms: 'bg-yellow-100 text-yellow-700',
    kakao: 'bg-black text-yellow-300',
  };

  const channelLabels = {
    sms: 'SMS',
    kakao: 'Kakao',
  };

  const preview = template.body.length > 60 ? `${template.body.slice(0, 60)}...` : template.body;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{template.name}</h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{preview}</p>
        </div>
        <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${channelColors[template.channel]}`}>
          {channelLabels[template.channel]}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <Button onClick={() => onSend(template)} variant="primary" size="sm" className="flex-1">
          <MessageSquare className="w-3 h-3 mr-1" />
          Send
        </Button>
        <Link href={`/admin/events/${eventId}/messages/templates/${template.id}/edit`}>
          <Button variant="ghost" size="sm">
            <Edit2 className="w-3 h-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}




