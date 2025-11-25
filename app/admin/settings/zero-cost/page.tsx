import React from 'react';

export default function ZeroCostGuidePage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Zero-Cost Operation Mode</h1>
      <p className="text-gray-500 mb-8">무료 티어 한도 내에서 안전하게 운영하기 위한 가이드입니다.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-blue-600 mb-4">Supabase Free Tier</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex justify-between">
              <span>Database Size</span>
              <span className="font-mono">Max 500MB</span>
            </li>
            <li className="flex justify-between">
              <span>File Storage</span>
              <span className="font-mono">Max 1GB</span>
            </li>
            <li className="flex justify-between">
              <span>Monthly Active Users</span>
              <span className="font-mono">50,000 MAU</span>
            </li>
          </ul>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-green-600 mb-4">Resend Free Tier</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex justify-between">
              <span>Emails per Month</span>
              <span className="font-mono">3,000 emails</span>
            </li>
            <li className="flex justify-between">
              <span>Daily Limit</span>
              <span className="font-mono">100 emails</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-yellow-800 mb-2">⚠️ 운영 주의사항</h3>
        <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
          <li>이미지 업로드 시 <strong>300KB 이하</strong>의 파일만 허용하세요. (동영상 업로드 금지)</li>
          <li>KV 이미지는 행사당 1개만 유지하는 것을 권장합니다.</li>
          <li>로그 데이터(Mail logs, Access logs)는 주기적으로 백업 후 삭제하세요.</li>
          <li>참가자 300명 기준, 1인당 평균 10통의 메일 발송 시 월간 한도에 도달할 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
}

