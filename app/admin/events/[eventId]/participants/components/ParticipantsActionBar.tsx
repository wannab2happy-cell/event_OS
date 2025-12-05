'use client';

import { Search, LayoutGrid, List } from 'lucide-react';
import type { ParticipantStatus } from '@/lib/types/participants';
import type { SortOption } from '@/lib/utils/participants';

export interface ParticipantFilters {
  searchQuery: string;
  statusFilter: ParticipantStatus | 'all';
  assignmentFilter: 'all' | 'unassigned' | 'assigned' | 'conflict' | 'overflow';
  companyFilter: string;
  vipOnly: boolean;
  sortOption: SortOption;
  viewMode: 'table' | 'cards';
}

interface ParticipantsActionBarProps {
  filters: ParticipantFilters;
  onFiltersChange: (filters: ParticipantFilters) => void;
  companies: string[];
}

export function ParticipantsActionBar({
  filters,
  onFiltersChange,
  companies,
}: ParticipantsActionBarProps) {
  const updateFilter = <K extends keyof ParticipantFilters>(
    key: K,
    value: ParticipantFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

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
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-48">
          <select
            value={filters.statusFilter}
            onChange={(e) => updateFilter('statusFilter', e.target.value as ParticipantStatus | 'all')}
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">전체 상태</option>
            <option value="invited">초대됨</option>
            <option value="registered">등록 중</option>
            <option value="cancelled">취소됨</option>
            <option value="completed">등록 완료</option>
          </select>
        </div>

        {/* Assignment Filter */}
        <div className="w-full md:w-48">
          <select
            value={filters.assignmentFilter}
            onChange={(e) =>
              updateFilter('assignmentFilter', e.target.value as 'all' | 'unassigned' | 'assigned' | 'conflict' | 'overflow')
            }
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">전체 배정</option>
            <option value="unassigned">미배정</option>
            <option value="assigned">배정됨</option>
            <option value="conflict">충돌</option>
            <option value="overflow">오버플로우</option>
          </select>
        </div>

        {/* Company Filter */}
        <div className="w-full md:w-48">
          <select
            value={filters.companyFilter}
            onChange={(e) => updateFilter('companyFilter', e.target.value)}
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
              checked={filters.vipOnly}
              onChange={(e) => updateFilter('vipOnly', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">VIP만 보기</span>
          </label>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">정렬:</span>
            <select
              value={filters.sortOption}
              onChange={(e) => updateFilter('sortOption', e.target.value as SortOption)}
              className="flex h-10 w-48 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="name_asc">이름 A-Z</option>
              <option value="name_desc">이름 Z-A</option>
              <option value="company_asc">회사 A-Z</option>
              <option value="company_desc">회사 Z-A</option>
              <option value="newest_registration">최신 등록순</option>
              <option value="oldest_registration">오래된 등록순</option>
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => updateFilter('viewMode', 'table')}
            className={`p-2 rounded transition-colors ${
              filters.viewMode === 'table' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
            title="테이블 보기"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => updateFilter('viewMode', 'cards')}
            className={`p-2 rounded transition-colors ${
              filters.viewMode === 'cards' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'
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

