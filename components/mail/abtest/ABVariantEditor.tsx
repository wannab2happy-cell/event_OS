'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import type { ABTestVariant } from '@/lib/mail/types';

interface ABVariantEditorProps {
  variants: ABTestVariant[];
  templates: Array<{ id: string; name: string }>;
  onChange: (variants: ABTestVariant[]) => void;
}

export function ABVariantEditor({ variants, templates, onChange }: ABVariantEditorProps) {
  const [localVariants, setLocalVariants] = useState<ABTestVariant[]>(variants);

  const updateVariant = (index: number, updates: Partial<ABTestVariant>) => {
    const updated = [...localVariants];
    updated[index] = { ...updated[index], ...updates };
    setLocalVariants(updated);
    onChange(updated);
  };

  const addVariant = () => {
    if (localVariants.length >= 3) {
      return; // Max 3 variants
    }
    const newVariant: ABTestVariant = {
      template_id: templates[0]?.id || '',
      weight: Math.floor(100 / (localVariants.length + 1)),
    };
    const updated = [...localVariants, newVariant];
    // Redistribute weights
    const equalWeight = Math.floor(100 / updated.length);
    updated.forEach((v, i) => {
      v.weight = i === updated.length - 1 ? 100 - equalWeight * (updated.length - 1) : equalWeight;
    });
    setLocalVariants(updated);
    onChange(updated);
  };

  const removeVariant = (index: number) => {
    if (localVariants.length <= 2) {
      return; // Min 2 variants
    }
    const updated = localVariants.filter((_, i) => i !== index);
    // Redistribute weights
    const equalWeight = Math.floor(100 / updated.length);
    updated.forEach((v, i) => {
      v.weight = i === updated.length - 1 ? 100 - equalWeight * (updated.length - 1) : equalWeight;
    });
    setLocalVariants(updated);
    onChange(updated);
  };

  const totalWeight = localVariants.reduce((sum, v) => sum + v.weight, 0);
  const weightError = Math.abs(totalWeight - 100) > 0.01;

  return (
    <div className="space-y-3">
      {localVariants.map((variant, index) => {
        const label = String.fromCharCode(65 + index); // A, B, C
        const colorClasses = [
          'bg-blue-100 text-blue-700',
          'bg-green-100 text-green-700',
          'bg-purple-100 text-purple-700',
        ];
        return (
          <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
            <div className={`w-8 h-8 rounded-full ${colorClasses[index] || 'bg-gray-100 text-gray-700'} flex items-center justify-center font-bold text-sm`}>
              {label}
            </div>
            <div className="flex-1">
              <Select
                value={variant.template_id}
                onChange={(e) => updateVariant(index, { template_id: e.target.value })}
                options={templates.map((t) => ({ value: t.id, label: t.name }))}
              />
            </div>
            <div className="w-24">
              <Input
                type="number"
                min="0"
                max="100"
                value={variant.weight}
                onChange={(e) => {
                  const weight = parseInt(e.target.value, 10) || 0;
                  updateVariant(index, { weight });
                }}
                placeholder="50"
              />
            </div>
            <span className="text-sm text-gray-500">%</span>
            {localVariants.length > 2 && (
              <button
                onClick={() => removeVariant(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      })}

      {localVariants.length < 3 && (
        <Button onClick={addVariant} variant="ghost" size="sm" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Variant
        </Button>
      )}

      {weightError && (
        <p className="text-xs text-red-500">
          Weights must sum to 100%. Current total: {totalWeight.toFixed(1)}%
        </p>
      )}

      <div className="text-xs text-gray-500">
        Total: {totalWeight.toFixed(1)}%
      </div>
    </div>
  );
}

