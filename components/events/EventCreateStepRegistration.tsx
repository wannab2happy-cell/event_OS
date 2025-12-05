/**
 * Event Create Step: Registration
 * 
 * Third step of event creation wizard
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import type { RegistrationSettings } from '@/lib/settings/eventSettingsTypes';

interface EventCreateStepRegistrationProps {
  value: RegistrationSettings;
  onChange: (value: RegistrationSettings) => void;
}

export default function EventCreateStepRegistration({
  value,
  onChange,
}: EventCreateStepRegistrationProps) {
  const updateField = (
    fieldKey: keyof RegistrationSettings['fields'],
    enabled: boolean
  ) => {
    const field = value.fields[fieldKey];
    if (!field) return;

    onChange({
      ...value,
      fields: {
        ...value.fields,
        [fieldKey]: {
          ...field,
          enabled,
        },
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registration Fields</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground mb-4">
          Select which fields to include in the registration form.
        </p>
        <Switch
          label="Company"
          checked={value.fields.company?.enabled ?? true}
          onChange={(e) => updateField('company', e.target.checked)}
        />
        <Switch
          label="Title/Position"
          checked={value.fields.title?.enabled ?? true}
          onChange={(e) => updateField('title', e.target.checked)}
        />
        <Switch
          label="Phone"
          checked={value.fields.phone?.enabled ?? true}
          onChange={(e) => updateField('phone', e.target.checked)}
        />
        <Switch
          label="Dietary Restrictions"
          checked={value.fields.dietaryRestrictions?.enabled ?? false}
          onChange={(e) => updateField('dietaryRestrictions', e.target.checked)}
        />
        <Switch
          label="Notes"
          checked={value.fields.notes?.enabled ?? false}
          onChange={(e) => updateField('notes', e.target.checked)}
        />
      </CardContent>
    </Card>
  );
}

