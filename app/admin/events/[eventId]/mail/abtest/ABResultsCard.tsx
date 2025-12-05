/**
 * AB Test Results Card Component (Phase 4)
 * 
 * Displays AB test comparison results
 */

'use client';

import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import ABComparisonChart from './ABComparisonChart';
import type { ABTestResult } from '@/lib/mail/types';

interface ABResultsCardProps {
  testId: string;
  testName: string;
  variantA: ABTestResult;
  variantB: ABTestResult;
  onSetWinner: (variantIndex: number) => Promise<void>;
}

export default function ABResultsCard({
  testId,
  testName,
  variantA,
  variantB,
  onSetWinner,
}: ABResultsCardProps) {
  const winner = variantA.successRate > variantB.successRate ? 'A' : 'B';
  const winnerVariant = variantA.successRate > variantB.successRate ? variantA : variantB;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{testName}</CardTitle>
          <Badge variant={winner === 'A' ? 'success' : 'info'}>
            Winner: Version {winner}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comparison Chart */}
        <ABComparisonChart variantA={variantA} variantB={variantB} />

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Version A</h4>
              {winner === 'A' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sent:</span>
                <span className="font-medium">{variantA.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Opened:</span>
                <span className="font-medium">{variantA.successCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Open Rate:</span>
                <span className="font-medium">{variantA.successRate}%</span>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Version B</h4>
              {winner === 'B' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sent:</span>
                <span className="font-medium">{variantB.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Opened:</span>
                <span className="font-medium">{variantB.successCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Open Rate:</span>
                <span className="font-medium">{variantB.successRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Set Winner Button */}
        <Button
          onClick={() => onSetWinner(winner === 'A' ? 0 : 1)}
          className="w-full"
        >
          Set Version {winner} as Default Template
        </Button>
      </CardContent>
    </Card>
  );
}

