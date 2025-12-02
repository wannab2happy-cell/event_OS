'use client';

import { useState } from 'react';
import { FileText, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { TemplateListItem } from './TemplateListItem';
import type { EmailTemplate } from '@/lib/mail/types';

interface TemplateListProps {
  templates: EmailTemplate[];
  eventId: string;
  onDelete: (id: string) => void;
  onPreview: (template: EmailTemplate) => void;
}

export function TemplateList({ templates, eventId, onDelete, onPreview }: TemplateListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-600" />
              Email Templates
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              이벤트별 메일 템플릿을 관리합니다. 템플릿에 {'{{변수명}}'} 형식으로 변수를 사용할 수 있습니다.
            </p>
          </div>
          <Link href={`/admin/events/${eventId}/mail/templates/new`}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="템플릿 이름 또는 제목으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              {searchQuery ? '검색 결과가 없습니다.' : '템플릿이 없습니다. 새 템플릿을 생성해주세요.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTemplates.map((template) => (
              <TemplateListItem
                key={template.id}
                template={template}
                onDelete={onDelete}
                onPreview={onPreview}
                eventId={eventId}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

