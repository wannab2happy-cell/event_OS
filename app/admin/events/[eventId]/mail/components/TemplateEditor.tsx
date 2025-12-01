'use client';

import { useState, useEffect } from 'react';
import { createTemplate } from '@/actions/mail/createTemplate';
import { updateTemplate } from '@/actions/mail/updateTemplate';
import type { EmailTemplate } from '@/lib/mail/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/useToast';
import TemplatePreviewModal from './TemplatePreviewModal';

export default function TemplateEditor({
  eventId,
  template,
  onClose,
  onSaved,
}: {
  eventId: string;
  template: EmailTemplate | null;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const { success, error } = useToast();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const sampleVariables = {
    name: '홍길동',
    company: 'Anders',
    position: 'Manager',
  };

  useEffect(() => {
    if (template) {
      setTitle(template.name);
      setSubject(template.subject);
      setBodyHtml(template.body_html || '');
    } else {
      setTitle('');
      setSubject('');
      setBodyHtml('');
    }
  }, [template]);

  async function save() {
    if (!title.trim() || !subject.trim() || !bodyHtml.trim()) {
      error('모든 필드를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      if (template) {
        await updateTemplate(template.id, { title, subject, bodyHtml });
        success('템플릿이 수정되었습니다.');
      } else {
        await createTemplate({ eventId, title, subject, bodyHtml });
        success('템플릿이 생성되었습니다.');
      }
      if (onSaved) {
        onSaved();
      }
      onClose();
    } catch (err: any) {
      console.error('Failed to save template:', err);
      error(err.message || '템플릿 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 border border-gray-200 p-5 rounded-lg bg-white">
      <h2 className="font-semibold text-lg text-gray-900">
        {template ? '템플릿 수정' : '템플릿 생성'}
      </h2>

      <Input
        placeholder="템플릿 이름"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        label="템플릿 이름"
      />

      <Input
        placeholder="이메일 제목"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        label="이메일 제목"
      />

      <Textarea
        placeholder="HTML 본문 (예: Hello {{name}}, ...)"
        value={bodyHtml}
        onChange={(e) => setBodyHtml(e.target.value)}
        className="min-h-[200px] font-mono text-sm"
        label="HTML 본문"
        helperText="변수는 {{변수명}} 형식으로 사용할 수 있습니다. 예: {{name}}, {{eventName}}"
      />

      <div className="flex justify-end space-x-2 pt-2">
        <Button variant="ghost" onClick={() => setPreviewOpen(true)} disabled={loading || !bodyHtml.trim()}>
          미리보기
        </Button>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          취소
        </Button>
        <Button onClick={save} disabled={loading}>
          {loading ? '저장 중...' : '저장'}
        </Button>
      </div>

      <TemplatePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        template={{ subject, bodyHtml }}
        sampleVariables={sampleVariables}
      />
    </div>
  );
}

