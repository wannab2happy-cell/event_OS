#!/usr/bin/env tsx
/**
 * EventOS Project Scan Script
 * 
 * 전체 프로젝트의 누락된 파일, 라우트, 레이아웃, 컴포넌트 연결 등을 검사합니다.
 */

import { readdir, stat } from 'fs/promises';
import { join } from 'path';

interface ScanResult {
  missing: string[];
  warnings: string[];
  errors: string[];
}

const REQUIRED_ROUTES = [
  'app/admin/events/[eventId]/dashboard/page.tsx',
  'app/admin/events/[eventId]/mail/page.tsx',
  'app/admin/events/[eventId]/tables/page.tsx',
  'app/admin/events/[eventId]/participants/page.tsx',
  'app/events/[eventCode]/page.tsx',
  'app/events/[eventCode]/layout.tsx',
  'app/events/[eventCode]/schedule/page.tsx',
  'app/events/[eventCode]/venue/page.tsx',
  'app/events/[eventCode]/my-table/page.tsx',
];

const REQUIRED_LIBRARIES = [
  'lib/tables/assignmentTypes.ts',
  'lib/tables/runAlgorithm.ts',
  'lib/tables/algorithms/roundRobin.ts',
  'lib/tables/algorithms/vipSpread.ts',
  'lib/tables/algorithms/groupByCompany.ts',
  'lib/tables/priorityQueue.ts',
  'lib/mail/types.ts',
  'lib/mail/api.ts',
  'lib/mail/sender.ts',
  'lib/mail/parser.ts',
  'lib/mail/linkBuilder.ts',
];

const REQUIRED_ACTIONS = [
  'actions/tables/runDraftAssignment.ts',
  'actions/tables/confirmAssignment.ts',
  'actions/tables/clearDraftAssignment.ts',
  'actions/mail/createTemplate.ts',
  'actions/mail/updateTemplate.ts',
  'actions/mail/createJob.ts',
];

async function fileExists(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.isFile();
  } catch {
    return false;
  }
}

async function scanProject(): Promise<ScanResult> {
  const result: ScanResult = {
    missing: [],
    warnings: [],
    errors: [],
  };

  console.log('🔍 EventOS 프로젝트 스캔 시작...\n');

  // 라우트 검사
  console.log('📁 라우트 검사 중...');
  for (const route of REQUIRED_ROUTES) {
    const exists = await fileExists(route);
    if (!exists) {
      result.missing.push(`라우트: ${route}`);
      console.log(`  ❌ ${route}`);
    } else {
      console.log(`  ✅ ${route}`);
    }
  }

  // 라이브러리 검사
  console.log('\n📚 라이브러리 검사 중...');
  for (const lib of REQUIRED_LIBRARIES) {
    const exists = await fileExists(lib);
    if (!exists) {
      result.missing.push(`라이브러리: ${lib}`);
      console.log(`  ❌ ${lib}`);
    } else {
      console.log(`  ✅ ${lib}`);
    }
  }

  // 서버 액션 검사
  console.log('\n⚡ 서버 액션 검사 중...');
  for (const action of REQUIRED_ACTIONS) {
    const exists = await fileExists(action);
    if (!exists) {
      result.missing.push(`서버 액션: ${action}`);
      console.log(`  ❌ ${action}`);
    } else {
      console.log(`  ✅ ${action}`);
    }
  }

  // 레이아웃 검사
  console.log('\n🎨 레이아웃 검사 중...');
  const layouts = [
    'app/admin/layout.tsx',
    'app/admin/events/[eventId]/layout.tsx',
    'app/events/[eventCode]/layout.tsx',
  ];
  for (const layout of layouts) {
    const exists = await fileExists(layout);
    if (!exists) {
      result.warnings.push(`레이아웃: ${layout}`);
      console.log(`  ⚠️  ${layout}`);
    } else {
      console.log(`  ✅ ${layout}`);
    }
  }

  return result;
}

async function main() {
  try {
    const result = await scanProject();

    console.log('\n' + '='.repeat(60));
    console.log('📊 스캔 결과 요약');
    console.log('='.repeat(60));

    if (result.missing.length === 0 && result.warnings.length === 0 && result.errors.length === 0) {
      console.log('\n✅ 모든 필수 파일이 존재합니다!');
      process.exit(0);
    }

    if (result.missing.length > 0) {
      console.log(`\n❌ 누락된 파일: ${result.missing.length}개`);
      result.missing.forEach((item) => console.log(`   - ${item}`));
    }

    if (result.warnings.length > 0) {
      console.log(`\n⚠️  경고: ${result.warnings.length}개`);
      result.warnings.forEach((item) => console.log(`   - ${item}`));
    }

    if (result.errors.length > 0) {
      console.log(`\n🔴 오류: ${result.errors.length}개`);
      result.errors.forEach((item) => console.log(`   - ${item}`));
    }

    console.log('\n' + '='.repeat(60));
    process.exit(result.missing.length > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ 스캔 중 오류 발생:', error);
    process.exit(1);
  }
}

main();

