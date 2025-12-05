/**
 * Segmentation Filter Tag Component
 * 
 * Displays an active filter with remove button
 */

'use client';

import { X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface SegmentationFilterTagProps {
  label: string;
  onRemove: () => void;
}

export default function SegmentationFilterTag({ label, onRemove }: SegmentationFilterTagProps) {
  return (
    <Badge variant="default" className="flex items-center gap-1">
      {label}
      <button
        onClick={onRemove}
        className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
      >
        <X className="w-3 h-3" />
      </button>
    </Badge>
  );
}

