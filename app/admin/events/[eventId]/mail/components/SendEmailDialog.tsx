'use client';

import { useEffect, useState } from 'react';
import { sendBulkEmail } from '@/actions/mail/sendBulkEmail';
import { getRecipients } from '@/actions/mail/getRecipients';
import type { EmailTemplate } from '@/lib/mail/types';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/useToast';

export default function SendEmailDialog({
  eventId,
  templates,
  onSent,
  onClose,
}: {
  eventId: string;
  templates: EmailTemplate[];
  onSent: () => void;
  onClose: () => void;
}) {
  const { success, error } = useToast();
  const [templateId, setTemplateId] = useState('');
  const [recipients, setRecipients] = useState<Array<{
    email: string;
    participantId?: string | null;
    variables: Record<string, string>;
  }>>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecipients();
  }, [eventId]);

  async function loadRecipients() {
    try {
      setLoadingRecipients(true);
      const list = await getRecipients(eventId);
      setRecipients(list);
    } catch (err: any) {
      console.error('Failed to load recipients:', err);
      error('참가자 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoadingRecipients(false);
    }
  }

  async function send() {
    if (!templateId) {
      error('템플릿을 선택해주세요.');
      return;
    }

    if (recipients.length === 0) {
      error('발송할 수신자가 없습니다.');
      return;
    }

    try {
      setLoading(true);
      const result = await sendBulkEmail({ eventId, templateId, recipients });
      if (result.success) {
        success(`이메일 발송 작업이 시작되었습니다. (작업 ID: ${result.jobId?.slice(0, 8)}...)`);
        onSent();
        onClose();
      } else {
        error(result.error || '이메일 발송에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Failed to send email:', err);
      error(err.message || '이메일 발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-gray-200 p-6 rounded-lg bg-white space-y-4">
      <h2 className="font-semibold text-lg text-gray-900">이메일 발송</h2>

      {loadingRecipients ? (
        <LoadingSpinner />
      ) : (
        <div className="text-sm text-gray-600">
          총 <span className="font-medium text-blue-600">{recipients.length}명</span>의 참가자에게 발송됩니다.
        </div>
      )}

      <Select
        value={templateId}
        onChange={(e) => setTemplateId(e.target.value)}
        label="템플릿 선택"
      >
        <option value="">템플릿을 선택하세요</option>
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name} - {t.subject}
          </option>
        ))}
      </Select>

      <div className="flex justify-end space-x-2 pt-2">
        <Button variant="ghost" onClick={onClose} disabled={loading || loadingRecipients}>
          취소
        </Button>
        <Button
          onClick={send}
          disabled={!templateId || loading || loadingRecipients || recipients.length === 0}
        >
          {loading ? '발송 중...' : '발송하기'}
        </Button>
      </div>
    </div>
  );
}
