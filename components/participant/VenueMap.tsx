'use client';

interface VenueMapProps {
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string | null;
}

export default function VenueMap({ address, latitude, longitude, locationName }: VenueMapProps) {
  // Google Maps Static API를 사용한 지도 표시
  // API Key는 환경변수에서 가져옴 (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  // 좌표가 있으면 좌표 사용, 없으면 주소 사용
  const hasCoordinates = latitude && longitude;
  const hasAddress = address && address.trim().length > 0;

  if (!apiKey) {
    // API Key가 없으면 placeholder 표시
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-100 h-64 md:h-80 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-4xl mb-2">📍</div>
          <p className="text-sm text-gray-400">지도가 곧 표시됩니다</p>
        </div>
      </div>
    );
  }

  // Google Maps Static API URL 생성
  const getMapUrl = () => {
    if (hasCoordinates) {
      // 좌표 기반
      return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=600x400&markers=color:red%7C${latitude},${longitude}&key=${apiKey}`;
    } else if (hasAddress) {
      // 주소 기반
      const encodedAddress = encodeURIComponent(address);
      return `https://maps.googleapis.com/maps/api/staticmap?center=${encodedAddress}&zoom=15&size=600x400&markers=color:red%7C${encodedAddress}&key=${apiKey}`;
    }
    return null;
  };

  const mapUrl = getMapUrl();
  const googleMapsLink = hasCoordinates
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : hasAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address!)}`
    : null;

  if (!mapUrl) {
    // 지도 데이터가 없으면 placeholder
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-100 h-64 md:h-80 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-4xl mb-2">📍</div>
          <p className="text-sm text-gray-400">지도 정보가 곧 업데이트됩니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 h-64 md:h-80 overflow-hidden relative">
      <img
        src={mapUrl}
        alt={locationName || 'Venue location'}
        className="w-full h-full object-cover"
      />
      {googleMapsLink && (
        <a
          href={googleMapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 right-4 px-4 py-2 bg-white rounded-lg shadow-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Google Maps에서 보기 →
        </a>
      )}
    </div>
  );
}

