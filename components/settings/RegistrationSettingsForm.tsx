/**
 * Registration Settings Form Component
 * 
 * Form for registration field configuration
 */

'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import type { RegistrationSettings, RegistrationFieldConfig } from '@/lib/settings/eventSettingsTypes';

interface RegistrationSettingsFormProps {
  value: RegistrationSettings;
  onChange: (next: RegistrationSettings) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}

const FIELD_KEYS: Array<keyof RegistrationSettings['fields']> = [
  'company',
  'title',
  'phone',
  'dietaryRestrictions',
  'notes',
];

const FIELD_LABELS: Record<keyof RegistrationSettings['fields'], string> = {
  company: 'Company',
  title: 'Title',
  phone: 'Phone',
  dietaryRestrictions: 'Dietary Restrictions',
  notes: 'Notes',
};

export default function RegistrationSettingsForm({
  value,
  onChange,
  onSave,
  saving,
}: RegistrationSettingsFormProps) {
  const [localValue, setLocalValue] = useState(value);

  const updateField = (
    fieldKey: keyof RegistrationSettings['fields'],
    updates: Partial<RegistrationFieldConfig>
  ) => {
    const updated = {
      ...localValue,
      fields: {
        ...localValue.fields,
        [fieldKey]: {
          ...(localValue.fields[fieldKey] || { enabled: false, required: false, label: '' }),
          ...updates,
        },
      },
    };
    setLocalValue(updated);
    onChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registration Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Field Configuration */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Registration Fields</h3>
          {FIELD_KEYS.map((fieldKey) => {
            const field = localValue.fields[fieldKey];
            if (!field) return null;

            return (
              <div key={fieldKey} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{FIELD_LABELS[fieldKey]}</h4>
                  <Switch
                    checked={field.enabled}
                    onChange={(e) => updateField(fieldKey, { enabled: e.target.checked })}
                  />
                </div>
                {field.enabled && (
                  <div className="space-y-2 pl-4">
                    <Switch
                      label="Required"
                      checked={field.required}
                      onChange={(e) => updateField(fieldKey, { required: e.target.checked })}
                    />
                    <Input
                      label="Field Label"
                      value={field.label}
                      onChange={(e) => updateField(fieldKey, { label: e.target.value })}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Terms Text */}
        <div className="pt-4 border-t">
          <Textarea
            label="Terms & Conditions Text"
            value={localValue.termsText || ''}
            onChange={(e) => {
              const updated = { ...localValue, termsText: e.target.value || undefined };
              setLocalValue(updated);
              onChange(updated);
            }}
            rows={6}
            placeholder="Enter terms and conditions text..."
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

