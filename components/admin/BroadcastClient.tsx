'use client';

import { useState, useTransition } from 'react';
import { Megaphone, Send, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { sendPushAction } from '@/actions/push/sendPush';
import toast from 'react-hot-toast';

interface BroadcastClientProps {
  eventId: string;
  subscriptionCount: number;
}

export default function BroadcastClient({ eventId, subscriptionCount }: BroadcastClientProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSend = () => {
    if (!title.trim()) {
      toast.error('제목을 입력해주세요.');
      return;
    }

    if (!body.trim()) {
      toast.error('본문을 입력해주세요.');
      return;
    }

    if (subscriptionCount === 0) {
      toast.error('구독 중인 참가자가 없습니다.');
      return;
    }

    if (!confirm(`모든 구독자(${subscriptionCount}명)에게 Push 알림을 발송하시겠습니까?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await sendPushAction({
          eventId,
          title: title.trim(),
          body: body.trim(),
        });

        if (result.success) {
          if (result.sent > 0) {
            toast.success(result.message || `Push 알림이 ${result.sent}명에게 발송되었습니다.`);
            // 폼 초기화
            setTitle('');
            setBody('');
          } else {
            toast.warning(result.message || '발송된 알림이 없습니다.');
          }
        } else {
          toast.error(result.message || 'Push 알림 발송 중 오류가 발생했습니다.');
        }
      } catch (error: any) {
        console.error('Send push error:', error);
        toast.error(error?.message || 'Push 알림 발송 중 오류가 발생했습니다.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 구독자 정보 */}
      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">구독자 수</p>
                <p className="text-2xl font-semibold text-gray-900">{subscriptionCount}명</p>
              </div>
            </div>
            {subscriptionCount === 0 && (
              <p className="text-xs text-amber-600">
                참가자가 QR Pass 페이지에 접속하면 자동으로 구독됩니다.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 메시지 작성 */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-blue-600" />
            Push 알림 작성
          </CardTitle>
          <CardDescription>
            모든 구독자에게 발송될 Push 알림 메시지를 작성하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="제목 *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 행사 안내"
            maxLength={100}
            disabled={isPending}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              본문 *
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="flex min-h-[120px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="예: 행사가 곧 시작됩니다. 현장에 도착해주세요."
              maxLength={500}
              disabled={isPending}
            />
            <p className="text-xs text-gray-500 mt-1">{body.length}/500</p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleSend}
              disabled={isPending || !title.trim() || !body.trim() || subscriptionCount === 0}
            >
              {isPending ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  발송 중...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Push 알림 발송하기 ({subscriptionCount}명)
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              * Push 알림은 구독 중인 참가자에게만 발송됩니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 안내 사항 */}
      <Card className="border border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Push 알림 안내</h3>
          <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
            <li>참가자가 QR Pass 페이지에 접속하면 자동으로 Push 알림을 구독합니다.</li>
            <li>브라우저에서 알림 권한을 허용한 참가자만 알림을 받을 수 있습니다.</li>
            <li>모바일 및 데스크탑 브라우저에서 지원됩니다.</li>
            <li>VAPID 키가 설정되어 있어야 Push 알림이 정상 작동합니다.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

