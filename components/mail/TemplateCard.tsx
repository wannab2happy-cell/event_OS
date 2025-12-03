'use client';

import Link from 'next/link';
import { FileText, Clock } from 'lucide-react';
import type { EmailTemplate } from '@/lib/mail/types';

interface TemplateCardProps {
  template: EmailTemplate;
  eventId: string;
}

export function TemplateCard({ template, eventId }: TemplateCardProps) {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Link href={`/admin/events/${eventId}/mail/templates/${template.id}`}>
      <div className="rounded-lg border border-gray-200 p-3 hover:bg-gray-50 cursor-pointer transition-colors">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{template.name}</h3>
            <p className="text-xs text-gray-600 mt-1 truncate">{template.subject}</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{formatDate(template.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

