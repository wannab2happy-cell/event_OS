/**
 * Check-in Client Component
 * 
 * Main check-in interface with QR scanner and manual input
 */

'use client';

import { useState, useCallback } from 'react';
import { Search, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import QRScanner from '@/components/staff/checkin/QRScanner';
import ParticipantResult from '@/components/staff/checkin/ParticipantResult';
import { checkInParticipant } from '@/actions/staff/checkInParticipant';
import { findParticipant } from '@/actions/staff/findParticipant';
import toast from 'react-hot-toast';
import type { Participant } from '@/lib/types/participants';

interface CheckInResult {
  success: boolean;
  status: 'checked_in' | 'already_checked_in' | 'not_found' | 'error';
  participant?: Participant;
  error?: string;
}

interface CheckInClientProps {
  eventId: string;
  eventTitle: string;
}

export default function CheckInClient({ eventId, eventTitle }: CheckInClientProps) {
  const [scanResult, setScanResult] = useState<CheckInResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Participant[]>([]);
  const [searching, setSearching] = useState(false);

  const handleCheckIn = useCallback(
    async (participantId: string) => {
      setLoading(true);
      setScanResult(null);

      try {
        const result = await checkInParticipant(eventId, participantId);
        setScanResult(result);

        if (result.success) {
          if (result.status === 'checked_in') {
            toast.success('Checked in successfully');
          } else if (result.status === 'already_checked_in') {
            toast('Already checked in', { icon: 'ℹ️' });
          }
        } else {
          toast.error(result.error || 'Check-in failed');
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Check-in failed');
        setScanResult({
          success: false,
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      } finally {
        setLoading(false);
      }
    },
    [eventId]
  );

  const handleScan = useCallback(
    (qrData: string) => {
      // QR code should contain participant ID
      // Format: could be just UUID or eventId/participantId
      const participantId = qrData.trim();
      if (participantId) {
        handleCheckIn(participantId);
      }
    },
    [handleCheckIn]
  );

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleCheckIn(manualInput.trim());
      setManualInput('');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const results = await findParticipant(eventId, searchQuery);
      setSearchResults(results);
    } catch (err) {
      toast.error('Search failed');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-4 pt-6 pb-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{eventTitle}</h1>
        <p className="text-sm text-muted-foreground mt-1">Check-in</p>
      </div>

      {/* QR Scanner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Scan QR Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QRScanner onScan={handleScan} disabled={loading} />
        </CardContent>
      </Card>

      {/* Manual Input */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleManualSubmit} className="space-y-2">
            <Input
              placeholder="Enter Participant ID"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !manualInput.trim()} className="w-full">
              Check In
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search by Name/Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSearch} className="space-y-2">
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={searching}
            />
            <Button type="submit" disabled={searching || !searchQuery.trim()} className="w-full">
              {searching ? 'Searching...' : 'Search'}
            </Button>
          </form>

          {searchResults.length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <p className="text-sm font-medium">Results:</p>
              {searchResults.map((participant) => (
                <div
                  key={participant.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleCheckIn(participant.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{participant.name}</p>
                      {participant.company && (
                        <p className="text-sm text-muted-foreground">{participant.company}</p>
                      )}
                    </div>
                    <Button size="sm" variant="secondary">
                      Check In
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Result */}
      {scanResult && (
        <ParticipantResult data={scanResult} />
      )}
    </div>
  );
}

