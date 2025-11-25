import type { CSSProperties } from 'react';
import type { EventBranding } from './types';

export const getBrandingStyles = (branding: EventBranding | null): CSSProperties => {
  const b = branding || ({} as EventBranding);

  return {
    '--primary': b.primary_color || '#2563eb',
    '--secondary': b.secondary_color || '#444444',
    '--accent': b.accent_color || '#10b981',
    '--font-event': b.font_family || 'Pretendard',
    '--kv-url': b.kv_image_url ? `url(${b.kv_image_url})` : 'none',
  } as CSSProperties;
};

