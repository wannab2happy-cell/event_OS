import { ParticipantForAssignment, TableForAssignment } from '../assignmentTypes';

export interface TestData {
  participants: ParticipantForAssignment[];
  tables: TableForAssignment[];
}

export function generateTestData(
  participantCount: number,
  tableCount: number = Math.ceil(participantCount / 8)
): TestData {
  const participants: ParticipantForAssignment[] = [];
  const tables: TableForAssignment[] = [];

  // Generate tables
  const capacityPerTable = Math.ceil(participantCount / tableCount);
  for (let i = 0; i < tableCount; i++) {
    tables.push({
      id: `table-${i}`,
      name: `Table ${i + 1}`,
      capacity: capacityPerTable + (i < participantCount % tableCount ? 1 : 0),
      isVipTable: i < Math.floor(tableCount * 0.2), // 20% VIP tables
    });
  }

  // Generate participants
  const companyCount = Math.max(5, Math.floor(participantCount / 20));
  const vipCount = Math.floor(participantCount * 0.1); // 10% VIPs

  for (let i = 0; i < participantCount; i++) {
    const companyId = `company-${i % companyCount}`;
    const companyName = `Company ${String.fromCharCode(65 + (i % companyCount))}`;

    participants.push({
      id: `participant-${i}`,
      name: `Participant ${i + 1}`,
      isVip: i < vipCount,
      companyId,
      companyName,
      company: companyName,
    });
  }

  return { participants, tables };
}

