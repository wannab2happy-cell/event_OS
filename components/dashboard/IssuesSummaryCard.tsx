/**
 * Issues Summary Card Component
 * 
 * Displays top-level warnings and issues
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { AlertCircle } from 'lucide-react';

export interface Issue {
  id: string;
  message: string;
  severity?: 'warning' | 'error' | 'info';
}

interface IssuesSummaryCardProps {
  issues?: Issue[];
}

const defaultIssues: Issue[] = [
  { id: '1', message: '3 bounced emails', severity: 'warning' },
  { id: '2', message: '2 participants missing table assignment', severity: 'warning' },
];

export default function IssuesSummaryCard({ issues = defaultIssues }: IssuesSummaryCardProps) {
  if (issues.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Issues</CardTitle>
          <CardDescription>No issues found</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">All systems operational</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issues</CardTitle>
        <CardDescription>Warnings and issues to address</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {issues.map((issue) => (
            <li key={issue.id} className="flex items-start gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{issue.message}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

