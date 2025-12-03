'use client';

import { useState, useEffect } from 'react';
import { Users, Building2, Globe, Crown } from 'lucide-react';
import type { SegmentationConfig, SegmentationRule } from '@/lib/mail/segmentation';

interface SegmentationSelectorProps {
  eventId: string;
  value: SegmentationConfig;
  onChange: (config: SegmentationConfig) => void;
  companies?: string[];
}

export function SegmentationSelector({
  eventId,
  value,
  onChange,
  companies = [],
}: SegmentationSelectorProps) {
  const [selectedType, setSelectedType] = useState<SegmentationRule['type']>('all');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string[]>([]);
  const [isVipOnly, setIsVipOnly] = useState(false);

  // Initialize from value prop
  useEffect(() => {
    if (value.rules.length > 0) {
      const firstRule = value.rules[0];
      setSelectedType(firstRule.type);
      if (firstRule.type === 'company' && firstRule.values) {
        setSelectedCompanies(firstRule.values);
      }
      if (firstRule.type === 'language' && firstRule.values) {
        setSelectedLanguage(firstRule.values);
      }
      if (firstRule.type === 'vip_only') {
        setIsVipOnly(true);
      }
    }
  }, [value]);

  // Update parent when selection changes
  useEffect(() => {
    const rules: SegmentationRule[] = [];

    if (selectedType === 'all') {
      rules.push({ type: 'all' });
    } else if (selectedType === 'registered_only') {
      rules.push({ type: 'registered_only' });
    } else if (selectedType === 'invited_only') {
      rules.push({ type: 'invited_only' });
    } else if (selectedType === 'vip_only' || isVipOnly) {
      rules.push({ type: 'vip_only' });
    } else if (selectedType === 'company' && selectedCompanies.length > 0) {
      rules.push({ type: 'company', values: selectedCompanies });
    } else if (selectedType === 'language' && selectedLanguage.length > 0) {
      rules.push({ type: 'language', values: selectedLanguage });
    } else {
      // Default to all if no valid selection
      rules.push({ type: 'all' });
    }

    onChange({ rules });
  }, [selectedType, selectedCompanies, selectedLanguage, isVipOnly, onChange]);

  const getSummary = (): string => {
    const parts: string[] = [];

    if (selectedType === 'all') {
      return '모든 참가자';
    }

    if (selectedType === 'registered_only') {
      parts.push('등록 완료');
    } else if (selectedType === 'invited_only') {
      parts.push('초대됨');
    }

    if (isVipOnly || selectedType === 'vip_only') {
      parts.push('VIP');
    }

    if (selectedType === 'company' && selectedCompanies.length > 0) {
      if (selectedCompanies.length === 1) {
        parts.push(selectedCompanies[0]);
      } else {
        parts.push(`${selectedCompanies.length}개 회사`);
      }
    }

    if (selectedType === 'language' && selectedLanguage.length > 0) {
      parts.push(selectedLanguage.join(', '));
    }

    return parts.length > 0 ? parts.join(' + ') : '모든 참가자';
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">Segmentation</label>
        <select
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value as SegmentationRule['type']);
            setSelectedCompanies([]);
            setSelectedLanguage([]);
            setIsVipOnly(false);
          }}
          className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">모든 참가자</option>
          <option value="registered_only">등록 완료만</option>
          <option value="invited_only">초대됨만</option>
          <option value="vip_only">VIP만</option>
          <option value="company">회사별</option>
          <option value="language">언어별</option>
        </select>
      </div>

      {/* Company Selector */}
      {selectedType === 'company' && (
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            회사 선택
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
            {companies.length === 0 ? (
              <p className="text-xs text-gray-500 p-2">회사 정보가 없습니다.</p>
            ) : (
              companies.map((company) => (
                <label key={company} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCompanies.includes(company)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCompanies([...selectedCompanies, company]);
                      } else {
                        setSelectedCompanies(selectedCompanies.filter((c) => c !== company));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{company}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}

      {/* Language Selector */}
      {selectedType === 'language' && (
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            언어 선택
          </label>
          <div className="space-y-2">
            {['ko', 'en'].map((lang) => (
              <label key={lang} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedLanguage.includes(lang)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedLanguage([...selectedLanguage, lang]);
                    } else {
                      setSelectedLanguage(selectedLanguage.filter((l) => l !== lang));
                    }
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{lang === 'ko' ? '한국어' : 'English'}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* VIP Toggle (for other types) */}
      {(selectedType === 'all' || selectedType === 'registered_only' || selectedType === 'invited_only') && (
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isVipOnly}
              onChange={(e) => setIsVipOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 flex items-center gap-1">
              <Crown className="w-4 h-4 text-yellow-600" />
              VIP만
            </span>
          </label>
        </div>
      )}

      {/* Summary */}
      <div className="pt-2 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          <strong>발송 대상:</strong> {getSummary()}
        </p>
      </div>
    </div>
  );
}

