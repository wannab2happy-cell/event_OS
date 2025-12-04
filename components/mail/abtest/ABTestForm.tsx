'use client';

import { useState, useEffect } from 'react';
import { useTransition } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SegmentationSelector } from '@/components/mail/SegmentationSelector';
import { ABVariantEditor } from './ABVariantEditor';
import { saveABTest } from '@/actions/mail/saveABTest';
import { useToast } from '@/components/ui/Toast';
import type { EmailABTest, ABTestVariant } from '@/lib/mail/types';
import type { SegmentationConfig } from '@/lib/mail/segmentation';

interface ABTestFormProps {
  test?: EmailABTest | null;
  eventId: string;
  templates: Array<{ id: string; name: string }>;
  companies: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export function ABTestForm({
  test,
  eventId,
  templates,
  companies,
  onClose,
  onSuccess,
}: ABTestFormProps) {
  const { success, error } = useToast();
  const [isSaving, startSave] = useTransition();

  const [name, setName] = useState(test?.name || '');
  const [variants, setVariants] = useState<ABTestVariant[]>(
    (test?.variants as ABTestVariant[]) || [
      { template_id: templates[0]?.id || '', weight: 50 },
      { template_id: templates[1]?.id || templates[0]?.id || '', weight: 50 },
    ]
  );
  const [segmentation, setSegmentation] = useState<SegmentationConfig>(
    (test?.segmentation as SegmentationConfig) || { rules: [{ type: 'all' }] }
  );

  const handleSubmit = () => {
    if (!name.trim()) {
      error('Test name is required');
      return;
    }
    if (variants.length < 2) {
      error('At least 2 variants are required');
      return;
    }
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      error('Variant weights must sum to 100%');
      return;
    }
    if (variants.some((v) => !v.template_id)) {
      error('All variants must have a template selected');
      return;
    }

    startSave(async () => {
      const result = await saveABTest({
        id: test?.id,
        eventId,
        name: name.trim(),
        variants,
        segmentation,
      });

      if (result.ok) {
        success(test ? 'A/B test updated' : 'A/B test created');
        onSuccess();
        onClose();
      } else {
        error(result.error || 'Failed to save A/B test');
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {test ? 'Edit A/B Test' : 'New A/B Test'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Test Name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Welcome Email A/B Test"
              disabled={isSaving}
            />
          </div>

          {/* Variants */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Variants</label>
            <ABVariantEditor
              variants={variants}
              templates={templates}
              onChange={setVariants}
            />
          </div>

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
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <Button onClick={onClose} variant="ghost" disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : test ? 'Update Test' : 'Create Test'}
          </Button>
        </div>
      </div>
    </div>
  );
}




