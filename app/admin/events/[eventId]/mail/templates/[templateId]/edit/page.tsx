import { notFound } from 'next/navigation';
import { FileText } from 'lucide-react';
import { getEmailTemplate } from '@/lib/mail/api';
import { TemplateEditorClient } from '../TemplateEditorClient';
import { updateTemplate } from '@/actions/mail/updateTemplate';

type EditTemplatePageProps = {
  params: Promise<{ eventId?: string; templateId?: string }>;
};

export default async function EditTemplatePage({ params }: EditTemplatePageProps) {
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Edit Email Template
        </h1>
        <p className="text-sm text-gray-500">
          템플릿을 수정합니다. 변경사항을 저장하면 즉시 반영됩니다.
        </p>
      </div>

      <TemplateEditorClient
        template={template}
        eventId={eventId}
        onSubmit={async (data) => {
          'use server';
          return await updateTemplate(templateId, data);
        }}
      />
    </div>
  );
}

