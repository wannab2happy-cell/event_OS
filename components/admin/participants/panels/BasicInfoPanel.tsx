import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Crown, Table, CheckCircle } from 'lucide-react';
import { mapStatusToLabel, mapVipLevelToLabel } from '@/lib/types';

interface BasicInfoPanelProps {
  data: {
    id: string;
    eventId: string;
    name: string;
    email: string;
    company?: string | null;
    position?: string | null;
    phone?: string | null;
    mobile_phone?: string | null;
    country?: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    vip_level?: number | null;
    guest_of?: string | null;
    guest_of_name?: string | null;
    tableName?: string | null;
    isCheckedIn?: boolean | null;
  };
}

export default function BasicInfoPanel({ data }: BasicInfoPanelProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl">Basic Info</CardTitle>
        <CardDescription>참가자 기본 정보</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 이름 및 이메일 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">이름</label>
              <p className="text-base font-medium text-gray-900">{data.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">이메일</label>
              <p className="text-base text-gray-900">{data.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">상태</label>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  data.status === 'checked_in'
                    ? 'bg-green-100 text-green-700'
                    : data.status === 'completed'
                      ? 'bg-blue-100 text-blue-700'
                      : data.status === 'registered'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                }`}
              >
                {mapStatusToLabel(data.status)}
              </span>
            </div>
          </div>

          {/* 회사 및 연락처 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">회사</label>
              <p className="text-base text-gray-900">{data.company || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">직책</label>
              <p className="text-base text-gray-900">{data.position || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">전화번호</label>
              <p className="text-base text-gray-900">{data.phone || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">휴대전화</label>
              <p className="text-base text-gray-900">{data.mobile_phone || 'Not provided'}</p>
            </div>
            {data.country && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">국가</label>
                <p className="text-base text-gray-900">{data.country}</p>
              </div>
            )}
          </div>
        </div>

        {/* 테이블 및 체크인 정보 */}
        <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.tableName && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">테이블</label>
              <div className="flex items-center gap-2">
                <Table className="h-4 w-4 text-gray-600" />
                <p className="text-base font-medium text-gray-900">{data.tableName}</p>
              </div>
            </div>
          )}
          {!data.tableName && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">테이블</label>
              <p className="text-base text-gray-500">Unassigned</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">체크인 상태</label>
            {data.isCheckedIn ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                체크인 완료
              </span>
            ) : (
              <span className="text-sm text-gray-500">미완료</span>
            )}
          </div>
        </div>

        {/* VIP 정보 */}
        {(data.vip_level || 0) > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-600" />
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">VIP Level</label>
                <p className="text-base font-medium text-amber-600">{mapVipLevelToLabel(data.vip_level)}</p>
              </div>
            </div>
            {data.guest_of_name && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Guest of</label>
                <p className="text-base text-gray-900">{data.guest_of_name}</p>
              </div>
            )}
          </div>
        )}

        {/* 날짜 정보 */}
        <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">생성일</label>
            <p className="text-sm text-gray-900">{formatDate(data.created_at)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">최종 업데이트</label>
            <p className="text-sm text-gray-900">{formatDate(data.updated_at)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

