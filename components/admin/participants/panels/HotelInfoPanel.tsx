import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

interface HotelInfoPanelProps {
  data: {
    hotel_name?: string | null;
    room_type?: string | null;
    check_in_date?: string | null;
    check_out_date?: string | null;
    nights?: number | null;
    confirmation_number?: string | null;
    roommate_name?: string | null;
    smoking_preference?: string | null;
    is_hotel_confirmed?: boolean | null;
  };
}

export default function HotelInfoPanel({ data }: HotelInfoPanelProps) {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const hasAnyData =
    data.hotel_name ||
    data.room_type ||
    data.check_in_date ||
    data.check_out_date ||
    data.confirmation_number;

  if (!hasAnyData) {
    return (
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl">Hotel Info</CardTitle>
          <CardDescription>호텔 정보</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No hotel information provided.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl">Hotel Info</CardTitle>
        <CardDescription>호텔 정보</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">호텔 이름</label>
              <p className="text-base text-gray-900">{data.hotel_name || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">객실 타입</label>
              <p className="text-base text-gray-900">
                {data.room_type === 'single' ? '싱글' : data.room_type === 'twin' ? '트윈' : data.room_type || 'Not provided'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">체크인 날짜</label>
              <p className="text-base text-gray-900">{formatDate(data.check_in_date)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">체크아웃 날짜</label>
              <p className="text-base text-gray-900">{formatDate(data.check_out_date)}</p>
            </div>
            {data.nights && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">박수</label>
                <p className="text-base text-gray-900">{data.nights}박</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">확인 번호</label>
              <p className="text-base text-gray-900">{data.confirmation_number || 'Not provided'}</p>
            </div>
          </div>

          {data.roommate_name && (
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-500 mb-1">룸메이트</label>
              <p className="text-base text-gray-900">{data.roommate_name}</p>
            </div>
          )}

          {data.smoking_preference && (
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-500 mb-1">흡연 선호도</label>
              <p className="text-base text-gray-900">{data.smoking_preference}</p>
            </div>
          )}

          {/* Hotel Note */}
          {(data as any).hotelNote && (
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-500 mb-2">Hotel Note</label>
              <p className="text-base text-gray-900 whitespace-pre-wrap">{(data as any).hotelNote}</p>
            </div>
          )}

          {/* 확정 상태 */}
          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-500 mb-2">확정 상태</label>
            {data.is_hotel_confirmed ? (
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

