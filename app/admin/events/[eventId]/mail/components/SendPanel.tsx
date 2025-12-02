'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createJob } from '@/actions/mail/createJob';
import type { EmailTemplate } from '@/lib/mail/types';

interface SendPanelProps {
  templates: EmailTemplate[];
  eventId: string;
}

export function SendPanel({ templates, eventId }: SendPanelProps) {
  const router = useRouter();
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [isVipOnly, setIsVipOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [companyFilter, setCompanyFilter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!selectedTemplateId) {
      setError('템플릿을 선택해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const filterOptions: {
        is_vip?: boolean;
        status?: string[];
        company?: string;
      } = {};

      if (isVipOnly) {
        filterOptions.is_vip = true;
      }

      if (statusFilter.length > 0) {
        filterOptions.status = statusFilter;
      }

      if (companyFilter.trim()) {
        filterOptions.company = companyFilter.trim();
      }

      const result = await createJob({
        event_id: eventId,
        template_id: selectedTemplateId,
        filter_options: Object.keys(filterOptions).length > 0 ? filterOptions : undefined,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/admin/events/${eventId}/mail/jobs`);
          router.refresh();
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { value: 'invited', label: '초대됨' },
    { value: 'registered', label: '정보 입력 중' },
    { value: 'completed', label: '등록 완료' },
    { value: 'checked_in', label: '현장 체크인' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5 text-emerald-600" />
          Send Email
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          템플릿을 선택하고 필터 조건을 설정한 후 메일을 발송합니다.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Template"
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            options={[
              { value: '', label: '템플릿 선택...' },
              ...templates.map((t) => ({ value: t.id, label: t.name })),
            ]}
            required
          />

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Filters (Optional)</label>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="vip-only"
                checked={isVipOnly}
                onChange={(e) => setIsVipOnly(e.target.checked)}
                className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
              />
              <label htmlFor="vip-only" className="text-sm text-gray-700">
                VIP만 발송
              </label>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Participant Status</label>
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <div key={option.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`status-${option.value}`}
                      checked={statusFilter.includes(option.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setStatusFilter([...statusFilter, option.value]);
                        } else {
                          setStatusFilter(statusFilter.filter((s) => s !== option.value));
                        }
                      }}
                      className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                    />
                    <label htmlFor={`status-${option.value}`} className="text-sm text-gray-700">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Input
              label="Company (Optional)"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              placeholder="특정 회사만 발송"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <p className="text-sm text-emerald-600">Job이 생성되었습니다. Jobs 페이지로 이동합니다...</p>
            </div>
          )}

          <Button type="submit" disabled={isSubmitting || !selectedTemplateId} className="w-full">
            {isSubmitting ? 'Creating Job...' : 'Create Send Job'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

