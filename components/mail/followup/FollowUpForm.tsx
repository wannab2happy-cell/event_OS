'use client';

import { useState, useEffect } from 'react';
import { useTransition } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SegmentationSelector } from '@/components/mail/SegmentationSelector';
import { saveFollowUp } from '@/actions/mail/saveFollowUp';
import { useToast } from '@/components/ui/Toast';
import type { EmailFollowUp, FollowUpTriggerType } from '@/lib/mail/types';
import type { SegmentationConfig } from '@/lib/mail/segmentation';

interface FollowUpFormProps {
  followup?: EmailFollowUp | null;
  eventId: string;
  templates: Array<{ id: string; name: string }>;
  jobs: Array<{ id: string; name: string; status: string }>;
  companies: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export function FollowUpForm({
  followup,
  eventId,
  templates,
  jobs,
  companies,
  onClose,
  onSuccess,
}: FollowUpFormProps) {
  const { success, error } = useToast();
  const [isSaving, startSave] = useTransition();

  const [name, setName] = useState(followup?.name || '');
  const [templateId, setTemplateId] = useState(followup?.template_id || '');
  const [baseJobId, setBaseJobId] = useState(followup?.base_job_id || '');
  const [triggerType, setTriggerType] = useState<FollowUpTriggerType>(
    followup?.trigger_type || 'on_fail'
  );
  const [delayHours, setDelayHours] = useState(followup?.delay_hours?.toString() || '48');
  const [segmentation, setSegmentation] = useState<SegmentationConfig>(
    (followup?.segmentation as SegmentationConfig) || { rules: [{ type: 'all' }] }
  );
  const [isActive, setIsActive] = useState(followup?.is_active ?? true);

  // Filter jobs to only completed ones
  const completedJobs = jobs.filter((j) => j.status === 'completed');

  const handleSubmit = () => {
    if (!name.trim()) {
      error('Follow-up name is required');
      return;
    }
    if (!templateId) {
      error('Please select a template');
      return;
    }
    if (!baseJobId) {
      error('Please select a base job');
      return;
    }
    if (triggerType === 'after_hours' && !delayHours) {
      error('Please set delay hours');
      return;
    }

    startSave(async () => {
      const result = await saveFollowUp({
        id: followup?.id,
        eventId,
        templateId,
        name: name.trim(),
        baseJobId,
        triggerType,
        delayHours: triggerType === 'after_hours' ? parseInt(delayHours, 10) : null,
        segmentation,
        isActive,
      });

      if (result.ok) {
        success(followup ? 'Follow-up updated' : 'Follow-up created');
        onSuccess();
        onClose();
      } else {
        error(result.error || 'Failed to save follow-up');
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {followup ? 'Edit Follow-Up' : 'New Follow-Up'}
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
              placeholder="e.g., Retry Failed Delivery (48h later)"
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

          {/* Base Job */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Base Job</label>
            <Select
              value={baseJobId}
              onChange={(e) => setBaseJobId(e.target.value)}
              disabled={isSaving}
              options={completedJobs.map((j) => ({ value: j.id, label: j.name }))}
            />
            <p className="text-xs text-gray-500 mt-1">Select the completed job this follow-up is based on</p>
          </div>

          {/* Trigger Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trigger Type</label>
            <Select
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value as FollowUpTriggerType)}
              disabled={isSaving}
              options={[
                { value: 'on_fail', label: 'On Fail (send to participants who failed)' },
                { value: 'on_success', label: 'On Success (send to participants who succeeded)' },
                { value: 'after_hours', label: 'After Hours (send after delay)' },
              ]}
            />
          </div>

          {/* Delay Hours (only for after_hours) */}
          {triggerType === 'after_hours' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delay Hours</label>
              <Input
                type="number"
                value={delayHours}
                onChange={(e) => setDelayHours(e.target.value)}
                placeholder="48"
                disabled={isSaving}
              />
              <p className="text-xs text-gray-500 mt-1">Hours after base job completion</p>
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
            {isSaving ? 'Saving...' : followup ? 'Update Follow-Up' : 'Create Follow-Up'}
          </Button>
        </div>
      </div>
    </div>
  );
}

