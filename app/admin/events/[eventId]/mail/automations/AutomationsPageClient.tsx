'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AutomationList } from '@/components/mail/automation/AutomationList';
import { AutomationForm } from '@/components/mail/automation/AutomationForm';
import type { EmailAutomation } from '@/lib/mail/types';

interface AutomationsPageClientProps {
  eventId: string;
  initialAutomations: EmailAutomation[];
  templates: Array<{ id: string; name: string }>;
  companies: string[];
}

export function AutomationsPageClient({
  eventId,
  initialAutomations,
  templates,
  companies,
}: AutomationsPageClientProps) {
  const [automations, setAutomations] = useState(initialAutomations);
  const [showForm, setShowForm] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<EmailAutomation | null>(null);

  const handleEdit = (automation: EmailAutomation) => {
    setEditingAutomation(automation);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingAutomation(null);
    setShowForm(true);
  };

  const handleSuccess = () => {
    // Refresh page to reload automations
    window.location.reload();
  };

  const templateMap = new Map<string, string>();
  templates.forEach((t) => {
    templateMap.set(t.id, t.name);
  });

  return (
    <>
      <div className="flex items-center justify-end mb-4">
        <Button onClick={handleNew} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          New Automation
        </Button>
      </div>

      {/* Automation List */}
      <AutomationList
        automations={automations}
        templates={templateMap}
        eventId={eventId}
        onEdit={handleEdit}
      />

      {/* Form Modal */}
      {showForm && (
        <AutomationForm
          automation={editingAutomation}
          eventId={eventId}
          templates={templates}
          companies={companies}
          onClose={() => {
            setShowForm(false);
            setEditingAutomation(null);
          }}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}

