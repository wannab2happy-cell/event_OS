/**
 * AB Test Results Client Component (Phase 4)
 * 
 * Displays AB test results with comparison charts
 */

'use client';

import ABResultsCard from './ABResultsCard';
import type { EmailABTest, ABTestResult } from '@/lib/mail/types';
import type { EmailTemplate } from '@/lib/mail/types';

interface ABTestResultsClientProps {
  eventId: string;
  tests: EmailABTest[];
  templates: EmailTemplate[];
}

export default function ABTestResultsClient({
  eventId,
  tests,
  templates,
}: ABTestResultsClientProps) {
  // Mock AB test results for now
  // TODO: Fetch real results from database
  const getMockResults = (test: EmailABTest): { variantA: ABTestResult; variantB: ABTestResult } => {
    return {
      variantA: {
        variantIndex: 0,
        variantLabel: 'Version A',
        templateId: test.variants[0]?.template_id || '',
        templateName: templates.find((t) => t.id === test.variants[0]?.template_id)?.name,
        successCount: 120,
        failCount: 10,
        total: 130,
        successRate: 92,
        failRate: 8,
      },
      variantB: {
        variantIndex: 1,
        variantLabel: 'Version B',
        templateId: test.variants[1]?.template_id || '',
        templateName: templates.find((t) => t.id === test.variants[1]?.template_id)?.name,
        successCount: 135,
        failCount: 8,
        total: 143,
        successRate: 94,
        failRate: 6,
      },
    };
  };

  const handleSetWinner = async (variantIndex: number) => {
    // TODO: Implement set winner logic
    console.log('Setting winner:', variantIndex);
    alert('Setting winner functionality will be implemented');
  };

  if (tests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">No AB tests found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tests.map((test) => {
        if (test.variants.length < 2) return null;
        const results = getMockResults(test);
        return (
          <ABResultsCard
            key={test.id}
            testId={test.id}
            testName={test.name}
            variantA={results.variantA}
            variantB={results.variantB}
            onSetWinner={handleSetWinner}
          />
        );
      })}
    </div>
  );
}

