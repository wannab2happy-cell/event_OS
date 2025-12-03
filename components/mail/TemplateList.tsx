'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { TemplateCard } from './TemplateCard';
import type { EmailTemplate } from '@/lib/mail/types';

interface TemplateListProps {
  templates: EmailTemplate[];
  eventId: string;
}

export function TemplateList({ templates, eventId }: TemplateListProps) {
  return (
    <div className="w-[320px] border-r border-gray-200 h-full overflow-y-auto bg-white">
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-900">Templates</h2>
        </div>
        <Link
          href={`/admin/events/${eventId}/mail/templates/new`}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          새 템플릿
        </Link>
      </div>
      <div className="p-4 space-y-2">
        {templates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">템플릿이 없습니다.</p>
            <Link
              href={`/admin/events/${eventId}/mail/templates/new`}
              className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
            >
              첫 템플릿 만들기
            </Link>
          </div>
        ) : (
          templates.map((template) => (
            <TemplateCard key={template.id} template={template} eventId={eventId} />
          ))
        )}
      </div>
    </div>
  );
}

