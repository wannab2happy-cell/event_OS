import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';
import { getEmailTemplate } from '@/lib/mail/api';
import { createClient } from '@/lib/supabase/server';
import { TemplateSendClient } from './TemplateSendClient';

type TemplateDetailPageProps = {
  params: Promise<{ eventId?: string; templateId?: string }>;
};

export default async function TemplateDetailPage({ params }: TemplateDetailPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;
  const templateId = resolvedParams?.templateId;

  if (!eventId || !templateId) {
    return notFound();
  }

  const templateResult = await getEmailTemplate(templateId);

  if (templateResult.error || !templateResult.data) {
    return notFound();
  }

  const template = templateResult.data;

  // Verify template belongs to event
  if (template.event_id !== eventId) {
    return notFound();
  }

  // Get event title for preview
  const supabase = await createClient();
  const { data: event } = await supabase
    .from('events')
    .select('id, title')
    .eq('id', eventId)
    .single();

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/events/${eventId}/mail`}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-col space-y-1">
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              {template.name}
            </h1>
            <p className="text-sm text-gray-500">
              마지막 수정: {formatDate(template.updated_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/events/${eventId}/mail`}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            Mail Center로
          </Link>
          <Link
            href={`/admin/events/${eventId}/mail/templates/${templateId}/edit`}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            편집하기 →
          </Link>
        </div>
      </div>

      {/* Send Flow */}
      <TemplateSendClient template={template} eventId={eventId} eventTitle={event?.title} />
    </div>
  );
}

