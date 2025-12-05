/**
 * Template Preview Component
 * 
 * Displays rendered email template preview
 */

'use client';

interface TemplatePreviewProps {
  subject: string;
  html: string;
}

export default function TemplatePreview({ subject, html }: TemplatePreviewProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">
          Subject
        </label>
        <div className="p-3 bg-muted rounded-lg border">
          <p className="text-sm font-medium">{subject}</p>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">
          Body
        </label>
        <div className="border rounded-lg overflow-hidden bg-white">
          <iframe
            srcDoc={`
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    margin: 0;
                    padding: 20px;
                    line-height: 1.6;
                  }
                  img { max-width: 100%; height: auto; }
                </style>
              </head>
              <body>
                ${html}
              </body>
              </html>
            `}
            className="w-full h-[600px] border-0"
            title="Email Preview"
          />
        </div>
      </div>
    </div>
  );
}

