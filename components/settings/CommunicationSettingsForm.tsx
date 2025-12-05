/**
 * Communication Settings Form Component
 * 
 * Form for communication settings
 */

'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import type { CommunicationSettings } from '@/lib/settings/eventSettingsTypes';

interface CommunicationSettingsFormProps {
  value: CommunicationSettings;
  onChange: (next: CommunicationSettings) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}

export default function CommunicationSettingsForm({
  value,
  onChange,
  onSave,
  saving,
}: CommunicationSettingsFormProps) {
  const [localValue, setLocalValue] = useState(value);

  const updateField = <K extends keyof CommunicationSettings>(
    key: K,
    val: CommunicationSettings[K]
  ) => {
    const updated = { ...localValue, [key]: val };
    setLocalValue(updated);
    onChange(updated);
  };

  const updateAutoEmail = (
    key: keyof CommunicationSettings['autoEmails'],
    enabled: boolean
  ) => {
    const updated = {
      ...localValue,
      autoEmails: {
        ...localValue.autoEmails,
        [key]: enabled,
      },
    };
    setLocalValue(updated);
    onChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communication Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Email Defaults</h3>
          <Input
            label="Default From Name"
            value={localValue.defaultFromName || ''}
            onChange={(e) => updateField('defaultFromName', e.target.value || undefined)}
            placeholder="Event OS"
          />
          <Input
            label="Default From Email"
            type="email"
            value={localValue.defaultFromEmail || ''}
            onChange={(e) => updateField('defaultFromEmail', e.target.value || undefined)}
            placeholder="noreply@example.com"
          />
          <Input
            label="Reply-To Email"
            type="email"
            value={localValue.replyToEmail || ''}
            onChange={(e) => updateField('replyToEmail', e.target.value || undefined)}
            placeholder="support@example.com"
          />
        </div>

        {/* Footer Text */}
        <div className="pt-4 border-t">
          <Textarea
            label="Email Footer Text"
            value={localValue.footerText || ''}
            onChange={(e) => updateField('footerText', e.target.value || undefined)}
            rows={4}
            placeholder="Footer text to include in all emails..."
          />
        </div>

        {/* Auto Emails */}
        <div className="pt-4 border-t space-y-3">
          <h3 className="text-sm font-semibold">Automated Emails</h3>
          <Switch
            label="Send Registration Confirmation"
            checked={localValue.autoEmails.registrationConfirmation}
            onChange={(e) => updateAutoEmail('registrationConfirmation', e.target.checked)}
          />
          <Switch
            label="Send Reminder Before Event"
            checked={localValue.autoEmails.reminderBeforeEvent}
            onChange={(e) => updateAutoEmail('reminderBeforeEvent', e.target.checked)}
          />
          <Switch
            label="Send Thank You After Event"
            checked={localValue.autoEmails.thankYouAfterEvent}
            onChange={(e) => updateAutoEmail('thankYouAfterEvent', e.target.checked)}
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

