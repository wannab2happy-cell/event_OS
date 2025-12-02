'use client';

import Link from 'next/link';
import { FileText, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { EmailTemplate } from '@/lib/mail/types';

interface TemplateListItemProps {
  template: EmailTemplate;
  onDelete: (id: string) => void;
  onPreview: (template: EmailTemplate) => void;
  eventId: string;
}

export function TemplateListItem({ template, onDelete, onPreview, eventId }: TemplateListItemProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <FileText className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900 truncate">{template.name}</h4>
          </div>
          <p className="text-xs text-gray-500 mt-1 truncate">{template.subject}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span>업데이트: {formatDate(template.updated_at)}</span>
            {template.merge_variables.length > 0 && (
              <span>변수: {template.merge_variables.length}개</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPreview(template)}
          className="text-gray-600 hover:text-gray-900"
        >
          <Eye className="w-4 h-4" />
        </Button>
        <Link href={`/admin/events/${eventId}/mail/templates/${template.id}`}>
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
            <Edit className="w-4 h-4" />
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(template.id)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

