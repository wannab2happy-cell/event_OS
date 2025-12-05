/**
 * Template List Component (Phase 4)
 * 
 * Enhanced template list with tags, AB Test badges, and improved layout
 */

'use client';

import { useState } from 'react';
import { FileText, Plus, Search, TestTube } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { EmailTemplate } from '@/lib/mail/types';
import { getRelativeTime } from '@/lib/utils/date';

interface TemplateListProps {
  templates: EmailTemplate[];
  eventId: string;
  onTemplateClick: (template: EmailTemplate) => void;
}

export default function TemplateList({ templates, eventId, onTemplateClick }: TemplateListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Templates</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage email templates for this event
          </p>
        </div>
        <Link href={`/admin/events/${eventId}/mail/templates/new`}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No templates found' : 'No templates yet. Create your first template.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => onTemplateClick(template)}
                  className="p-4 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{template.name}</h3>
                        {/* TODO: Add AB Test badge when AB test data is available */}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{template.subject}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {template.merge_variables && template.merge_variables.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            {template.merge_variables.slice(0, 3).map((varName) => (
                              <Badge key={varName} variant="info" className="text-xs">
                                {`{{${varName}}}`}
                              </Badge>
                            ))}
                            {template.merge_variables.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{template.merge_variables.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Updated {getRelativeTime(template.updated_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

