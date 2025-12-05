wz/**
 * Template Rendering Utility
 * 
 * Renders email templates with variable substitution and validation
 */

export interface RenderTemplateResult {
  success: boolean;
  html?: string;
  subject?: string;
  text?: string;
  error?: string;
  missingVariables?: string[];
}

/**
 * Render template with variable substitution
 * 
 * @param template - Template object with subject, body_html, body_text
 * @param variables - Variable values to substitute
 * @returns Result with rendered content or structured error
 */
export function renderTemplate(
  template: {
    subject: string;
    body_html: string;
    body_text?: string | null;
  },
  variables: Record<string, string | number | null | undefined>
): RenderTemplateResult {
  try {
    // Extract required variables from template
    const requiredVars = extractVariables(template.subject + ' ' + template.body_html);
    const missingVars: string[] = [];
    
    // Check for missing variables (warn but don't fail)
    for (const varName of requiredVars) {
      if (!(varName in variables) || variables[varName] === null || variables[varName] === undefined) {
        missingVars.push(varName);
      }
    }

    // Normalize variables to strings (fallback to empty string)
    const normalizedVars: Record<string, string> = {};
    for (const [key, value] of Object.entries(variables)) {
      normalizedVars[key] = value != null ? String(value) : '';
    }

    // Render with fallback for missing variables
    const subject = applyVariables(template.subject, normalizedVars, missingVars);
    const html = applyVariables(template.body_html, normalizedVars, missingVars);
    const text = template.body_text
      ? applyVariables(template.body_text, normalizedVars, missingVars)
      : undefined;

    return {
      success: true,
      subject,
      html,
      text,
      missingVariables: missingVars.length > 0 ? missingVars : undefined,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to render template',
    };
  }
}

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
 * Apply variables to template string with fallback
 */
function applyVariables(
  template: string,
  variables: Record<string, string>,
  missingVars: string[]
): string {
  let result = template;

  // Replace all {{variable}} patterns
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value);
  }

  // Replace missing variables with empty string
  for (const varName of missingVars) {
    const regex = new RegExp(`\\{\\{${varName}\\}\\}`, 'g');
    result = result.replace(regex, '');
  }

  return result;
}

