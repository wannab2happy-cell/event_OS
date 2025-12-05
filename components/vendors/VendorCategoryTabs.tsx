/**
 * Vendor Category Tabs Component
 * 
 * Tab navigation for vendor categories
 */

'use client';

import { cn } from '@/lib/utils';
import type { VendorCategory } from '@/lib/vendors/vendorTypes';
import { getCategoryLabel } from '@/lib/vendors/vendorTypes';

interface VendorCategoryTabsProps {
  activeCategory: VendorCategory;
  onChange: (category: VendorCategory) => void;
}

const CATEGORIES: VendorCategory[] = ['hotel', 'av', 'graphics', 'logistics', 'other'];

export default function VendorCategoryTabs({ activeCategory, onChange }: VendorCategoryTabsProps) {
  return (
    <div className="flex gap-2 border-b border-gray-200">
      {CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => onChange(category)}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors border-b-2',
            activeCategory === category
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          {getCategoryLabel(category)}
        </button>
      ))}
    </div>
  );
}

