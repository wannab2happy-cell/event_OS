import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

interface TravelInfoPanelProps {
  data: {
    departure_airport?: string | null;
    arrival_airport?: string | null;
    departure_date?: string | null;
    return_date?: string | null;
    arrival_date?: string | null; // 추가: 도착일 필드
    departure_time?: string | null;
    arrival_time?: string | null;
    flight_number_go?: string | null;
    flight_number_return?: string | null;
    passport_name?: string | null;
    passport_number?: string | null;
    passport_expiry?: string | null;
    special_request?: string | null;
    is_travel_confirmed?: boolean | null;
  };
}

export default function TravelInfoPanel({ data }: TravelInfoPanelProps) {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const hasAnyData =
    data.departure_airport ||
    data.arrival_airport ||
    data.departure_date ||
    data.arrival_time ||
    data.flight_number_go ||
    data.passport_number;

  if (!hasAnyData) {
    return (
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl">Travel Info</CardTitle>
          <CardDescription>항공 정보</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No travel information provided.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl">Travel Info</CardTitle>
        <CardDescription>항공 정보</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 출발 정보 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Departure</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">출발 공항</label>
                <p className="text-base text-gray-900">{data.departure_airport || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">출발일</label>
                <p className="text-base text-gray-900">{formatDate(data.departure_date)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">출발 시간</label>
                <p className="text-base text-gray-900">{data.departure_time || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">출발 항공편</label>
                <p className="text-base text-gray-900">{data.flight_number_return || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* 도착 정보 */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Arrival</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">도착 공항</label>
                <p className="text-base text-gray-900">{data.arrival_airport || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">도착일</label>
                <p className="text-base text-gray-900">{formatDate(data.arrival_date || data.departure_date)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">도착 시간</label>
                <p className="text-base text-gray-900">{data.arrival_time || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">도착 항공편</label>
                <p className="text-base text-gray-900">{data.flight_number_go || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* 여권 정보 */}
          {(data.passport_number || data.passport_name || data.passport_expiry) && (
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Passport</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">여권 이름</label>
                  <p className="text-base text-gray-900">{data.passport_name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">여권 번호</label>
                  <p className="text-base text-gray-900">{data.passport_number || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">만료일</label>
                  <p className="text-base text-gray-900">{formatDate(data.passport_expiry)}</p>
                </div>
              </div>
            </div>
          )}

          {/* 특이사항 */}
          {data.special_request && (
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-500 mb-2">특이사항 / 요청사항</label>
              <p className="text-base text-gray-900 whitespace-pre-wrap">{data.special_request}</p>
            </div>
          )}

          {/* Travel Note */}
          {(data as any).travelNote && (
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-500 mb-2">Travel Note</label>
              <p className="text-base text-gray-900 whitespace-pre-wrap">{(data as any).travelNote}</p>
            </div>
          )}

          {/* 확정 상태 */}
          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-500 mb-2">확정 상태</label>
            {data.is_travel_confirmed ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                확정됨
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
                미확정
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

