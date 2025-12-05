/**
 * Templates Client Component (Phase 4)
 * 
 * Manages template list and editor state
 */

'use client';

import { useState } from 'react';
import TemplateList from './TemplateList';
import TemplateEditor from './TemplateEditor';
import { updateTemplate } from '@/actions/mail/updateTemplate';
import { createTemplate } from '@/actions/mail/createTemplate';
import type { EmailTemplate } from '@/lib/mail/types';

interface TemplatesClientProps {
  eventId: string;
  initialTemplates: EmailTemplate[];
}

export default function TemplatesClient({ eventId, initialTemplates }: TemplatesClientProps) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  const handleTemplateClick = (template: EmailTemplate) => {
    setSelectedTemplate(template);
  };

  const handleSave = async (data: {
    name: string;
    subject: string;
    body_html: string;
    body_text?: string | null;
  }) => {
    if (selectedTemplate) {
      // Update existing template
      const result = await updateTemplate(selectedTemplate.id, data);
      if (!result.error && result.data) {
        setTemplates(templates.map((t) => (t.id === selectedTemplate.id ? result.data! : t)));
        setSelectedTemplate(result.data);
      }
    } else {
      // Create new template
      const result = await createTemplate({
        event_id: eventId,
        ...data,
        merge_variables: [],
      });
      if (!result.error && result.data) {
        setTemplates([...templates, result.data]);
        setSelectedTemplate(result.data);
      }
    }
  };

  const handleSendTest = async (email: string) => {
    // TODO: Implement send test email
    console.log('Sending test email to:', email);
    alert('Test email functionality will be implemented');
  };

  if (selectedTemplate) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedTemplate(null)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Templates
        </button>
        <TemplateEditor
          template={selectedTemplate}
          eventId={eventId}
          onSave={handleSave}
          onSendTest={handleSendTest}
        />
      </div>
    );
  }

  return <TemplateList templates={templates} eventId={eventId} onTemplateClick={handleTemplateClick} />;
}

