'use client';

import { useState, useTransition } from 'react';
import { Calendar, Clock, Zap, Edit2, Power, PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AutomationStatusBadge } from './AutomationStatusBadge';
import { toggleAutomation } from '@/actions/mail/toggleAutomation';
import { useToast } from '@/components/ui/Toast';
import type { EmailAutomation } from '@/lib/mail/types';

interface AutomationCardProps {
  automation: EmailAutomation;
  templateName?: string;
  eventId: string;
  onEdit: (automation: EmailAutomation) => void;
}

export function AutomationCard({ automation, templateName, eventId, onEdit }: AutomationCardProps) {
  const { success, error } = useToast();
  const [isToggling, startToggle] = useTransition();

  const handleToggle = () => {
    startToggle(async () => {
      const result = await toggleAutomation(automation.id, !automation.is_active);
      if (result.ok) {
        success(automation.is_active ? 'Automation deactivated' : 'Automation activated');
      } else {
        error(result.error || 'Failed to toggle automation');
      }
    });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getScheduleSummary = () => {
    if (automation.type === 'time_based') {
      if (automation.time_type === 'absolute' && automation.send_at) {
        return `Absolute: ${formatDate(automation.send_at)}`;
      }
      if (automation.time_type === 'relative' && automation.relative_days !== null) {
        const days = automation.relative_days;
        const direction = days < 0 ? 'before' : 'after';
        return `${Math.abs(days)} days ${direction} event start`;
      }
      return 'Time-based (not configured)';
    }
    if (automation.type === 'event_based') {
      const triggerLabels: Record<string, string> = {
        on_registration_completed: 'On Registration Completed',
        on_table_assigned: 'On Table Assigned',
      };
      return triggerLabels[automation.trigger_kind || ''] || 'Event-based';
    }
    return 'Not configured';
  };

  const getSegmentationSummary = () => {
    if (!automation.segmentation || typeof automation.segmentation !== 'object') {
      return 'All participants';
    }
    const seg = automation.segmentation as any;
    if (seg.rules && Array.isArray(seg.rules) && seg.rules.length > 0) {
      const rule = seg.rules[0];
      if (rule.type === 'all') return 'All';
      if (rule.type === 'registered_only') return 'Registered Only';
      if (rule.type === 'vip_only') return 'VIP Only';
      if (rule.type === 'company' && rule.values) {
        return `${rule.values.length} companies`;
      }
      return rule.type;
    }
    return 'All participants';
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 mb-1">{automation.name}</h3>
          <p className="text-xs text-gray-500 mb-2">Template: {templateName || 'Unknown'}</p>
        </div>
        <AutomationStatusBadge isActive={automation.is_active} />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          {automation.type === 'time_based' ? (
            <Calendar className="w-4 h-4" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          <span className="font-medium">Type:</span>
          <span>{automation.type === 'time_based' ? 'Time-based' : 'Event-based'}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Clock className="w-4 h-4" />
          <span className="font-medium">Schedule:</span>
          <span>{getScheduleSummary()}</span>
        </div>

        <div className="text-xs text-gray-500">
          <span className="font-medium">Segmentation:</span> {getSegmentationSummary()}
        </div>

        {automation.last_run_at && (
          <div className="text-xs text-gray-500">
            <span className="font-medium">Last Run:</span> {formatDate(automation.last_run_at)}
          </div>
        )}

        {automation.next_run_at && (
          <div className="text-xs text-gray-500">
            <span className="font-medium">Next Run:</span> {formatDate(automation.next_run_at)}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={() => onEdit(automation)} variant="secondary" size="sm" className="flex-1">
          <Edit2 className="w-4 h-4 mr-1" />
          Edit
        </Button>
        <Button
          onClick={handleToggle}
          disabled={isToggling}
          variant={automation.is_active ? 'danger' : 'primary'}
          size="sm"
          className="flex-1"
        >
          {automation.is_active ? (
            <>
              <PowerOff className="w-4 h-4 mr-1" />
              Deactivate
            </>
          ) : (
            <>
              <Power className="w-4 h-4 mr-1" />
              Activate
            </>
          )}
        </Button>
      </div>
    </div>
  );
}




