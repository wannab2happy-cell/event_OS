'use client';

import { ReactNode } from 'react';

interface AdminPageProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AdminPage({ title, subtitle, actions, children }: AdminPageProps) {
  return (
    <div className="flex-1 min-w-0">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-4 py-4 md:px-8 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900">{title}</h1>
              {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 md:px-8 md:py-6">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}

