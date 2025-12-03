'use client';

import { Search, LayoutGrid, List } from 'lucide-react';
import type { ParticipantStatus } from '@/lib/types';

interface ParticipantsActionBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: ParticipantStatus | 'all';
  onStatusFilterChange: (status: ParticipantStatus | 'all') => void;
  companyFilter: string;
  onCompanyFilterChange: (company: string) => void;
  isVipOnly: boolean;
  onVipToggle: (isVip: boolean) => void;
  sortBy: 'name' | 'company' | 'created_at';
  onSortChange: (sort: 'name' | 'company' | 'created_at') => void;
  viewMode: 'table' | 'cards';
  onViewModeChange: (mode: 'table' | 'cards') => void;
  companies: string[];
}

export function ParticipantsActionBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  companyFilter,
  onCompanyFilterChange,
  isVipOnly,
  onVipToggle,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  companies,
}: ParticipantsActionBarProps) {
  return (
    <div className="flex flex-col gap-4 p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Top Row: Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="이름, 이메일, 회사로 검색..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as ParticipantStatus | 'all')}
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">전체 상태</option>
            <option value="invited">초대됨</option>
            <option value="registered">정보 입력 중</option>
            <option value="completed">등록 완료</option>
            <option value="checked_in">현장 체크인</option>
          </select>
        </div>

        {/* Company Filter */}
        <div className="w-full md:w-48">
          <select
            value={companyFilter}
            onChange={(e) => onCompanyFilterChange(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">전체 회사</option>
            {companies.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bottom Row: VIP Toggle, Sort, View Mode */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-4">
          {/* VIP Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isVipOnly}
              onChange={(e) => onVipToggle(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">VIP만 보기</span>
          </label>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">정렬:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as 'name' | 'company' | 'created_at')}
              className="flex h-10 w-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="name">이름</option>
              <option value="company">회사</option>
              <option value="created_at">등록일</option>
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('table')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'table' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
            title="테이블 보기"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('cards')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'cards' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
            title="카드 보기"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

