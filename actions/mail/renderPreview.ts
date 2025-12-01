'use server';

import { applyTemplateVariables } from '@/lib/mail/utils';

export async function renderPreview({
  bodyHtml,
  variables,
}: {
  bodyHtml: string;
  variables: Record<string, string>;
}) {
  try {
    const result = applyTemplateVariables(bodyHtml, variables);
    return { html: result };
  } catch (err: any) {
    console.error('Render preview error:', err);
    return { error: err.message || '프리뷰 렌더링 중 오류가 발생했습니다.' };
  }
}

