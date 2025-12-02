'use client';

import { Dialog } from '@/components/ui/Dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { applyMergeVariablesToTemplate } from '@/lib/mail/parser';
import type { EmailTemplate } from '@/lib/mail/types';

interface MailPreviewModalProps {
  open: boolean;
  onClose: () => void;
  template: EmailTemplate;
  sampleVariables?: Record<string, string>;
}

export function MailPreviewModal({
  open,
  onClose,
  template,
  sampleVariables = {},
}: MailPreviewModalProps) {
  // Generate sample variables if not provided
  const defaultVariables: Record<string, string> = {
    name: '홍길동',
    tableName: 'T3',
    company: 'ANDERS',
    eventName: 'Event 2024',
    ...sampleVariables,
  };

  // Fill missing variables with template's merge_variables
  const variables: Record<string, string> = { ...defaultVariables };
  template.merge_variables.forEach((varName) => {
    if (!variables[varName]) {
      variables[varName] = `[${varName}]`;
    }
  });

  const { html, text } = applyMergeVariablesToTemplate(
    template.body_html,
    template.body_text,
    variables
  );

  const processedSubject = template.subject.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    return variables[varName] || match;
  });

  return (
    <Dialog open={open} onClose={onClose} title="Email Preview" className="max-w-4xl">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-900">{processedSubject}</p>
          </div>
        </div>

        <Tabs defaultValue="html">
          <TabsList>
            <TabsTrigger value="html">HTML Preview</TabsTrigger>
            <TabsTrigger value="text">Text Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="html">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div
                className="p-6 bg-white min-h-[400px]"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </TabsContent>
          <TabsContent value="text">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <pre className="p-6 bg-white min-h-[400px] whitespace-pre-wrap text-sm text-gray-900 font-mono">
                {text || '(Text version not available)'}
              </pre>
            </div>
          </TabsContent>
        </Tabs>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>사용된 변수:</strong>{' '}
            {template.merge_variables.length > 0
              ? template.merge_variables.map((v) => `{{${v}}}`).join(', ')
              : '없음'}
          </p>
        </div>
      </div>
    </Dialog>
  );
}

