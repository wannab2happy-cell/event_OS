'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Beaker, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { sendTestEmail } from '@/actions/mail/sendTestEmail';
import { enqueueEmailJob } from '@/actions/mail/enqueueEmailJob';
import { useToast } from '@/components/ui/Toast';
import { ToastContainer } from '@/components/ui/Toast';
import { SegmentationSelector } from '@/components/mail/SegmentationSelector';
import { getParticipantCompanies } from '@/lib/mail/segmentation';
import type { EmailTemplate } from '@/lib/mail/types';
import type { SegmentationConfig } from '@/lib/mail/segmentation';
import { applyMergeVariables } from '@/lib/mail/parser';

interface TemplateSendClientProps {
  template: EmailTemplate;
  eventId: string;
  eventTitle?: string;
}

export function TemplateSendClient({ template, eventId, eventTitle }: TemplateSendClientProps) {
  const router = useRouter();
  const { toasts, success, error, removeToast } = useToast();
  const [testEmail, setTestEmail] = useState('');
  const [isSendingTest, startTestSend] = useTransition();
  const [isEnqueuing, startEnqueue] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [companies, setCompanies] = useState<string[]>([]);
  const [segmentation, setSegmentation] = useState<SegmentationConfig>({
    rules: [{ type: 'all' }],
  });

  // Load companies on mount
  useEffect(() => {
    async function loadCompanies() {
      try {
        const response = await fetch(`/api/mail/companies?eventId=${eventId}`);
        if (response.ok) {
          const data = await response.json();
          setCompanies(data.companies || []);
        }
      } catch (err) {
        console.error('Failed to load companies:', err);
      }
    }
    loadCompanies();
  }, [eventId]);

  // Sample variables for preview
  const sampleVariables: Record<string, string> = {
    name: '홍길동',
    email: 'test@example.com',
    event_title: eventTitle || '테스트 이벤트',
    event_code: 'TEST',
    company: '테스트 회사',
    tableName: '테이블 A',
  };

  const renderedSubject = applyMergeVariables(template.subject, sampleVariables);
  const renderedHtml = applyMergeVariables(template.body_html, sampleVariables);

  const handleSendTest = () => {
    if (!testEmail.trim()) {
      error('테스트 이메일 주소를 입력해주세요.');
      return;
    }

    startTestSend(async () => {
      const result = await sendTestEmail({
        eventId,
        templateId: template.id,
        testEmail: testEmail.trim(),
      });

      if (result.ok) {
        success(`테스트 메일이 ${testEmail}로 발송되었습니다.`);
        setTestEmail('');
      } else {
        error(result.error || '테스트 메일 발송에 실패했습니다.');
      }
    });
  };

  const handleStartCampaign = () => {
    setShowConfirm(true);
  };

  const handleConfirmCampaign = () => {
    startEnqueue(async () => {
      const result = await enqueueEmailJob({
        eventId,
        templateId: template.id,
        segmentation,
      });

      if (result.ok && result.jobId) {
        success('캠페인 작업이 생성되었습니다. Job Queue에서 확인할 수 있습니다.');
        setShowConfirm(false);
        // Redirect to mail center after a short delay
        setTimeout(() => {
          router.push(`/admin/events/${eventId}/mail`);
        }, 1500);
      } else {
        error(result.error || '캠페인 작업 생성에 실패했습니다.');
        setShowConfirm(false);
      }
    });
  };

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Panel: Actions */}
        <div className="space-y-6">
          {/* Test Send */}
          <Card className="rounded-lg border border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Beaker className="w-5 h-5 text-blue-600" />
                Test Send
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test email address
                </label>
                <Input
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  disabled={isSendingTest}
                />
              </div>
              <Button
                onClick={handleSendTest}
                disabled={isSendingTest || !testEmail.trim()}
                variant="secondary"
                className="w-full"
              >
                <Beaker className="w-4 h-4 mr-2" />
                {isSendingTest ? '발송 중...' : 'Send Test Email'}
              </Button>
            </CardContent>
          </Card>

          {/* Campaign */}
          <Card className="rounded-lg border border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Send className="w-5 h-5 text-green-600" />
                Campaign
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SegmentationSelector
                eventId={eventId}
                value={segmentation}
                onChange={setSegmentation}
                companies={companies}
              />
              <Button
                onClick={handleStartCampaign}
                disabled={isEnqueuing}
                variant="primary"
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {isEnqueuing ? '작업 생성 중...' : 'Start Campaign'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Preview */}
        <Card className="rounded-lg border border-gray-200 bg-white h-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-600" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Subject
                </label>
                <p className="text-sm text-gray-900 font-medium">{renderedSubject}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  HTML Content
                </label>
                <div
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-[500px] overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">캠페인 시작 확인</h3>
            <p className="text-sm text-gray-600 mb-2">
              이 템플릿을 <strong>선택한 세그먼트</strong>에게 발송하시겠습니까?
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-gray-900">{template.name}</p>
              <p className="text-xs text-gray-600 mt-1">{template.subject}</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowConfirm(false)}
                variant="secondary"
                className="flex-1"
                disabled={isEnqueuing}
              >
                취소
              </Button>
              <Button
                onClick={handleConfirmCampaign}
                variant="primary"
                className="flex-1"
                disabled={isEnqueuing}
              >
                {isEnqueuing ? '생성 중...' : '확인'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

