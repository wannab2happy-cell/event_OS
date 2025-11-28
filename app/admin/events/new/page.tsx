export const dynamic = 'force-dynamic';

import { assertAdminAuth } from '@/lib/auth';
import EventCreateForm from '@/components/admin/EventCreateForm';

export default async function NewEventPage() {
  await assertAdminAuth();

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">새 이벤트 생성</h1>
        <p className="text-sm text-gray-500 mt-1">
          새로운 이벤트를 생성하고 기본 설정을 구성하세요.
        </p>
      </div>

      {/* 이벤트 생성 폼 */}
      <EventCreateForm />
    </div>
  );
}

