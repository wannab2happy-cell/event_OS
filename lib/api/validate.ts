/**
 * API Request Validation
 * 
 * Validates request data against schemas
 */

import { NextRequest } from 'next/server';

export interface ValidationSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: any[];
    validate?: (value: any) => boolean | string;
  };
}

export interface ValidationResult {
  valid: boolean;
  data?: Record<string, any>;
  errors?: string[];
}

/**
 * Validate request body against schema
 */
export async function validate(
  req: NextRequest,
  schema: ValidationSchema
): Promise<ValidationResult> {
  try {
    const body = await req.json();
    const errors: string[] = [];
    const validated: Record<string, any> = {};

    for (const [key, rule] of Object.entries(schema)) {
      const value = body[key];

      // Check required
      if (rule.required && (value === undefined || value === null)) {
        errors.push(`${key} 필드는 필수입니다.`);
        continue;
      }

      // Skip validation if value is optional and not provided
      if (!rule.required && (value === undefined || value === null)) {
        continue;
      }

      // Check type
      if (rule.type === 'string' && typeof value !== 'string') {
        errors.push(`${key} 필드는 문자열이어야 합니다.`);
        continue;
      }

      if (rule.type === 'number' && typeof value !== 'number') {
        errors.push(`${key} 필드는 숫자여야 합니다.`);
        continue;
      }

      if (rule.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`${key} 필드는 불린 값이어야 합니다.`);
        continue;
      }

      if (rule.type === 'array' && !Array.isArray(value)) {
        errors.push(`${key} 필드는 배열이어야 합니다.`);
        continue;
      }

      if (rule.type === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
        errors.push(`${key} 필드는 객체여야 합니다.`);
        continue;
      }

      // Check min/max for strings and numbers
      if (rule.type === 'string' && typeof value === 'string') {
        if (rule.min !== undefined && value.length < rule.min) {
          errors.push(`${key} 필드는 최소 ${rule.min}자 이상이어야 합니다.`);
        }
        if (rule.max !== undefined && value.length > rule.max) {
          errors.push(`${key} 필드는 최대 ${rule.max}자 이하여야 합니다.`);
        }
      }

      if (rule.type === 'number' && typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          errors.push(`${key} 필드는 최소 ${rule.min} 이상이어야 합니다.`);
        }
        if (rule.max !== undefined && value > rule.max) {
          errors.push(`${key} 필드는 최대 ${rule.max} 이하여야 합니다.`);
        }
      }

      // Check pattern
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        errors.push(`${key} 필드 형식이 올바르지 않습니다.`);
        continue;
      }

      // Check enum
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(`${key} 필드는 다음 값 중 하나여야 합니다: ${rule.enum.join(', ')}`);
        continue;
      }

      // Custom validation
      if (rule.validate) {
        const customResult = rule.validate(value);
        if (customResult !== true) {
          errors.push(customResult || `${key} 필드 검증에 실패했습니다.`);
          continue;
        }
      }

      validated[key] = value;
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true, data: validated };
  } catch (err) {
    return {
      valid: false,
      errors: [err instanceof Error ? err.message : '요청 데이터를 파싱할 수 없습니다.'],
    };
  }
}

