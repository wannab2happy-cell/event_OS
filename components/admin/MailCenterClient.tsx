'use client';

import { useState, useTransition } from 'react';
import { Mail, Send, Eye, Users, CheckCircle, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { sendMailAction } from '@/actions/mail/sendMail';
import toast from 'react-hot-toast';
import { render } from '@react-email/render';
import InviteEmail from '@/emails/templates/InviteEmail';
import Reminder1Email from '@/emails/templates/Reminder1Email';
import Reminder2Email from '@/emails/templates/Reminder2Email';
import QrPassEmail from '@/emails/templates/QrPassEmail';
import ConfirmationEmail from '@/emails/templates/ConfirmationEmail';

interface MailCenterClientProps {
  eventId: string;
  eventTitle: string;
  eventDates?: string | null;
  eventLocation?: string | null;
  heroTagline?: string | null;
  primaryColor?: string | null;
}

interface MailTemplate {
  id: string;
  name: string;
  description: string;
  defaultSubject: string;
  defaultPreheader: string;
  templateKey: 'invite' | 'reminder_1' | 'reminder_2' | 'qr_pass' | 'confirmation';
}

const templates: MailTemplate[] = [
  {
    id: 'invite',
    name: '초대 메일',
    description: '참가자 초대 및 등록 안내',
    defaultSubject: `✨ EVENT_NAME: 참가 등록을 시작해주세요!`,
    defaultPreheader: '행사 참가 등록을 시작해주세요.',
    templateKey: 'invite',
  },
  {
    id: 'reminder1',
    name: '리마인더 1차',
    description: '등록 미완료 참가자 대상',
    defaultSubject: `⏰ EVENT_NAME: 등록 정보 입력이 아직 완료되지 않았습니다`,
    defaultPreheader: '등록 정보 입력을 완료해주시기 바랍니다.',
    templateKey: 'reminder_1',
  },
  {
    id: 'reminder2',
    name: '리마인더 2차',
    description: '최종 리마인더',
    defaultSubject: `🚨 EVENT_NAME: 등록 마감 임박 안내`,
    defaultPreheader: '등록 마감이 임박했습니다. 빠른 시일 내에 등록을 완료해주세요.',
    templateKey: 'reminder_2',
  },
  {
    id: 'qr-pass',
    name: 'QR Pass 안내',
    description: 'QR Pass 확인 안내',
    defaultSubject: `📱 EVENT_NAME: QR Pass 확인 안내`,
    defaultPreheader: 'QR Pass를 확인하고 현장 체크인에 준비하세요.',
    templateKey: 'qr_pass',
  },
  {
    id: 'confirmation',
    name: '확정 메일',
    description: '항공/호텔 확정 정보 안내',
    defaultSubject: `✨ EVENT_NAME: 항공 및 숙박 예약이 최종 확정되었습니다!`,
    defaultPreheader: '항공 및 숙박 예약이 최종 확정되었습니다. 상세 정보를 확인해주세요.',
    templateKey: 'confirmation',
  },
];

export default function MailCenterClient({
  eventId,
  eventTitle,
  eventDates,
  eventLocation,
  heroTagline,
  primaryColor,
}: MailCenterClientProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<MailTemplate | null>(templates[0]);
  const [targetFilter, setTargetFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [subject, setSubject] = useState('');
  const [preheader, setPreheader] = useState('');
  const [showPipaNotice, setShowPipaNotice] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [isPending, startTransition] = useTransition();

  // 템플릿 변경 시 기본값 설정
  const handleTemplateChange = (template: MailTemplate) => {
    setSelectedTemplate(template);
    setSubject(template.defaultSubject.replace('EVENT_NAME', eventTitle));
    setPreheader(template.defaultPreheader);
  };

  // 미리보기 생성
  const handlePreview = async () => {
    if (!selectedTemplate) return;

    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const eventLink = `${siteUrl}/${eventId}`;
      const registerLink = `${siteUrl}/${eventId}/login`;
      const qrPassLink = `${siteUrl}/${eventId}/qr-pass`;

      const mockParticipant = {
        name: '테스트 참가자',
        email: 'test@example.com',
        flight_ticket_no: 'TEST123456',
        guest_confirmation_no: 'HOTEL789',
        is_travel_confirmed: true,
        is_hotel_confirmed: true,
      };

      let emailHtml = '';

      const commonProps = {
        participantName: mockParticipant.name,
        eventTitle,
        eventDates,
        eventLocation,
        heroTagline,
        primaryColor: primaryColor || '#2563eb',
        supportEmail: 'support@event-os.com',
        showPipaNotice,
      };

      switch (selectedTemplate.templateKey) {
        case 'invite':
          emailHtml = await render(
            <InviteEmail {...commonProps} ctaUrl={registerLink} />
          );
          break;
        case 'reminder_1':
          emailHtml = await render(
            <Reminder1Email {...commonProps} ctaUrl={registerLink} />
          );
          break;
        case 'reminder_2':
          emailHtml = await render(
            <Reminder2Email {...commonProps} ctaUrl={registerLink} />
          );
          break;
        case 'qr_pass':
          emailHtml = await render(
            <QrPassEmail {...commonProps} ctaUrl={qrPassLink} />
          );
          break;
        case 'confirmation':
          emailHtml = await render(
            <ConfirmationEmail
              participantName={mockParticipant.name}
              eventName={eventTitle}
              eventTitle={eventTitle}
              eventLink={qrPassLink}
              registerLink={registerLink}
              flightTicketNo={mockParticipant.flight_ticket_no}
              guestConfirmationNo={mockParticipant.guest_confirmation_no}
              isTravelConfirmed={mockParticipant.is_travel_confirmed}
              isHotelConfirmed={mockParticipant.is_hotel_confirmed}
              heroTagline={heroTagline}
              primaryColor={primaryColor || '#2563eb'}
              supportEmail="support@event-os.com"
              showPipaNotice={showPipaNotice}
            />
          );
          break;
      }

      setPreviewHtml(emailHtml);
      setShowPreview(true);
    } catch (error: any) {
      console.error('Preview error:', error);
      toast.error('미리보기 생성 중 오류가 발생했습니다.');
    }
  };

  // 테스트 발송
  const handleTestSend = () => {
    if (!selectedTemplate || !testEmail.trim()) {
      toast.error('테스트 이메일 주소를 입력해주세요.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail.trim())) {
      toast.error('유효한 이메일 주소를 입력해주세요.');
      return;
    }

    startTransition(async () => {
      try {
        const result = await sendMailAction({
          eventId,
          templateKey: selectedTemplate.templateKey,
          targetFilter: 'all', // 테스트는 필터 무시
          subject: subject || selectedTemplate.defaultSubject.replace('EVENT_NAME', eventTitle),
          preheader: preheader || selectedTemplate.defaultPreheader,
          showPipaNotice,
          testEmail: testEmail.trim(),
        });

        if (result.success) {
          toast.success(`테스트 메일이 ${testEmail}로 발송되었습니다.`);
          setTestEmail('');
        } else {
          toast.error(result.message || '테스트 메일 발송 중 오류가 발생했습니다.');
        }
      } catch (error: any) {
        console.error('Test send error:', error);
        toast.error(error?.message || '테스트 메일 발송 중 오류가 발생했습니다.');
      }
    });
  };

  // 실제 발송
  const handleSend = () => {
    if (!selectedTemplate) {
      toast.error('템플릿을 선택해주세요.');
      return;
    }

    startTransition(async () => {
      try {
        const result = await sendMailAction({
          eventId,
          templateKey: selectedTemplate.templateKey,
          targetFilter,
          subject: subject || selectedTemplate.defaultSubject.replace('EVENT_NAME', eventTitle),
          preheader: preheader || selectedTemplate.defaultPreheader,
          showPipaNotice,
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
                    onClick={() => handleTemplateChange(template)}
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
      </div>

      {/* 우측: 설정 및 발송 */}
      <div className="space-y-6">
        {selectedTemplate ? (
          <>
            {/* 메일 설정 */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">메일 설정</CardTitle>
                <CardDescription>메일 제목과 내용을 설정하세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="메일 제목"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={selectedTemplate.defaultSubject.replace('EVENT_NAME', eventTitle)}
                  helperText="기본값을 수정할 수 있습니다."
                />

                <Input
                  label="프리헤더"
                  value={preheader}
                  onChange={(e) => setPreheader(e.target.value)}
                  placeholder={selectedTemplate.defaultPreheader}
                  helperText="메일 목록에서 제목 옆에 보이는 짧은 문장입니다."
                />

                <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <input
                    id="showPipaNotice"
                    type="checkbox"
                    checked={showPipaNotice}
                    onChange={(e) => setShowPipaNotice(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="showPipaNotice" className="text-sm font-medium text-gray-700 select-none">
                    PIPA 안내 문구 포함
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={handlePreview} disabled={isPending}>
                    <Eye className="h-4 w-4 mr-2" />
                    미리보기
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 테스트 발송 */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">테스트 발송</CardTitle>
                <CardDescription>본인 이메일로 테스트 메일을 보내 확인하세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="테스트 이메일 주소"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                  helperText="테스트 메일을 받을 이메일 주소를 입력하세요."
                />
                <Button
                  variant="outline"
                  onClick={handleTestSend}
                  disabled={isPending || !testEmail.trim()}
                  className="w-full"
                >
                  {isPending ? '발송 중...' : '테스트 메일 보내기'}
                </Button>
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

      {/* 미리보기 모달 */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">메일 미리보기</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div
                dangerouslySetInnerHTML={{ __html: previewHtml }}
                className="max-w-2xl mx-auto"
              />
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
