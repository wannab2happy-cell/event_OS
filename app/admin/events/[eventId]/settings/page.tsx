import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminPage } from '@/components/admin/layout/AdminPage';
import { SectionCard } from '@/components/ui/section-card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

type SettingsPageProps = {
  params: Promise<{ eventId?: string }>;
};

export default async function SettingsPage({ params }: SettingsPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  const supabase = await createClient();

  // Load event
  const { data: event, error } = await supabase
    .from('events')
    .select('id, title, code, start_date, end_date, venue, description')
    .eq('id', eventId)
    .single();

  if (error || !event) {
    return notFound();
  }

  // Load branding
  const { data: branding } = await supabase
    .from('event_branding')
    .select('*')
    .eq('event_id', eventId)
    .single();

  return (
    <AdminPage title="Settings" subtitle="이벤트 설정을 관리합니다">
      {/* Event Basic Info */}
      <SectionCard title="이벤트 기본 정보">
        <div className="space-y-4">
          <div>
            <Label>이벤트 제목</Label>
            <Input value={event.title || ''} disabled className="mt-1" />
          </div>
          <div>
            <Label>이벤트 코드</Label>
            <Input value={event.code || ''} disabled className="mt-1" />
          </div>
          {event.start_date && (
            <div>
              <Label>시작일</Label>
              <Input
                value={new Date(event.start_date).toLocaleDateString('ko-KR')}
                disabled
                className="mt-1"
              />
            </div>
          )}
          {event.end_date && (
            <div>
              <Label>종료일</Label>
              <Input
                value={new Date(event.end_date).toLocaleDateString('ko-KR')}
                disabled
                className="mt-1"
              />
            </div>
          )}
          {event.venue && (
            <div>
              <Label>장소</Label>
              <Input value={event.venue} disabled className="mt-1" />
            </div>
          )}
        </div>
      </SectionCard>

      {/* Branding */}
      {branding && (
        <SectionCard title="브랜딩">
          <div className="space-y-4">
            {branding.primary_color && (
              <div>
                <Label>Primary Color</Label>
                <div className="flex items-center gap-3 mt-1">
                  <div
                    className="w-12 h-12 rounded border border-gray-200"
                    style={{ backgroundColor: branding.primary_color }}
                  />
                  <Input value={branding.primary_color} disabled className="flex-1" />
                </div>
              </div>
            )}
            {branding.logo_url && (
              <div>
                <Label>Logo</Label>
                <div className="mt-1">
                  <img
                    src={branding.logo_url}
                    alt="Event Logo"
                    className="h-16 object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      )}
    </AdminPage>
  );
}

