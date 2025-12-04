'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, Building2, Globe, Crown } from 'lucide-react';
import type { SegmentationConfig } from '@/lib/mail/segmentation';

interface JobSegmentationCardProps {
  segmentation: SegmentationConfig | null | undefined;
}

export function JobSegmentationCard({ segmentation }: JobSegmentationCardProps) {
  if (!segmentation || !segmentation.rules || segmentation.rules.length === 0) {
    return (
      <Card className="rounded-lg border border-gray-200 bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" />
            Segmentation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">모든 참가자</p>
        </CardContent>
      </Card>
    );
  }

  const getRuleLabel = (rule: { type: string; values?: string[] }) => {
    switch (rule.type) {
      case 'all':
        return '모든 참가자';
      case 'registered_only':
        return '등록 완료만';
      case 'invited_only':
        return '초대됨만';
      case 'vip_only':
        return 'VIP만';
      case 'company':
        return rule.values && rule.values.length > 0
          ? `${rule.values.length}개 회사: ${rule.values.join(', ')}`
          : '회사별';
      case 'language':
        return rule.values && rule.values.length > 0
          ? `언어: ${rule.values.map((v) => (v === 'ko' ? '한국어' : 'English')).join(', ')}`
          : '언어별';
      default:
        return rule.type;
    }
  };

  const parts: string[] = [];
  segmentation.rules.forEach((rule) => {
    const label = getRuleLabel(rule);
    if (label) parts.push(label);
  });

  return (
    <Card className="rounded-lg border border-gray-200 bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-600" />
          Segmentation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700">{parts.join(' + ')}</p>
      </CardContent>
    </Card>
  );
}




