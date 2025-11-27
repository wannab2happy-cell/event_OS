'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Mail, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">참가자 로그인</CardTitle>
          <CardDescription className="text-base">
            이벤트에 초대받은 이메일 주소를 입력하세요.
            <br />
            Magic Link를 이메일로 발송해드립니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">
                  ✅ Magic Link가 발송되었습니다!
                </p>
                <p className="text-sm text-green-700 mt-2">
                  이메일 수신함을 확인하시고 링크를 클릭하여 로그인하세요.
                </p>
                <p className="text-xs text-green-600 mt-2">
                  스팸 폴더도 확인해주세요.
                </p>
              </div>
              <Button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                variant="secondary"
                className="w-full"
              >
                다른 이메일로 시도
              </Button>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <Input
                label="이메일 주소"
                type="email"
                placeholder="participant@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  'Magic Link 발송 중...'
                ) : (
                  <>
                    Magic Link 발송
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
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

