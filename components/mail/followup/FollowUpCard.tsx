'use client';

import { useState, useTransition } from 'react';
import { Calendar, Clock, Edit2, Power, PowerOff, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FollowUpStatusBadge } from './FollowUpStatusBadge';
import { toggleFollowUp } from '@/actions/mail/toggleFollowUp';
import { useToast } from '@/components/ui/Toast';
import type { EmailFollowUp } from '@/lib/mail/types';

interface FollowUpCardProps {
  followup: EmailFollowUp;
  templateName?: string;
  baseJobName?: string;
  eventId: string;
  onEdit: (followup: EmailFollowUp) => void;
}

export function FollowUpCard({ followup, templateName, baseJobName, eventId, onEdit }: FollowUpCardProps) {
  const { success, error } = useToast();
  const [isToggling, startToggle] = useTransition();

  const handleToggle = () => {
    startToggle(async () => {
      const result = await toggleFollowUp(followup.id, !followup.is_active);
      if (result.ok) {
        success(followup.is_active ? 'Follow-up deactivated' : 'Follow-up activated');
      } else {
        error(result.error || 'Failed to toggle follow-up');
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

  const getTriggerLabel = () => {
    switch (followup.trigger_type) {
      case 'on_fail':
        return 'On Fail';
      case 'on_success':
        return 'On Success';
      case 'after_hours':
        return `After ${followup.delay_hours || 0}h`;
      default:
        return 'Unknown';
    }
  };

  const getSegmentationSummary = () => {
    if (!followup.segmentation || typeof followup.segmentation !== 'object') {
      return 'All participants';
    }
    const seg = followup.segmentation as any;
    if (seg.rules && Array.isArray(seg.rules) && seg.rules.length > 0) {
      const rule = seg.rules[0];
      if (rule.type === 'all') return 'All';
      if (rule.type === 'registered_only') return 'Registered Only';
      if (rule.type === 'vip_only') return 'VIP Only';
      if (rule.type === 'company' && rule.values) {
        return `${rule.values.length} Companies`;
      }
      return rule.type;
    }
    return 'All participants';
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 mb-1">{followup.name}</h3>
          <p className="text-xs text-gray-500 mb-2">Template: {templateName || 'Unknown'}</p>
        </div>
        <FollowUpStatusBadge isActive={followup.is_active} />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Mail className="w-4 h-4" />
          <span className="font-medium">Trigger:</span>
          <span>{getTriggerLabel()}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Clock className="w-4 h-4" />
          <span className="font-medium">Base Job:</span>
          <span>{baseJobName || `Job #${followup.base_job_id.slice(0, 8)}`}</span>
        </div>

        <div className="text-xs text-gray-500">
          <span className="font-medium">Segmentation:</span> {getSegmentationSummary()}
        </div>

        {followup.last_run_at && (
          <div className="text-xs text-gray-500">
            <span className="font-medium">Last Run:</span> {formatDate(followup.last_run_at)}
          </div>
        )}

        {followup.next_run_at && (
          <div className="text-xs text-gray-500">
            <span className="font-medium">Next Run:</span> {formatDate(followup.next_run_at)}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={() => onEdit(followup)} variant="secondary" size="sm" className="flex-1">
          <Edit2 className="w-4 h-4 mr-1" />
          Edit
        </Button>
        <Button
          onClick={handleToggle}
          disabled={isToggling}
          variant={followup.is_active ? 'danger' : 'primary'}
          size="sm"
          className="flex-1"
        >
          {followup.is_active ? (
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




