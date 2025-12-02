import { notFound } from 'next/navigation';
import { FileText } from 'lucide-react';
import { TemplateForm } from '../../components/TemplateForm';
import { createTemplate } from '@/actions/mail/createTemplate';
import type { CreateEmailTemplateInput } from '@/lib/mail/types';

type NewTemplatePageProps = {
  params: Promise<{ eventId?: string }>;
};

export default async function NewTemplatePage({ params }: NewTemplatePageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-sky-600" />
          New Email Template
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          새로운 메일 템플릿을 생성합니다. {'{{변수명}}'} 형식으로 변수를 사용할 수 있습니다.
        </p>
      </div>

      <TemplateForm
        eventId={eventId}
        onSubmit={async (data) => {
          'use server';
          return await createTemplate(data as CreateEmailTemplateInput);
        }}
      />
    </div>
  );
}

