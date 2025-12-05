/**
 * Event Create Step: General
 * 
 * First step of event creation wizard
 */

'use client';

import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface EventCreateStepGeneralProps {
  value: {
    name: string;
    startDate: string;
    endDate: string;
    location: string;
    timezone: string;
  };
  onChange: (value: {
    name: string;
    startDate: string;
    endDate: string;
    location: string;
    timezone: string;
  }) => void;
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

export default function EventCreateStepGeneral({ value, onChange }: EventCreateStepGeneralProps) {
  const updateField = <K extends keyof typeof value>(key: K, val: typeof value[K]) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          label="Event Name"
          value={value.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Annual Conference 2024"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={value.startDate}
            onChange={(e) => updateField('startDate', e.target.value)}
            required
          />
          <Input
            label="End Date"
            type="date"
            value={value.endDate}
            onChange={(e) => updateField('endDate', e.target.value)}
            required
          />
        </div>

        <Input
          label="Location"
          value={value.location}
          onChange={(e) => updateField('location', e.target.value)}
          placeholder="Seoul Convention Center"
        />

        <div>
          <label className="block text-sm font-medium mb-2">Timezone</label>
          <select
            value={value.timezone}
            onChange={(e) => updateField('timezone', e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
}

