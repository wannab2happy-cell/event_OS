/**
 * Event Create Step: Branding
 * 
 * Second step of event creation wizard
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import ColorInput from '@/components/settings/ColorInput';
import type { BrandingSettings } from '@/lib/settings/eventSettingsTypes';

interface EventCreateStepBrandingProps {
  value: BrandingSettings;
  onChange: (value: BrandingSettings) => void;
}

export default function EventCreateStepBranding({
  value,
  onChange,
}: EventCreateStepBrandingProps) {
  const updateField = <K extends keyof BrandingSettings>(key: K, val: BrandingSettings[K]) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding (Optional)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          You can customize branding later in Settings. Leave defaults for now.
        </p>
        <ColorInput
          label="Primary Color"
          value={value.primaryColor || '#0070f3'}
          onChange={(val) => updateField('primaryColor', val)}
        />
        <ColorInput
          label="Secondary Color"
          value={value.secondaryColor || '#f8f8f8'}
          onChange={(val) => updateField('secondaryColor', val)}
        />
      </CardContent>
    </Card>
  );
}

