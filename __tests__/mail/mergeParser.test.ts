import { describe, it, expect } from 'vitest';
import {
  applyMergeVariables,
  extractMergeVariables,
  validateMergeVariables,
  applyMergeVariablesToTemplate,
} from '@/lib/mail/parser';

describe('Mail Merge Parser', () => {
  describe('applyMergeVariables', () => {
    it('should replace {{name}} with participant name', () => {
      const template = 'Hello {{name}}, welcome to the event!';
      const variables = { name: 'John Doe' };
      const result = applyMergeVariables(template, variables);
      expect(result).toBe('Hello John Doe, welcome to the event!');
    });

    it('should replace {{tableName}} with table name', () => {
      const template = 'Your table is {{tableName}}';
      const variables = { tableName: 'Table 3' };
      const result = applyMergeVariables(template, variables);
      expect(result).toBe('Your table is Table 3');
    });

    it('should handle multiple variables', () => {
      const template = 'Hello {{name}}, your table is {{tableName}} at {{company}}';
      const variables = {
        name: 'John Doe',
        tableName: 'Table 3',
        company: 'ANDERS',
      };
      const result = applyMergeVariables(template, variables);
      expect(result).toBe('Hello John Doe, your table is Table 3 at ANDERS');
    });

    it('should keep original placeholder if variable is missing', () => {
      const template = 'Hello {{name}}, your table is {{tableName}}';
      const variables = { name: 'John Doe' };
      const result = applyMergeVariables(template, variables);
      expect(result).toBe('Hello John Doe, your table is {{tableName}}');
    });

    it('should handle null/undefined values', () => {
      const template = 'Hello {{name}}';
      const variables = { name: null };
      const result = applyMergeVariables(template, variables);
      expect(result).toBe('Hello {{name}}');
    });
  });

  describe('extractMergeVariables', () => {
    it('should extract all unique variables from template', () => {
      const template = 'Hello {{name}}, your table is {{tableName}} and company is {{company}}';
      const result = extractMergeVariables(template);
      expect(result).toEqual(['name', 'tableName', 'company']);
    });

    it('should handle duplicate variables', () => {
      const template = 'Hello {{name}}, {{name}} is your name';
      const result = extractMergeVariables(template);
      expect(result).toEqual(['name']);
    });

    it('should return empty array for template without variables', () => {
      const template = 'Hello, welcome to the event!';
      const result = extractMergeVariables(template);
      expect(result).toEqual([]);
    });
  });

  describe('validateMergeVariables', () => {
    it('should return isValid=true when all variables are provided', () => {
      const template = 'Hello {{name}}, your table is {{tableName}}';
      const variables = { name: 'John', tableName: 'T3' };
      const result = validateMergeVariables(template, variables);
      expect(result.isValid).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it('should return isValid=false and list missing variables', () => {
      const template = 'Hello {{name}}, your table is {{tableName}}';
      const variables = { name: 'John' };
      const result = validateMergeVariables(template, variables);
      expect(result.isValid).toBe(false);
      expect(result.missing).toEqual(['tableName']);
    });
  });

  describe('applyMergeVariablesToTemplate', () => {
    it('should apply variables to both HTML and text templates', () => {
      const htmlTemplate = '<p>Hello {{name}}, your table is {{tableName}}</p>';
      const textTemplate = 'Hello {{name}}, your table is {{tableName}}';
      const variables = { name: 'John', tableName: 'T3' };

      const result = applyMergeVariablesToTemplate(htmlTemplate, textTemplate, variables);

      expect(result.html).toBe('<p>Hello John, your table is T3</p>');
      expect(result.text).toBe('Hello John, your table is T3');
    });

    it('should handle null text template', () => {
      const htmlTemplate = '<p>Hello {{name}}</p>';
      const variables = { name: 'John' };

      const result = applyMergeVariablesToTemplate(htmlTemplate, null, variables);

      expect(result.html).toBe('<p>Hello John</p>');
      expect(result.text).toBeNull();
    });
  });
});

