'use client';

import { useState, useTransition } from 'react';
import { Send, Eye, Beaker } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SegmentationSelector } from '@/components/mail/SegmentationSelector';
import { enqueueMessageJob } from '@/actions/message/enqueueMessageJob';
import { sendTestMessage } from '@/actions/message/sendTestMessage';
import { useToast } from '@/components/ui/Toast';
import type { MessageTemplate } from '@/lib/mail/types';
import type { SegmentationConfig } from '@/lib/mail/segmentation';
import { mergeMessageTemplate } from '@/lib/message/merge';

interface MessageSendClientProps {
  template: MessageTemplate;
  eventId: string;
  event: { id: string; title: string; code: string };
  companies: string[];
}

export function MessageSendClient({ template, eventId, event, companies }: MessageSendClientProps) {
  const { success, error } = useToast();
  const [isSending, startSend] = useTransition();
  const [isTestSending, startTestSend] = useTransition();
  const [testPhone, setTestPhone] = useState('');
  const [segmentation, setSegmentation] = useState<SegmentationConfig>({ rules: [{ type: 'all' }] });
  const [showPreview, setShowPreview] = useState(false);

  const handleTestSend = () => {
    if (!testPhone.trim()) {
      error('전화번호를 입력해주세요');
      return;
    }

    startTestSend(async () => {
      const result = await sendTestMessage({
        templateId: template.id,
        channel: template.channel,
        phone: testPhone.trim(),
        eventId,
      });

      if (result.ok) {
        success('테스트 메시지가 발송되었습니다');
        setTestPhone('');
      } else {
        error(result.error || '테스트 메시지 발송에 실패했습니다');
      }
    });
  };

  const handleStartCampaign = () => {
    if (!confirm(`${template.channel.toUpperCase()} 캠페인을 시작하시겠습니까?`)) {
      return;
    }

    startSend(async () => {
      const result = await enqueueMessageJob({
        eventId,
        templateId: template.id,
        channel: template.channel,
        segmentation,
      });

      if (result.ok && result.jobId) {
        success('메시지 작업이 생성되었습니다');
        // Redirect to jobs page or refresh
        window.location.href = `/admin/events/${eventId}/messages`;
      } else {
        error(result.error || '캠페인 생성에 실패했습니다');
      }
    });
  };

  // Generate preview
  const previewBody = mergeMessageTemplate(
    template,
    {
      participant: {
        id: 'preview',
        name: '홍길동',
        email: 'hong@example.com',
        phone: '010-1234-5678',
        company: '예시 회사',
        position: '대표',
      } as any,
      event,
      tableName: 'Table 5',
    }
  );

  return (
    <div className="space-y-6">
      {/* Test Send */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Beaker className="w-4 h-4 text-blue-600" />
          테스트 발송
        </h3>
        <div className="flex items-center gap-2">
          <Input
            type="tel"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            placeholder="010-1234-5678"
            disabled={isTestSending}
            className="flex-1"
          />
          <Button onClick={handleTestSend} disabled={isTestSending} variant="secondary" size="sm">
            {isTestSending ? '발송 중...' : '테스트 발송'}
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600" />
            미리보기
          </h3>
          <Button onClick={() => setShowPreview(!showPreview)} variant="ghost" size="sm">
            {showPreview ? '숨기기' : '보기'}
          </Button>
        </div>
        {showPreview && (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{previewBody}</p>
          </div>
        )}
      </div>

      {/* Segmentation */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">발송 대상</h3>
        <SegmentationSelector
          eventId={eventId}
          value={segmentation}
          onChange={setSegmentation}
          companies={companies}
        />
      </div>

      {/* Start Campaign */}
      <div className="flex items-center justify-end">
        <Button onClick={handleStartCampaign} disabled={isSending} variant="primary" size="lg">
          <Send className="w-4 h-4 mr-2" />
          {isSending ? '생성 중...' : '캠페인 시작'}
        </Button>
      </div>
    </div>
  );
}

