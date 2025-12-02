'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { extractMergeVariables, applyMergeVariablesToTemplate } from '@/lib/mail/parser';
import type { EmailTemplate, CreateEmailTemplateInput, UpdateEmailTemplateInput } from '@/lib/mail/types';

interface TemplateFormProps {
  eventId: string;
  initialData?: EmailTemplate;
  onSubmit: (data: CreateEmailTemplateInput | UpdateEmailTemplateInput) => Promise<{ error?: string; data?: EmailTemplate }>;
  isSubmitting?: boolean;
}

export function TemplateForm({ eventId, initialData, onSubmit, isSubmitting = false }: TemplateFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name || '');
  const [subject, setSubject] = useState(initialData?.subject || '');
  const [bodyHtml, setBodyHtml] = useState(initialData?.body_html || '');
  const [bodyText, setBodyText] = useState(initialData?.body_text || '');
  const [mergeVariables, setMergeVariables] = useState<string[]>(initialData?.merge_variables || []);
  const [activeTab, setActiveTab] = useState('html');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-extract merge variables when HTML or Text changes
  const handleExtractVariables = () => {
    const htmlVars = extractMergeVariables(bodyHtml);
    const textVars = extractMergeVariables(bodyText);
    const allVars = Array.from(new Set([...htmlVars, ...textVars]));
    setMergeVariables(allVars);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!name.trim()) {
      setErrors({ name: '템플릿 이름을 입력해주세요.' });
      return;
    }
    if (!subject.trim()) {
      setErrors({ subject: '메일 제목을 입력해주세요.' });
      return;
    }
    if (!bodyHtml.trim()) {
      setErrors({ bodyHtml: 'HTML 본문을 입력해주세요.' });
      return;
    }

    const data = {
      event_id: eventId,
      name: name.trim(),
      subject: subject.trim(),
      body_html: bodyHtml.trim(),
      body_text: bodyText.trim() || null,
      merge_variables: mergeVariables,
    };

    const result = await onSubmit(data);

    if (result.error) {
      setErrors({ submit: result.error });
    } else {
      router.push(`/admin/events/${eventId}/mail`);
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Template Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />
        <Input
          label="Email Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          error={errors.subject}
          required
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Merge Variables</label>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleExtractVariables}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            자동 추출
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[60px]">
          {mergeVariables.length === 0 ? (
            <p className="text-sm text-gray-400">변수가 없습니다. 본문에 {'{{변수명}}'} 형식으로 변수를 추가하세요.</p>
          ) : (
            mergeVariables.map((varName) => (
              <span
                key={varName}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700"
              >
                {'{{' + varName + '}}'}
              </span>
            ))
          )}
        </div>
      </div>

      <Tabs defaultValue="html">
        <TabsList>
          <TabsTrigger value="html">HTML</TabsTrigger>
          <TabsTrigger value="text">Text</TabsTrigger>
        </TabsList>
        <TabsContent value="html">
          <Textarea
            label="HTML Body"
            value={bodyHtml}
            onChange={(e) => setBodyHtml(e.target.value)}
            error={errors.bodyHtml}
            rows={15}
            className="font-mono text-xs"
            placeholder="<p>Hello {{name}}, your table is {{tableName}}</p>"
          />
        </TabsContent>
        <TabsContent value="text">
          <Textarea
            label="Text Body (Optional)"
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            rows={15}
            className="font-mono text-xs"
            placeholder="Hello {{name}}, your table is {{tableName}}"
          />
        </TabsContent>
      </Tabs>

      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </form>
  );
}

