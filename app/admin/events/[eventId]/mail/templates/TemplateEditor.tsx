/**
 * Template Editor Component (Phase 4)
 * 
 * Split layout editor with real-time preview
 */

'use client';

import { useState, useEffect } from 'react';
import { Save, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import TemplatePreview from './TemplatePreview';
import { renderTemplate } from '@/lib/mail/renderTemplate';
import { validateTemplate, detectMissingVariables } from '@/lib/mail/templateValidation';
import type { EmailTemplate } from '@/lib/mail/types';

interface TemplateEditorProps {
  template: EmailTemplate | null;
  eventId: string;
  onSave: (data: {
    name: string;
    subject: string;
    body_html: string;
    body_text?: string | null;
  }) => Promise<void>;
  onSendTest?: (email: string) => Promise<void>;
}

// Sample variables for preview
const sampleVariables = {
  name: '홍길동',
  company: 'Anders',
  position: 'Manager',
  tableName: 'Table 5',
  event_title: 'Annual Conference 2024',
};

export default function TemplateEditor({
  template,
  eventId,
  onSave,
  onSendTest,
}: TemplateEditorProps) {
  const [name, setName] = useState(template?.name || '');
  const [subject, setSubject] = useState(template?.subject || '');
  const [bodyHtml, setBodyHtml] = useState(template?.body_html || '');
  const [bodyText, setBodyText] = useState(template?.body_text || '');
  const [testEmail, setTestEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [validation, setValidation] = useState<{
    valid: boolean;
    missingVariables: string[];
    warnings: string[];
  } | null>(null);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setSubject(template.subject);
      setBodyHtml(template.body_html);
      setBodyText(template.body_text || '');
    }
  }, [template]);

  // Validate on change
  useEffect(() => {
    if (subject || bodyHtml) {
      const currentTemplate: EmailTemplate = {
        id: template?.id || '',
        event_id: eventId,
        name,
        subject,
        body_html: bodyHtml,
        body_text: bodyText,
        merge_variables: template?.merge_variables || [],
        created_at: template?.created_at || new Date().toISOString(),
        updated_at: template?.updated_at || new Date().toISOString(),
      };
      const result = validateTemplate(currentTemplate, sampleVariables);
      setValidation(result);
    }
  }, [subject, bodyHtml, name, bodyText, template, eventId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        name,
        subject,
        body_html: bodyHtml,
        body_text: bodyText || null,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail || !onSendTest) return;
    setIsSending(true);
    try {
      await onSendTest(testEmail);
      setTestEmail('');
    } finally {
      setIsSending(false);
    }
  };

  const previewResult = renderTemplate(
    {
      subject,
      body_html: bodyHtml,
      body_text: bodyText || null,
    },
    sampleVariables
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
      {/* Left: Editor */}
      <div className="flex flex-col space-y-4 overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle>{template ? 'Edit Template' : 'New Template'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Template Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Welcome Email"
            />

            <Input
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Welcome to {{event_title}}"
            />

            <div>
              <label className="block text-sm font-medium mb-2">HTML Body</label>
              <Textarea
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                rows={12}
                className="font-mono text-xs"
                placeholder="<p>Hello {{name}}, welcome to {{event_title}}!</p>"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Text Body (Optional)</label>
              <Textarea
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                rows={6}
                className="font-mono text-xs"
                placeholder="Hello {{name}}, welcome to {{event_title}}!"
              />
            </div>

            {validation && (
              <div className="space-y-2">
                {validation.missingVariables.length > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-900">Missing Variables</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {validation.missingVariables.map((varName) => (
                        <Badge key={varName} variant="warning">
                          {`{{${varName}}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {validation.warnings.length > 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    {validation.warnings.map((warning, idx) => (
                      <p key={idx} className="text-sm text-blue-700">{warning}</p>
                    ))}
                  </div>
                )}
                {validation.valid && (
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Template is valid</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 pt-4 border-t">
              <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Template'}
              </Button>
              {onSendTest && (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="email"
                    placeholder="test@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="secondary"
                    onClick={handleSendTest}
                    disabled={!testEmail || isSending}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSending ? 'Sending...' : 'Send Test'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: Preview */}
      <div className="flex flex-col overflow-y-auto">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {previewResult.success ? (
              <TemplatePreview
                subject={previewResult.subject || subject}
                html={previewResult.html || bodyHtml}
              />
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{previewResult.error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

