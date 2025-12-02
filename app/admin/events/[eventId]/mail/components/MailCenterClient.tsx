'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TemplateList } from './TemplateList';
import { MailPreviewModal } from './MailPreviewModal';
import { deleteTemplate } from '@/actions/mail/deleteTemplate';
import type { EmailTemplate } from '@/lib/mail/types';

interface MailCenterClientProps {
  templates: EmailTemplate[];
  eventId: string;
}

export function MailCenterClient({ templates, eventId }: MailCenterClientProps) {
  const router = useRouter();
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('이 템플릿을 삭제하시겠습니까?')) {
      return;
    }

    const result = await deleteTemplate(id);
    if (result.error) {
      alert(result.error);
    } else {
      router.refresh();
    }
  };

  const handlePreview = (template: EmailTemplate) => {
    setPreviewTemplate(template);
  };

  return (
    <>
      <TemplateList
        templates={templates}
        eventId={eventId}
        onDelete={handleDelete}
        onPreview={handlePreview}
      />
      {previewTemplate && (
        <MailPreviewModal
          open={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          template={previewTemplate}
        />
      )}
    </>
  );
}

