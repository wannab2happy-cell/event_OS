/**
 * Event Duplicate Client Component (Phase 6)
 * 
 * Handles event duplication UI and logic
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { duplicateEvent } from '@/actions/events/duplicateEvent';
import toast from 'react-hot-toast';
import { formatDateISO } from '@/lib/utils/date';

interface EventDuplicateClientProps {
  eventId: string;
  sourceEvent: {
    title: string;
    start_date: string;
    end_date: string;
  };
}

export default function EventDuplicateClient({
  eventId,
  sourceEvent,
}: EventDuplicateClientProps) {
  const router = useRouter();
  const [newName, setNewName] = useState(`${sourceEvent.title} (Copy)`);
  const [newStartDate, setNewStartDate] = useState(
    formatDateISO(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))
  );
  const [newEndDate, setNewEndDate] = useState(
    formatDateISO(new Date(Date.now() + 368 * 24 * 60 * 60 * 1000))
  );
  const [copySettings, setCopySettings] = useState(true);
  const [copyMailTemplates, setCopyMailTemplates] = useState(true);
  const [copyTables, setCopyTables] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  const handleDuplicate = async () => {
    if (!newName.trim() || !newStartDate || !newEndDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setDuplicating(true);
    try {
      const result = await duplicateEvent({
        originalEventId: eventId,
        newName: newName.trim(),
        newStartDate,
        newEndDate,
        copySettings,
        copyMailTemplates,
        copyTables,
      });

      if ('error' in result) {
        toast.error(result.error);
      } else {
        toast.success('Event duplicated successfully');
        router.push(`/admin/events/${result.id}/dashboard`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to duplicate event');
    } finally {
      setDuplicating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Duplicate Event</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* New Event Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">New Event Details</h3>
            <Input
              label="Event Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                required
              />
              <Input
                label="End Date"
                type="date"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Copy Options */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-semibold">What to Copy</h3>
            <Switch
              label="Copy Settings"
              checked={copySettings}
              onChange={(e) => setCopySettings(e.target.checked)}
            />
            <Switch
              label="Copy Mail Templates"
              checked={copyMailTemplates}
              onChange={(e) => setCopyMailTemplates(e.target.checked)}
            />
            <Switch
              label="Copy Tables (without assignments)"
              checked={copyTables}
              onChange={(e) => setCopyTables(e.target.checked)}
            />
          </div>

          {/* Summary */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="text-sm font-semibold">Summary</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• New event: {newName}</li>
              <li>• Dates: {newStartDate} to {newEndDate}</li>
              {copySettings && <li>• Settings will be copied</li>}
              {copyMailTemplates && <li>• Mail templates will be copied</li>}
              {copyTables && <li>• Tables will be copied (assignments will not)</li>}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button onClick={handleDuplicate} disabled={duplicating}>
              <Copy className="w-4 h-4 mr-2" />
              {duplicating ? 'Duplicating...' : 'Duplicate Event'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

