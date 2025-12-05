/**
 * Template Validation Utilities
 * 
 * Functions for validating email templates and detecting missing variables
 */

import type { EmailTemplate } from './types';

/**
 * Extract variable names from template string
 */
function extractVariables(template: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const matches = template.matchAll(regex);
  const variables = new Set<string>();
  
  for (const match of matches) {
    if (match[1]) {
      variables.add(match[1]);
    }
  }
  
  return Array.from(variables);
}

/**
 * Detect missing variables in template
 */
export function detectMissingVariables(
  template: EmailTemplate,
  availableVariables: Record<string, any>
): string[] {
  const subjectVars = extractVariables(template.subject);
  const bodyVars = extractVariables(template.body_html);
  const allVars = [...new Set([...subjectVars, ...bodyVars])];
  
  const missing: string[] = [];
  for (const varName of allVars) {
    if (!(varName in availableVariables)) {
      missing.push(varName);
    }
  }
  
  return missing;
}

/**
 * Infer available variables from template merge_variables field
 */
export function inferAvailableVariables(template: EmailTemplate): string[] {
  return template.merge_variables || [];
}

/**
 * Validate template completeness
 */
export interface TemplateValidationResult {
  valid: boolean;
  missingVariables: string[];
  warnings: string[];
}

export function validateTemplate(
  template: EmailTemplate,
  availableVariables?: Record<string, any>
): TemplateValidationResult {
  const missingVariables: string[] = [];
  const warnings: string[] = [];
  
  // Check for missing variables if availableVariables provided
  if (availableVariables) {
    const missing = detectMissingVariables(template, availableVariables);
    missingVariables.push(...missing);
  }
  
  // Check for empty subject
  if (!template.subject || template.subject.trim().length === 0) {
    warnings.push('Subject is empty');
  }
  
  // Check for empty body
  if (!template.body_html || template.body_html.trim().length === 0) {
    warnings.push('Body HTML is empty');
  }
  
  return {
    valid: missingVariables.length === 0 && warnings.length === 0,
    missingVariables,
    warnings,
  };
}

