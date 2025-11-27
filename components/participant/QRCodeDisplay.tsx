'use client';

import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
}

/**
 * 고대비 QR 코드 디스플레이 컴포넌트
 * UX/UI 가이드라인 준수:
 * - 고대비 (검정/흰색)
 * - 최소 200px 크기
 * - 충분한 여백 (20px)
 * - 높은 오류 복구 레벨 (30% 손상 복구)
 */
export default function QRCodeDisplay({ value }: QRCodeDisplayProps) {
  return (
    <div className="flex items-center justify-center p-5 bg-white rounded-2xl shadow-lg border-2 border-gray-100">
      <div className="w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] flex items-center justify-center bg-white p-5 rounded-xl">
        <QRCodeSVG
          value={value}
          size={240}
          level="H" // 높은 오류 복구 레벨 (30% 손상 복구 가능)
          bgColor="#FFFFFF"
          fgColor="#000000"
          includeMargin={true}
          marginSize={2}
          className="w-full h-full"
          aria-label="체크인용 QR 코드"
        />
      </div>
    </div>
  );
}

