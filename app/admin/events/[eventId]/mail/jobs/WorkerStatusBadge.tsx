/**
 * Worker Status Badge Component
 * 
 * Shows whether the email worker is active or idle
 */

'use client';

import { useState, useEffect } from 'react';
import { Activity, Pause } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export default function WorkerStatusBadge() {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Check worker status
    const checkWorkerStatus = async () => {
      try {
        const response = await fetch('/api/mail/worker', { method: 'GET' });
        const data = await response.json();
        setIsActive(data.hasJob || false);
      } catch (err) {
        console.error('Error checking worker status:', err);
      }
    };

    checkWorkerStatus();
    const interval = setInterval(checkWorkerStatus, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Badge variant={isActive ? 'success' : 'default'} className="flex items-center gap-1">
      {isActive ? <Activity className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
      {isActive ? 'Worker Active' : 'Worker Idle'}
    </Badge>
  );
}

