'use client';

import { useState, useTransition } from 'react';
import { Mail, Send, Eye, Users, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { sendMailAction } from '@/actions/mail/sendMail';
import toast from 'react-hot-toast';

interface MailCenterClientProps {
  eventId: string;
  eventTitle: string;
}

interface MailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  preview: string;
}

// 임시 템플릿 데이터 (향후 실제 템플릿 시스템으로 교체)
const templates: MailTemplate[] = [
  {
    id: 'invite',
    name: '초대 메일',
    description: '참가자 초대 및 등록 안내',
    subject: `✨ ${'EVENT_NAME'}: 참가 등록을 시작해주세요!`,
    preview: '안녕하세요, 참가자님. 이벤트 참가 등록을 시작해주세요.',
  },
  {
    id: 'reminder1',
    name: '리마인더 1차',
    description: '등록 미완료 참가자 대상',
    subject: `⏰ ${'EVENT_NAME'}: 등록 정보 입력이 아직 완료되지 않았습니다`,
    preview: '등록 정보 입력을 완료해주시기 바랍니다.',
  },
  {
    id: 'reminder2',
    name: '리마인더 2차',
    description: '최종 리마인더',
    subject: `🚨 ${'EVENT_NAME'}: 등록 마감 임박 안내`,
    preview: '등록 마감이 임박했습니다. 빠른 시일 내에 등록을 완료해주세요.',
  },
  {
    id: 'qr-pass',
    name: 'QR Pass 안내',
    description: 'QR Pass 확인 안내',
    subject: `📱 ${'EVENT_NAME'}: QR Pass 확인 안내`,
    preview: 'QR Pass를 확인하고 현장 체크인에 준비하세요.',
  },
  {
    id: 'confirmation',
    name: '확정 메일',
    description: '항공/호텔 확정 정보 안내',
    subject: `✨ ${'EVENT_NAME'}: 항공 및 숙박 예약이 최종 확정되었습니다!`,
    preview: '항공 및 숙박 예약이 최종 확정되었습니다. 상세 정보를 확인해주세요.',
  },
];

export default function MailCenterClient({ eventId, eventTitle }: MailCenterClientProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<MailTemplate | null>(templates[0]);
  const [targetFilter, setTargetFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [isPending, startTransition] = useTransition();

  // 템플릿 ID를 templateKey로 변환
  const getTemplateKey = (templateId: string): 'invite' | 'reminder_1' | 'reminder_2' | 'qr_pass' | 'confirmation' => {
    const mapping: Record<string, 'invite' | 'reminder_1' | 'reminder_2' | 'qr_pass' | 'confirmation'> = {
      invite: 'invite',
      reminder1: 'reminder_1',
      reminder2: 'reminder_2',
      'qr-pass': 'qr_pass',
      confirmation: 'confirmation',
    };
    return mapping[templateId] || 'invite';
  };

  const handleSend = () => {
    if (!selectedTemplate) {
      toast.error('템플릿을 선택해주세요.');
      return;
    }

    startTransition(async () => {
      try {
        const templateKey = getTemplateKey(selectedTemplate.id);
        const result = await sendMailAction({
          eventId,
          templateKey,
          targetFilter,
        });

        if (result.success) {
          toast.success(result.message || `메일 발송 완료: ${result.successCount}/${result.total} 성공, ${result.failed} 실패`);
          // 페이지 새로고침하여 로그 업데이트
          window.location.reload();
        } else {
          toast.error(result.message || '메일 발송 중 오류가 발생했습니다.');
        }
      } catch (error: any) {
        console.error('Send mail error:', error);
        toast.error(error?.message || '메일 발송 중 오류가 발생했습니다.');
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      {/* 좌측: 템플릿 리스트 */}
      <div className="space-y-4">
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              템플릿
            </CardTitle>
            <CardDescription>발송할 메일 템플릿을 선택하세요.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {templates.map((template) => {
                const isSelected = selectedTemplate?.id === template.id;
                return (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`w-full text-left p-4 transition-all duration-150 ${
                      isSelected
                        ? 'bg-blue-50 border-l-4 border-blue-600 shadow-sm'
                        : 'hover:bg-gray-50 hover:border-l-4 hover:border-gray-200 border-l-4 border-transparent'
                    }`}
                  >
                    <div className={`font-semibold text-sm mb-1 ${
                      isSelected ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {template.name}
                    </div>
                    <div className={`text-xs ${
                      isSelected ? 'text-blue-700' : 'text-gray-500'
                    }`}>
                      {template.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 발송 통계 (향후 구현) */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm">발송 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">오늘 발송</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">이번 주</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">전체</span>
                <span className="font-semibold">0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 우측: 미리보기 및 발송 */}
      <div className="space-y-6">
        {selectedTemplate ? (
          <>
            {/* 미리보기 */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5 text-gray-600" />
                  미리보기
                </CardTitle>
                <CardDescription>
                  선택한 템플릿의 미리보기입니다. 실제 발송 전에 내용을 확인하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                    제목
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                    {selectedTemplate.subject.replace('EVENT_NAME', eventTitle)}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                    내용 미리보기
                  </label>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 min-h-[200px]">
                    {selectedTemplate.preview}
                    <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                      * 실제 메일 내용은 템플릿에 따라 다를 수 있습니다.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 발송 옵션 */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">발송 설정</CardTitle>
                <CardDescription>메일 발송 대상을 선택하고 발송하세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">발송 대상</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="target"
                        value="all"
                        checked={targetFilter === 'all'}
                        onChange={() => setTargetFilter('all')}
                        className="text-blue-600"
                      />
                      <span className="text-sm">전체 참가자</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="target"
                        value="completed"
                        checked={targetFilter === 'completed'}
                        onChange={() => setTargetFilter('completed')}
                        className="text-blue-600"
                      />
                      <span className="text-sm">등록 완료 참가자</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="target"
                        value="incomplete"
                        checked={targetFilter === 'incomplete'}
                        onChange={() => setTargetFilter('incomplete')}
                        className="text-blue-600"
                      />
                      <span className="text-sm">등록 미완료 참가자</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handleSend}
                    disabled={isPending || !selectedTemplate}
                  >
                    {isPending ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        발송 중...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        메일 발송하기
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border border-gray-200">
            <CardContent className="p-12 text-center">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">왼쪽에서 템플릿을 선택하세요.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

