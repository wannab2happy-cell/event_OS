/**
 * Send Email Client Component
 * 
 * Handles template selection and segmentation
 */

'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import SegmentationPanel from './SegmentationPanel';
import TemplatePreview from '../../templates/TemplatePreview';
import { renderTemplate } from '@/lib/mail/renderTemplate';
import type { EmailTemplate } from '@/lib/mail/types';
import type { SegmentationFilters } from '@/lib/mail/segmentationFilters';

interface SendEmailClientProps {
  eventId: string;
  templates: EmailTemplate[];
  companies: string[];
}

export default function SendEmailClient({ eventId, templates, companies }: SendEmailClientProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(
    templates[0] || null
  );
  const [filters, setFilters] = useState<SegmentationFilters>({});
  const [participantIds, setParticipantIds] = useState<string[]>([]);

  const sampleVariables = {
    name: '홍길동',
    company: 'Anders',
    position: 'Manager',
    tableName: 'Table 5',
    event_title: 'Annual Conference 2024',
  };

  const previewResult = selectedTemplate
    ? renderTemplate(
        {
          subject: selectedTemplate.subject,
          body_html: selectedTemplate.body_html,
          body_text: selectedTemplate.body_text || null,
        },
        sampleVariables
      )
    : null;

  const handleSend = async () => {
    if (!selectedTemplate || participantIds.length === 0) {
      alert('Please select a template and target participants');
      return;
    }
    // TODO: Implement send logic
    console.log('Sending to:', participantIds);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Template Selection & Segmentation */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Template</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedTemplate?.id || ''}
                onChange={(e) => {
                  const template = templates.find((t) => t.id === e.target.value);
                  setSelectedTemplate(template || null);
                }}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select a template...</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          <SegmentationPanel
            eventId={eventId}
            companies={companies}
            filters={filters}
            onFiltersChange={setFilters}
            onParticipantIdsChange={setParticipantIds}
          />
        </div>

        {/* Right: Preview */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {previewResult && previewResult.success ? (
                <TemplatePreview
                  subject={previewResult.subject || selectedTemplate!.subject}
                  html={previewResult.html || selectedTemplate!.body_html}
                />
              ) : (
                <p className="text-sm text-muted-foreground">Select a template to preview</p>
              )}
            </CardContent>
          </Card>

          <div className="mt-6">
            <Button
              onClick={handleSend}
              disabled={!selectedTemplate || participantIds.length === 0}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Send to {participantIds.length} participants
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

