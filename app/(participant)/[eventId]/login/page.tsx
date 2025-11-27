'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Mail, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

export default function ParticipantLoginPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!email) {
      setError('이메일을 입력해주세요.');
      setLoading(false);
      return;
    }

    // Magic Link 발송
    const redirectTo = `${window.location.origin}/${eventId}/register`;
    const { error: magicLinkError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (magicLinkError) {
      setError(magicLinkError.message || 'Magic Link 발송에 실패했습니다.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-8 sm:py-12">
      <Card className="w-full max-w-md shadow-lg border border-gray-200">
        <CardHeader className="text-center space-y-6 px-6 pt-8 pb-6">
          {/* 아이콘: 미니멀리즘, 충분한 여백 */}
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
          </div>
          {/* 제목: 명확한 타이포그래피 */}
          <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            참가자 로그인
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-sm mx-auto">
            이벤트에 초대받은 이메일 주소를 입력하세요.
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            Magic Link를 이메일로 발송해드립니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-8">
          {success ? (
            <div className="space-y-6 text-center">
              {/* 성공 상태: 시스템 상태 가시성 (닐슨 원칙) */}
              <div
                className="p-5 bg-green-50 border-2 border-green-200 rounded-xl"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                <div className="flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-base sm:text-lg font-semibold text-green-900 mb-2">
                  Magic Link가 발송되었습니다!
                </p>
                <p className="text-sm text-green-700 leading-relaxed">
                  이메일 수신함을 확인하시고 링크를 클릭하여 로그인하세요.
                </p>
                <p className="text-xs text-green-600 mt-3">
                  스팸 폴더도 확인해주세요.
                </p>
              </div>
              <Button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                variant="secondary"
                className="w-full min-h-[44px] text-base"
                aria-label="다른 이메일로 다시 시도"
              >
                다른 이메일로 시도
              </Button>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-5" noValidate>
              {/* 이메일 입력: 오류 방지 (닐슨 원칙) */}
              <Input
                label="이메일 주소"
                type="email"
                placeholder="participant@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null); // 실시간 오류 제거
                }}
                required
                disabled={loading}
                aria-required="true"
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'email-error' : undefined}
              />
              {/* 오류 메시지: 명확한 피드백 */}
              {error && (
                <div
                  id="email-error"
                  className="p-4 bg-red-50 border-2 border-red-200 rounded-xl"
                  role="alert"
                  aria-live="assertive"
                >
                  <p className="text-sm font-medium text-red-900">{error}</p>
                </div>
              )}
              {/* 제출 버튼: 터치 타겟 최소 44px, 로딩 상태 표시 */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full min-h-[44px] bg-blue-600 hover:bg-blue-700 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                aria-busy={loading}
                aria-label={loading ? 'Magic Link 발송 중' : 'Magic Link 발송'}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    발송 중...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Magic Link 발송
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              이벤트에 초대받지 않으셨나요?
              <br />
              이벤트 주최측에 문의해주세요.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

