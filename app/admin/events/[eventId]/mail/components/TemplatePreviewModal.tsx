'use client';

import { useEffect, useState } from 'react';
import { renderPreview } from '@/actions/mail/renderPreview';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/useToast';

export default function TemplatePreviewModal({
  open,
  onClose,
  template,
  sampleVariables,
}: {
  open: boolean;
  onClose: () => void;
  template: { subject: string; bodyHtml: string };
  sampleVariables: Record<string, string>;
}) {
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const { error } = useToast();

  useEffect(() => {
    if (!open) {
      setHtml('');
      return;
    }
    load();
  }, [open, template.bodyHtml, template.subject]);

  async function load() {
    try {
      setLoading(true);
      const result = await renderPreview({
        bodyHtml: template.bodyHtml,
        variables: sampleVariables,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // 제목도 포함한 완전한 HTML 생성
      const fullHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${template.subject}</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
            </style>
          </head>
          <body>
            <h1 style="font-size: 24px; margin-bottom: 20px; color: #1a1a1a;">${template.subject}</h1>
            ${result.html}
          </body>
        </html>
      `;

      setHtml(fullHtml);
    } catch (err: any) {
      console.error('Failed to render preview:', err);
      error('프리뷰 렌더링 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>이메일 미리보기</DialogTitle>
        </DialogHeader>

        <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner />
            </div>
          ) : (
            <iframe
              className="w-full h-full border-0"
              srcDoc={html}
              title="Email Preview"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

