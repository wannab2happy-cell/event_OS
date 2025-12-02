import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildMyTableLink } from '@/lib/mail/linkBuilder';
import { applyMergeVariablesToTemplate } from '@/lib/mail/parser';

// Mock the API route handler logic
describe('Job Processor Logic', () => {
  describe('Participant Filtering', () => {
    it('should filter by is_vip=true', () => {
      const participants = [
        { id: 'p1', name: 'P1', email: 'p1@test.com', is_vip: true, status: 'completed' },
        { id: 'p2', name: 'P2', email: 'p2@test.com', is_vip: false, status: 'completed' },
        { id: 'p3', name: 'P3', email: 'p3@test.com', is_vip: true, status: 'completed' },
      ];

      const filtered = participants.filter((p) => p.is_vip === true);
      expect(filtered).toHaveLength(2);
      expect(filtered.map((p) => p.id)).toEqual(['p1', 'p3']);
    });

    it('should filter by status array', () => {
      const participants = [
        { id: 'p1', name: 'P1', email: 'p1@test.com', is_vip: false, status: 'registered' },
        { id: 'p2', name: 'P2', email: 'p2@test.com', is_vip: false, status: 'completed' },
        { id: 'p3', name: 'P3', email: 'p3@test.com', is_vip: false, status: 'checked_in' },
      ];

      const statusFilter = ['completed', 'checked_in'];
      const filtered = participants.filter((p) => statusFilter.includes(p.status));
      expect(filtered).toHaveLength(2);
      expect(filtered.map((p) => p.id)).toEqual(['p2', 'p3']);
    });

    it('should filter by company', () => {
      const participants = [
        { id: 'p1', name: 'P1', email: 'p1@test.com', company_name: 'Company A' },
        { id: 'p2', name: 'P2', email: 'p2@test.com', company_name: 'Company B' },
        { id: 'p3', name: 'P3', email: 'p3@test.com', company_name: 'Company A' },
      ];

      const companyFilter = 'Company A';
      const filtered = participants.filter((p) => p.company_name === companyFilter);
      expect(filtered).toHaveLength(2);
      expect(filtered.map((p) => p.id)).toEqual(['p1', 'p3']);
    });
  });

  describe('Merge Variables Generation', () => {
    it('should generate correct merge variables for participant', () => {
      const participant = {
        id: 'p1',
        name: 'John Doe',
        company_name: 'ANDERS',
      };
      const tableName = 'Table 3';
      const eventCode = 'event-2024';

      const myTableUrl = buildMyTableLink({
        eventCode,
        participantId: participant.id,
      });

      const mergeVariables = {
        name: participant.name || '',
        company: participant.company_name || '',
        tableName: tableName || 'Unassigned',
        myTableUrl,
      };

      expect(mergeVariables.name).toBe('John Doe');
      expect(mergeVariables.company).toBe('ANDERS');
      expect(mergeVariables.tableName).toBe('Table 3');
      expect(mergeVariables.myTableUrl).toContain('/events/event-2024/my-table?pid=p1');
    });

    it('should handle missing table assignment', () => {
      const participant = {
        id: 'p1',
        name: 'John Doe',
        company_name: 'ANDERS',
      };
      const tableName = null;
      const eventCode = 'event-2024';

      const mergeVariables = {
        name: participant.name || '',
        company: participant.company_name || '',
        tableName: tableName || 'Unassigned',
        myTableUrl: buildMyTableLink({ eventCode, participantId: participant.id }),
      };

      expect(mergeVariables.tableName).toBe('Unassigned');
    });
  });

  describe('Template Variable Application', () => {
    it('should apply merge variables to template correctly', () => {
      const htmlTemplate = '<p>Hello {{name}}, your table is {{tableName}}</p>';
      const textTemplate = 'Hello {{name}}, your table is {{tableName}}';
      const variables = {
        name: 'John Doe',
        company: 'ANDERS',
        tableName: 'Table 3',
        myTableUrl: 'https://events.anders.kr/events/event-2024/my-table?pid=p1',
      };

      const { html, text } = applyMergeVariablesToTemplate(htmlTemplate, textTemplate, variables);

      expect(html).toContain('John Doe');
      expect(html).toContain('Table 3');
      expect(text).toContain('John Doe');
      expect(text).toContain('Table 3');
    });

    it('should include myTableUrl in template', () => {
      const htmlTemplate = '<p>Check your table: <a href="{{myTableUrl}}">My Table</a></p>';
      const variables = {
        name: 'John',
        company: 'ANDERS',
        tableName: 'Table 3',
        myTableUrl: 'https://events.anders.kr/events/event-2024/my-table?pid=p1',
      };

      const { html } = applyMergeVariablesToTemplate(htmlTemplate, null, variables);

      expect(html).toContain('https://events.anders.kr/events/event-2024/my-table?pid=p1');
    });
  });

  describe('Job Status Updates', () => {
    it('should calculate success and fail counts correctly', () => {
      const results = [
        { success: true },
        { success: true },
        { success: false, error: 'Invalid email' },
        { success: true },
        { success: false, error: 'Rate limit' },
      ];

      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;

      expect(successCount).toBe(3);
      expect(failCount).toBe(2);
    });
  });
});

