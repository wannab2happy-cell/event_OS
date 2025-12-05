/**
 * General Settings Form Component
 * 
 * Form for general event settings
 */

'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import type { GeneralSettings } from '@/lib/settings/eventSettingsTypes';

interface GeneralSettingsFormProps {
  value: GeneralSettings;
  onChange: (next: GeneralSettings) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}

const TIMEZONES = [
  'Asia/Seoul',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
];

export default function GeneralSettingsForm({
  value,
  onChange,
  onSave,
  saving,
}: GeneralSettingsFormProps) {
  const [localValue, setLocalValue] = useState(value);

  const updateField = <K extends keyof GeneralSettings>(key: K, val: GeneralSettings[K]) => {
    const updated = { ...localValue, [key]: val };
    setLocalValue(updated);
    onChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Input
          label="Event Name Override"
          value={localValue.eventNameOverride || ''}
          onChange={(e) => updateField('eventNameOverride', e.target.value || undefined)}
          placeholder="Leave empty to use default event name"
        />

        <div>
          <label className="block text-sm font-medium mb-2">Timezone</label>
          <div className="flex gap-2">
            <select
              value={localValue.timezone || 'Asia/Seoul'}
              onChange={(e) => updateField('timezone', e.target.value)}
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
            <Input
              type="text"
              value={localValue.timezone || ''}
              onChange={(e) => updateField('timezone', e.target.value || undefined)}
              placeholder="Or enter custom timezone"
              className="flex-1"
            />
          </div>
        </div>

        <Switch
          label="Public Event"
          checked={localValue.isPublic ?? true}
          onChange={(e) => updateField('isPublic', e.target.checked)}
        />

        <div>
          <label className="block text-sm font-medium mb-2">Default Language</label>
          <select
            value={localValue.defaultLanguage || 'ko'}
            onChange={(e) =>
              updateField('defaultLanguage', e.target.value as 'ko' | 'en' | 'ja' | 'zh' | 'other')
            }
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="ko">Korean (한국어)</option>
            <option value="en">English</option>
            <option value="ja">Japanese (日本語)</option>
            <option value="zh">Chinese (中文)</option>
            <option value="other">Other</option>
          </select>
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

