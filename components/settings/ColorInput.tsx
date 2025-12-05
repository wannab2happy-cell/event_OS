/**
 * Color Input Component
 * 
 * Color picker with preview and hex input
 */

'use client';

import { Input } from '@/components/ui/Input';

interface ColorInputProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}

export default function ColorInput({ label, value = '#000000', onChange }: ColorInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      <div className="flex items-center gap-2">
        <div
          className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
          style={{ backgroundColor: value }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 font-mono"
        />
      </div>
    </div>
  );
}

