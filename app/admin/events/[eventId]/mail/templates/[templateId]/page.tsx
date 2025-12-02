import { notFound } from 'next/navigation';
import { FileText } from 'lucide-react';
import { getEmailTemplate } from '@/lib/mail/api';
import { TemplateForm } from '../../components/TemplateForm';
import { MailPreviewModal } from '../../components/MailPreviewModal';
import { TemplateEditorClient } from './TemplateEditorClient';
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-sky-600" />
          Edit Email Template
        </h1>
        <p className="text-sm text-gray-600 mt-1">
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

