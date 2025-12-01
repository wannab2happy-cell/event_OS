// FILE: lib/mail/utils.ts

/**
 * Replace {{variables}} inside email templates.
 * 
 * Example:
 * template: "Hello {{name}}, your seat is {{seat}}."
 * data: { name: "Alex", seat: "A-12" }
 */
export function applyTemplateVariables(
  template: string,
  data: Record<string, any>
): string {
  return template.replace(/{{\s*([^}]+)\s*}}/g, (_, key) => {
    return data[key.trim()] ?? "";
  });
}

/**
 * Chunk an array into smaller arrays (for batch sending).
 * 
 * Example:
 * chunkArray([1,2,3,4], 2) → [[1,2], [3,4]]
 */
export function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}


