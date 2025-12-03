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
    <div className="space-y-8">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-sky-600" />
          New Email Template
        </h1>
        <p className="text-sm text-gray-500">
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

