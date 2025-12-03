'use client';

import { MessageTemplateCard } from './MessageTemplateCard';
import type { MessageTemplate } from '@/lib/mail/types';

interface MessageTemplateListProps {
  templates: MessageTemplate[];
  eventId: string;
  onSend: (template: MessageTemplate) => void;
}

export function MessageTemplateList({ templates, eventId, onSend }: MessageTemplateListProps) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-sm text-gray-500">No message templates</p>
        <p className="text-xs text-gray-400 mt-1">Create templates to send SMS or Kakao messages</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {templates.map((template) => (
        <MessageTemplateCard key={template.id} template={template} eventId={eventId} onSend={onSend} />
      ))}
    </div>
  );
}

