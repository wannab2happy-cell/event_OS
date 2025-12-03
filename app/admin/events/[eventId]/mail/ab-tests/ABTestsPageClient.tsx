'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ABTestList } from '@/components/mail/abtest/ABTestList';
import { ABTestForm } from '@/components/mail/abtest/ABTestForm';
import { ABTestResult } from '@/components/mail/abtest/ABTestResult';
import type { EmailABTest } from '@/lib/mail/types';

interface ABTestsPageClientProps {
  eventId: string;
  initialTests: EmailABTest[];
  templates: Array<{ id: string; name: string }>;
  companies: string[];
}

export function ABTestsPageClient({
  eventId,
  initialTests,
  templates,
  companies,
}: ABTestsPageClientProps) {
  const [tests, setTests] = useState(initialTests);
  const [showForm, setShowForm] = useState(false);
  const [editingTest, setEditingTest] = useState<EmailABTest | null>(null);
  const [viewingResults, setViewingResults] = useState<EmailABTest | null>(null);
  const [results, setResults] = useState<any[]>([]);

  const handleEdit = (test: EmailABTest) => {
    setEditingTest(test);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingTest(null);
    setShowForm(true);
  };

  const handleViewResults = async (test: EmailABTest) => {
    setViewingResults(test);
    // Fetch results via API route
    try {
      const response = await fetch(`/api/mail/ab-tests/${test.id}/results`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      }
    } catch (err) {
      console.error('Failed to fetch AB test results:', err);
      setResults([]);
    }
  };

  const handleSuccess = () => {
    // Refresh page to reload tests
    window.location.reload();
  };

  if (viewingResults) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={() => setViewingResults(null)} variant="ghost">
            ← Back to Tests
          </Button>
        </div>
        <ABTestResult results={results} />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-end mb-4">
        <Button onClick={handleNew} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          New A/B Test
        </Button>
      </div>

      {/* AB Test List */}
      <ABTestList tests={tests} eventId={eventId} onEdit={handleEdit} onViewResults={handleViewResults} />

      {/* Form Modal */}
      {showForm && (
        <ABTestForm
          test={editingTest}
          eventId={eventId}
          templates={templates}
          companies={companies}
          onClose={() => {
            setShowForm(false);
            setEditingTest(null);
          }}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}

