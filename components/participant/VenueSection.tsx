import VenueMap from './VenueMap';

interface VenueSectionProps {
  event: {
    location_name?: string | null;
    location_detail?: string | null;
    venue_address?: string | null;
    venue_latitude?: number | null;
    venue_longitude?: number | null;
  };
}

export default function VenueSection({ event }: VenueSectionProps) {
  const venueName = event.location_name || 'Venue TBA';
  const venueDetail = event.location_detail || '';
  const venueAddress = event.venue_address || venueDetail || '';

  // location_detail에서 주소 정보 추출 시도 (간단한 파싱)
  const extractAddress = (detail: string): string => {
    // venue_address가 우선, 없으면 location_detail 사용
    return detail || '장소 상세 정보가 곧 업데이트됩니다.';
  };

  return (
    <section id="venue" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* 왼쪽: 장소 정보 */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Venue
              </h2>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-6">
                행사 장소 정보 및 교통편 안내입니다.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {venueName}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {extractAddress(venueDetail)}
                </p>
              </div>

              {/* 향후 확장: 교통편 안내, 주차 정보 등 */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  * 상세 교통편 안내는 참가자 등록 완료 후 별도로 안내드립니다.
                </p>
              </div>
            </div>
          </div>

          {/* 오른쪽: 지도 */}
          <VenueMap
            address={venueAddress}
            latitude={event.venue_latitude}
            longitude={event.venue_longitude}
            locationName={venueName}
          />
        </div>
      </div>
    </section>
  );
}

