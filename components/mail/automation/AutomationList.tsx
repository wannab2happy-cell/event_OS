'use client';

import { AutomationCard } from './AutomationCard';
import type { EmailAutomation } from '@/lib/mail/types';

interface AutomationListProps {
  automations: EmailAutomation[];
  templates: Map<string, string>; // templateId -> templateName
  eventId: string;
  onEdit: (automation: EmailAutomation) => void;
}

export function AutomationList({ automations, templates, eventId, onEdit }: AutomationListProps) {
  if (automations.length === 0) {
    return (
      <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-gray-500 mb-2">No automations configured</p>
        <p className="text-sm text-gray-400">Create your first automation to schedule automatic email campaigns</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {automations.map((automation) => (
        <AutomationCard
          key={automation.id}
          automation={automation}
          templateName={templates.get(automation.template_id)}
          eventId={eventId}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}




