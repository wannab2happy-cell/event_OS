/**
 * Template Variable Parser
 * 
 * Replaces {{variable}} placeholders with actual values
 */

/**
 * Apply merge variables to a template string
 * 
 * @param template - Template string with {{variable}} placeholders
 * @param variables - Object mapping variable names to values
 * @returns Template with variables replaced
 */
export function applyMergeVariables(template: string, variables: Record<string, string>): string {
  let result = template;

  // Replace all {{variable}} patterns
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value);
  }

  return result;
}

/**
 * Extract merge variables from a template string
 * 
 * @param template - Template string with {{variable}} placeholders
 * @returns Array of unique variable names found in the template
 */
export function extractMergeVariables(template: string): string[] {
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
 * Apply merge variables to a complete email template
 * 
 * @param template - Email template object with subject and body
 * @param variables - Object mapping variable names to values
 * @returns Template with all fields having variables replaced
 */
export function applyMergeVariablesToTemplate(
  template: { subject: string; body_html: string; body_text?: string | null },
  variables: Record<string, string>
): { subject: string; body_html: string; body_text?: string } {
  return {
    subject: applyMergeVariables(template.subject, variables),
    body_html: applyMergeVariables(template.body_html, variables),
    body_text: template.body_text ? applyMergeVariables(template.body_text, variables) : undefined,
  };
}
