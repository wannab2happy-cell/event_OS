'use client';

import { useState } from 'react';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TemplateForm } from '../../components/TemplateForm';
import { MailPreviewModal } from '../../components/MailPreviewModal';
import type { EmailTemplate, UpdateEmailTemplateInput } from '@/lib/mail/types';

interface TemplateEditorClientProps {
  template: EmailTemplate;
  eventId: string;
  onSubmit: (data: UpdateEmailTemplateInput) => Promise<{ error?: string }>;
}

export function TemplateEditorClient({ template, eventId, onSubmit }: TemplateEditorClientProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  const handlePreview = () => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button variant="secondary" onClick={handlePreview}>
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
      </div>

      <TemplateForm eventId={eventId} initialData={template} onSubmit={onSubmit} />

      {previewTemplate && (
        <MailPreviewModal
          open={showPreview}
          onClose={() => {
            setShowPreview(false);
            setPreviewTemplate(null);
          }}
          template={previewTemplate}
        />
      )}
    </>
  );
}

