/**
 * Branding Settings Form Component
 * 
 * Form for branding settings
 */

'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import ColorInput from './ColorInput';
import LogoUploader from './LogoUploader';
import type { BrandingSettings } from '@/lib/settings/eventSettingsTypes';

interface BrandingSettingsFormProps {
  value: BrandingSettings;
  onChange: (next: BrandingSettings) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  eventId: string;
}

export default function BrandingSettingsForm({
  value,
  onChange,
  onSave,
  saving,
  eventId,
}: BrandingSettingsFormProps) {
  const [localValue, setLocalValue] = useState(value);

  const updateField = <K extends keyof BrandingSettings>(key: K, val: BrandingSettings[K]) => {
    const updated = { ...localValue, [key]: val };
    setLocalValue(updated);
    onChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logos & Images */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Logos & Images</h3>
          <LogoUploader
            label="Logo"
            imageUrl={localValue.logoUrl}
            eventId={eventId}
            type="logo"
            onChange={(url) => updateField('logoUrl', url || undefined)}
          />
          <LogoUploader
            label="Hero Image"
            imageUrl={localValue.heroImageUrl}
            eventId={eventId}
            type="hero"
            onChange={(url) => updateField('heroImageUrl', url || undefined)}
          />
        </div>

        {/* Colors & Theme */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-semibold">Colors & Theme</h3>
          <ColorInput
            label="Primary Color"
            value={localValue.primaryColor || '#0070f3'}
            onChange={(val) => updateField('primaryColor', val)}
          />
          <ColorInput
            label="Secondary Color"
            value={localValue.secondaryColor || '#f8f8f8'}
            onChange={(val) => updateField('secondaryColor', val)}
          />
          <ColorInput
            label="Accent Color"
            value={localValue.accentColor || ''}
            onChange={(val) => updateField('accentColor', val || undefined)}
          />
          <Switch
            label="Use Dark Theme by Default"
            checked={localValue.useDarkThemeByDefault || false}
            onChange={(e) => updateField('useDarkThemeByDefault', e.target.checked)}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={onSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </CardFooter>
    </Card>
  );
}

