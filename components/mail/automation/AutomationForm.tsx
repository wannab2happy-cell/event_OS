'use client';

import { useState, useEffect } from 'react';
import { useTransition } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SegmentationSelector } from '@/components/mail/SegmentationSelector';
import { saveAutomation } from '@/actions/mail/saveAutomation';
import { useToast } from '@/components/ui/Toast';
import type { EmailAutomation, AutomationType, AutomationTimeType } from '@/lib/mail/types';
import type { SegmentationConfig } from '@/lib/mail/segmentation';

interface AutomationFormProps {
  automation?: EmailAutomation | null;
  eventId: string;
  templates: Array<{ id: string; name: string }>;
  companies: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export function AutomationForm({
  automation,
  eventId,
  templates,
  companies,
  onClose,
  onSuccess,
}: AutomationFormProps) {
  const { success, error } = useToast();
  const [isSaving, startSave] = useTransition();

  const [name, setName] = useState(automation?.name || '');
  const [templateId, setTemplateId] = useState(automation?.template_id || '');
  const [type, setType] = useState<AutomationType>(automation?.type || 'time_based');
  const [timeType, setTimeType] = useState<AutomationTimeType | ''>(automation?.time_type || 'relative');
  const [sendAt, setSendAt] = useState(automation?.send_at ? automation.send_at.slice(0, 16) : '');
  const [relativeDays, setRelativeDays] = useState(automation?.relative_days?.toString() || '-3');
  const [triggerKind, setTriggerKind] = useState<'on_registration_completed' | 'on_table_assigned'>(
    (automation?.trigger_kind as 'on_registration_completed' | 'on_table_assigned') || 'on_registration_completed'
  );
  const [segmentation, setSegmentation] = useState<SegmentationConfig>(
    (automation?.segmentation as SegmentationConfig) || { rules: [{ type: 'all' }] }
  );
  const [isActive, setIsActive] = useState(automation?.is_active ?? true);

  const handleSubmit = () => {
    if (!name.trim()) {
      error('Automation name is required');
      return;
    }
    if (!templateId) {
      error('Please select a template');
      return;
    }
    if (type === 'time_based' && !timeType) {
      error('Please select time mode');
      return;
    }
    if (type === 'time_based' && timeType === 'absolute' && !sendAt) {
      error('Please set send date/time');
      return;
    }
    if (type === 'time_based' && timeType === 'relative' && !relativeDays) {
      error('Please set relative days');
      return;
    }

    startSave(async () => {
      const result = await saveAutomation({
        id: automation?.id,
        eventId,
        templateId,
        name: name.trim(),
        type,
        timeType: type === 'time_based' ? (timeType as AutomationTimeType) : undefined,
        sendAt: type === 'time_based' && timeType === 'absolute' ? new Date(sendAt).toISOString() : undefined,
        relativeDays:
          type === 'time_based' && timeType === 'relative' ? parseInt(relativeDays, 10) : undefined,
        triggerKind: type === 'event_based' ? triggerKind : undefined,
        segmentation,
        isActive,
      });

      if (result.ok) {
        success(automation ? 'Automation updated' : 'Automation created');
        onSuccess();
        onClose();
      } else {
        error(result.error || 'Failed to save automation');
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {automation ? 'Edit Automation' : 'New Automation'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., D-3 Welcome Reminder"
              disabled={isSaving}
            />
          </div>

          {/* Template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
            <Select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              disabled={isSaving}
              options={templates.map((t) => ({ value: t.id, label: t.name }))}
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as AutomationType)}
              disabled={isSaving}
              options={[
                { value: 'time_based', label: 'Time-based' },
                { value: 'event_based', label: 'Event-based' },
              ]}
            />
          </div>

          {/* Time-based config */}
          {type === 'time_based' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Mode</label>
                <Select
                  value={timeType}
                  onChange={(e) => setTimeType(e.target.value as AutomationTimeType)}
                  disabled={isSaving}
                  options={[
                    { value: 'relative', label: 'Relative to Event Start' },
                    { value: 'absolute', label: 'Absolute Date/Time' },
                  ]}
                />
              </div>

              {timeType === 'absolute' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Send At</label>
                  <Input
                    type="datetime-local"
                    value={sendAt}
                    onChange={(e) => setSendAt(e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              )}

              {timeType === 'relative' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relative Days</label>
                  <Input
                    type="number"
                    value={relativeDays}
                    onChange={(e) => setRelativeDays(e.target.value)}
                    placeholder="-3 (3 days before event start)"
                    disabled={isSaving}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Negative = before event start, Positive = after event start
                  </p>
                </div>
              )}
            </>
          )}

          {/* Event-based config */}
          {type === 'event_based' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trigger</label>
              <Select
                value={triggerKind}
                onChange={(e) => setTriggerKind(e.target.value as 'on_registration_completed' | 'on_table_assigned')}
                disabled={isSaving}
                options={[
                  { value: 'on_registration_completed', label: 'On Registration Completed' },
                  { value: 'on_table_assigned', label: 'On Table Assigned' },
                ]}
              />
            </div>
          )}

          {/* Segmentation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Segmentation</label>
            <SegmentationSelector
              eventId={eventId}
              value={segmentation}
              onChange={setSegmentation}
              companies={companies}
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={isSaving}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active
            </label>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <Button onClick={onClose} variant="ghost" disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : automation ? 'Update Automation' : 'Create Automation'}
          </Button>
        </div>
      </div>
    </div>
  );
}

