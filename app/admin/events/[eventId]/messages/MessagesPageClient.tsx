'use client';

import { useState, useEffect } from 'react';
import { MessageTemplateList } from '@/components/message/MessageTemplateList';
import { MessageJobList } from '@/components/message/MessageJobList';
import { MessageSendClient } from '@/components/message/MessageSendClient';
import type { MessageTemplate, MessageJob } from '@/lib/mail/types';

interface MessagesPageClientProps {
  eventId: string;
  initialTemplates: MessageTemplate[];
  initialJobs: MessageJob[];
  event: { id: string; title: string; code: string };
  companies: string[];
}

export function MessagesPageClient({
  eventId,
  initialTemplates,
  initialJobs,
  event,
}: MessagesPageClientProps) {
  const [templates] = useState(initialTemplates);
  const [jobs] = useState(initialJobs);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [companies, setCompanies] = useState<string[]>([]);

  // Load companies on mount
  useEffect(() => {
    fetch(`/api/mail/companies?eventId=${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.companies) {
          setCompanies(data.companies);
        }
      })
      .catch((err) => console.error('Failed to load companies:', err));
  }, [eventId]);

  const handleSend = (template: MessageTemplate) => {
    setSelectedTemplate(template);
  };

  const handleCloseSend = () => {
    setSelectedTemplate(null);
  };

  const templateMap = new Map<string, string>();
  templates.forEach((t) => {
    templateMap.set(t.id, t.name);
  });

  return (
    <div className="space-y-8">
      {/* Templates */}
      <div>
        <h2 className="text-lg font-medium text-gray-700 mb-4">Templates</h2>
        <MessageTemplateList templates={templates} eventId={eventId} onSend={handleSend} />
      </div>

      {/* Send Client (when template selected) */}
      {selectedTemplate && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-700">
              Send: {selectedTemplate.name}
            </h2>
            <button
              onClick={handleCloseSend}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              Close
            </button>
          </div>
          <MessageSendClient
            template={selectedTemplate}
            eventId={eventId}
            event={event}
            companies={companies}
          />
        </div>
      )}

      {/* Recent Jobs */}
      <div>
        <h2 className="text-lg font-medium text-gray-700 mb-4">Recent Jobs</h2>
        <MessageJobList jobs={jobs} templates={templateMap} eventId={eventId} />
      </div>
    </div>
  );
}

