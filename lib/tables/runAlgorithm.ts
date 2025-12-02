import {
  TableAssignmentAlgorithm,
  TableAssignmentOptions,
  ParticipantForAssignment,
  TableForAssignment,
  TableAssignmentResult,
} from './assignmentTypes';
import { roundRobin } from './algorithms/roundRobin';
import { vipSpread } from './algorithms/vipSpread';
import { groupByCompany } from './algorithms/groupByCompany';
import { validateAssignmentResult } from './validateAssignments';

export function runAlgorithm(
  options: TableAssignmentOptions,
  participants: ParticipantForAssignment[],
  tables: TableForAssignment[]
): TableAssignmentResult {
  let result: TableAssignmentResult;

  switch (options.algorithm) {
    case 'round_robin':
      result = roundRobin(options, participants, tables);
      break;

    case 'vip_spread':
      result = vipSpread(options, participants, tables);
      break;

    case 'group_by_company':
      result = groupByCompany(options, participants, tables);
      break;

    default:
      throw new Error(`Unsupported algorithm: ${options.algorithm}`);
  }

  // Validate the result
  const validation = validateAssignmentResult(
    {
      participants,
      tables,
    },
    result.assignments
  );

  if (!validation.ok) {
    throw new Error(
      `Invalid table assignment result: ${validation.errors.join(' | ')}`
    );
  }

  return result;
}

