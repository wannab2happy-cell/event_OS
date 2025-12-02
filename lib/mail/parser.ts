/**
 * Mail Merge Variable Parser
 * 
 * Utility functions for replacing merge variables in email templates
 * Supports {{variable}} syntax
 */

/**
 * Apply merge variables to a template string
 * 
 * @param templateString - Template string with {{variable}} placeholders
 * @param variables - Object mapping variable names to values
 * @returns Template string with variables replaced
 * 
 * @example
 * applyMergeVariables(
 *   "Hello {{name}}, your table is {{tableName}}",
 *   { name: "Alex", tableName: "T3" }
 * )
 * // Returns: "Hello Alex, your table is T3"
 */
export function applyMergeVariables(
  templateString: string,
  variables: Record<string, string | number | null | undefined>
): string {
  if (!templateString) {
    return '';
  }

  // Replace {{variable}} with values from variables object
  return templateString.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    const value = variables[varName];
    
    // Handle null/undefined values
    if (value === null || value === undefined) {
      return match; // Keep original placeholder if value not found
    }
    
    // Convert to string
    return String(value);
  });
}

/**
 * Extract all merge variables from a template string
 * 
 * @param templateString - Template string with {{variable}} placeholders
 * @returns Array of unique variable names found in the template
 * 
 * @example
 * extractMergeVariables("Hello {{name}}, your table is {{tableName}}")
 * // Returns: ["name", "tableName"]
 */
export function extractMergeVariables(templateString: string): string[] {
  if (!templateString) {
    return [];
  }

  const matches = templateString.match(/\{\{(\w+)\}\}/g);
  if (!matches) {
    return [];
  }

  // Extract variable names and remove duplicates
  const variables = matches.map((match) => match.replace(/\{\{|\}\}/g, ''));
  return Array.from(new Set(variables));
}

/**
 * Validate that all required variables are provided
 * 
 * @param templateString - Template string with {{variable}} placeholders
 * @param variables - Object mapping variable names to values
 * @returns Object with isValid flag and missing variables array
 * 
 * @example
 * validateMergeVariables(
 *   "Hello {{name}}, your table is {{tableName}}",
 *   { name: "Alex" }
 * )
 * // Returns: { isValid: false, missing: ["tableName"] }
 */
export function validateMergeVariables(
  templateString: string,
  variables: Record<string, string | number | null | undefined>
): { isValid: boolean; missing: string[] } {
  const required = extractMergeVariables(templateString);
  const provided = Object.keys(variables);
  
  const missing = required.filter((varName) => !provided.includes(varName));
  
  return {
    isValid: missing.length === 0,
    missing,
  };
}

/**
 * Apply merge variables to both HTML and text templates
 * 
 * @param htmlTemplate - HTML template string
 * @param textTemplate - Text template string (optional)
 * @param variables - Object mapping variable names to values
 * @returns Object with processed html and text
 */
export function applyMergeVariablesToTemplate(
  htmlTemplate: string,
  textTemplate: string | null | undefined,
  variables: Record<string, string | number | null | undefined>
): { html: string; text: string | null } {
  return {
    html: applyMergeVariables(htmlTemplate, variables),
    text: textTemplate ? applyMergeVariables(textTemplate, variables) : null,
  };
}

