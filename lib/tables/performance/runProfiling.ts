// Performance Profiling Test Script
import { roundRobin } from '../algorithms/roundRobin';
import { vipSpread } from '../algorithms/vipSpread';
import { groupByCompany } from '../algorithms/groupByCompany';
import { inspectConflicts } from '../../../app/admin/events/[eventId]/tables/ConflictInspector';
import { rebalanceAssignments } from '../../../app/admin/events/[eventId]/tables/SmartRebalance';
import { generateTestData } from './generateTestData';
import { startProfile, logProfileSummary, clearProfileResults } from './profiler';
import { TableAssignmentOptions } from '../assignmentTypes';

const testSizes = [100, 300, 500, 1000];

interface AlgorithmResult {
  name: string;
  results: { n: number; time: number }[];
  complexity: string;
  hotspots: string[];
}

export async function runFullProfiling(): Promise<void> {
  console.log('🚀 Starting Performance Profiling (Phase 2 Optimized)...\n');

  const results: AlgorithmResult[] = [];

  for (const n of testSizes) {
    console.log(`\n📊 Testing with N=${n} participants...`);
    const { participants, tables } = generateTestData(n, Math.ceil(n / 8));

    const options: TableAssignmentOptions = {
      eventId: 'test-event',
      algorithm: 'round_robin',
    };

    // Test roundRobin
    clearProfileResults();
    const endRoundRobin = startProfile(`roundRobin-N${n}`);
    roundRobin(options, participants, tables);
    const roundRobinResult = endRoundRobin();
    results.push({
      name: 'roundRobin',
      results: [{ n, time: roundRobinResult.duration }],
      complexity: 'O(N)',
      hotspots: ['Rotating pointer with precomputed available tables'],
    });

    // Test vipSpread
    const endVipSpread = startProfile(`vipSpread-N${n}`);
    vipSpread({ ...options, algorithm: 'vip_spread' }, participants, tables);
    const vipSpreadResult = endVipSpread();
    results.push({
      name: 'vipSpread',
      results: [{ n, time: vipSpreadResult.duration }],
      complexity: 'O(N log T)',
      hotspots: ['Priority queue for VIP distribution', 'Priority queue for regular distribution'],
    });

    // Test groupByCompany
    const endGroupByCompany = startProfile(`groupByCompany-N${n}`);
    groupByCompany({ ...options, algorithm: 'group_by_company' }, participants, tables);
    const groupByCompanyResult = endGroupByCompany();
    results.push({
      name: 'groupByCompany',
      results: [{ n, time: groupByCompanyResult.duration }],
      complexity: 'O(N log C + N log T)',
      hotspots: ['Single company sort', 'Priority queue for table selection'],
    });

    // Test ConflictInspector
    const assignments = roundRobin(options, participants, tables).assignments;
    const endInspector = startProfile(`ConflictInspector-N${n}`);
    inspectConflicts(assignments, tables, participants as any);
    const inspectorResult = endInspector();
    results.push({
      name: 'ConflictInspector',
      results: [{ n, time: inspectorResult.duration }],
      complexity: 'O(N + T + C)',
      hotspots: ['Single-pass map building', 'Optimized participant lookup'],
    });

    // Test SmartRebalance
    const endRebalance = startProfile(`SmartRebalance-N${n}`);
    rebalanceAssignments(assignments, tables, participants as any, 20);
    const rebalanceResult = endRebalance();
    results.push({
      name: 'SmartRebalance',
      results: [{ n, time: rebalanceResult.duration }],
      complexity: 'O(T log T)',
      hotspots: ['Max/Min heap for table selection', 'Capped iteration count'],
    });

    logProfileSummary();
  }

  // Generate summary table
  console.log('\n\n📈 Performance Summary Table (Phase 2 Optimized)');
  console.log('='.repeat(90));
  console.log('Algorithm Name    | N=100   | N=300   | N=500   | N=1000  | Complexity');
  console.log('-'.repeat(90));

  const algorithmNames = ['roundRobin', 'vipSpread', 'groupByCompany', 'ConflictInspector', 'SmartRebalance'];
  const aggregatedResults: Record<string, { times: number[]; complexity: string }> = {};

  // Aggregate results by algorithm
  for (const algoName of algorithmNames) {
    const algoResults = results.filter((r) => r.name === algoName);
    const times: number[] = [];
    for (const n of testSizes) {
      const result = algoResults.find((r) => r.results[0]?.n === n);
      times.push(result ? result.results[0].time : 0);
    }
    aggregatedResults[algoName] = {
      times,
      complexity: algoResults[0]?.complexity || 'N/A',
    };
  }

  // Print table
  for (const algoName of algorithmNames) {
    const { times, complexity } = aggregatedResults[algoName];
    const timeStrings = times.map((t) => (t > 0 ? `${t.toFixed(1)}ms` : 'N/A'));
    console.log(
      `${algoName.padEnd(17)} | ${timeStrings[0].padEnd(7)} | ${timeStrings[1].padEnd(7)} | ${timeStrings[2].padEnd(7)} | ${timeStrings[3].padEnd(7)} | ${complexity}`
    );
  }

  // Performance targets check
  console.log('\n\n✅ Performance Targets Check');
  console.log('='.repeat(90));
  const targets: Record<string, number> = {
    vipSpread: 60,
    groupByCompany: 90,
    roundRobin: 15,
    SmartRebalance: 80,
    ConflictInspector: 20,
  };

  for (const [algoName, target] of Object.entries(targets)) {
    const time1000 = aggregatedResults[algoName]?.times[3] || 0;
    const status = time1000 <= target ? '✅ PASS' : '❌ FAIL';
    console.log(`${algoName.padEnd(17)} | Target: ${target}ms | Actual: ${time1000.toFixed(1)}ms | ${status}`);
  }
}

// Run if executed directly
if (require.main === module) {
  runFullProfiling().catch(console.error);
}

