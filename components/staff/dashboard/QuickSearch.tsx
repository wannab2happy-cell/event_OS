/**
 * Quick Search Component
 * 
 * Search participants by name or email
 */

'use client';

import { useState, useTransition } from 'react';
import { Search, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { findParticipant } from '@/actions/staff/findParticipant';
import type { Participant } from '@/lib/types/participants';

interface QuickSearchProps {
  eventId: string;
  onParticipantClick?: (participantId: string) => void;
}

export default function QuickSearch({ eventId, onParticipantClick }: QuickSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Participant[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setResults([]);
      return;
    }

    startTransition(async () => {
      const found = await findParticipant(eventId, query);
      setResults(found);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Quick Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSearch} className="space-y-2">
          <Input
            placeholder="Search by name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isPending}
          />
          <Button type="submit" disabled={isPending || !query.trim()} className="w-full">
            {isPending ? 'Searching...' : 'Search'}
          </Button>
        </form>

        {results.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-sm font-medium">Results:</p>
            {results.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onParticipantClick?.(participant.id)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{participant.name}</p>
                    {participant.email && (
                      <p className="text-xs text-muted-foreground truncate">{participant.email}</p>
                    )}
                    {participant.company && (
                      <p className="text-xs text-muted-foreground truncate">{participant.company}</p>
                    )}
                  </div>
                </div>
                {participant.checked_in && (
                  <span className="text-xs text-muted-foreground">Checked in</span>
                )}
              </div>
            ))}
          </div>
        )}

        {query && results.length === 0 && !isPending && (
          <p className="text-sm text-muted-foreground text-center py-2">No results found</p>
        )}
      </CardContent>
    </Card>
  );
}

