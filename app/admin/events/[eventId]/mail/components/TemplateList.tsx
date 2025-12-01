'use client';

import { useEffect, useState } from 'react';
import { getTemplates } from '@/actions/mail/getTemplates';
import { deleteTemplate } from '@/actions/mail/deleteTemplate';
import type { EmailTemplate } from '@/lib/mail/types';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/useToast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function TemplateList({
  eventId,
  onEdit,
  onRefresh,
}: {
  eventId: string;
  onEdit: (tpl: EmailTemplate | null) => void;
  onRefresh?: () => void;
}) {
  const { success, error } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [eventId]);

  async function load() {
    try {
      setLoading(true);
      const data = await getTemplates(eventId);
      setTemplates(data);
    } catch (err: any) {
      console.error('Failed to load templates:', err);
      error('템플릿 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('템플릿을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const result = await deleteTemplate(id);
      if (result.success) {
        success('템플릿이 삭제되었습니다.');
        load();
        if (onRefresh) {
          onRefresh();
        }
      } else {
        error(result.error || '템플릿 삭제에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Failed to delete template:', err);
      error('템플릿 삭제에 실패했습니다.');
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-xl">이메일 템플릿</h2>
        <Button onClick={() => onEdit(null)}>템플릿 생성</Button>
      </div>

      {templates.length === 0 ? (
        <div className="text-gray-500 text-center py-8">템플릿이 없습니다. 새 템플릿을 생성해주세요.</div>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <div key={t.id} className="border border-gray-200 p-4 rounded-lg flex justify-between items-center hover:bg-gray-50">
              <div className="flex-1">
                <div className="font-medium text-gray-900">{t.name}</div>
                <div className="text-sm text-gray-500 mt-1">{t.subject}</div>
                <div className="text-xs text-gray-400 mt-1">
                  생성일: {new Date(t.created_at).toLocaleDateString('ko-KR')}
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <Button onClick={() => onEdit(t)} variant="ghost" size="sm">
                  수정
                </Button>
                <Button onClick={() => remove(t.id)} variant="danger" size="sm">
                  삭제
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

