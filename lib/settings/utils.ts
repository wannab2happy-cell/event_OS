/**
 * Event Settings Utilities
 * 
 * Helper functions for merging and managing event settings
 */

import type { EventSettings } from './eventSettingsTypes';
import { getDefaultEventSettings } from './defaults';

/**
 * Deep merge two objects
 */
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const output = { ...target };

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = deepMerge(target[key] || {}, source[key] as any);
    } else if (source[key] !== undefined) {
      output[key] = source[key] as T[Extract<keyof T, string>];
    }
  }

  return output;
}

/**
 * Merge event settings with defaults
 */
export function mergeEventSettings(
  existing: Partial<EventSettings> | null | undefined,
  partial: Partial<EventSettings>
): EventSettings {
  const defaults = getDefaultEventSettings();
  const current = existing ? deepMerge(defaults, existing) : defaults;
  return deepMerge(current, partial);
}

/**
 * Ensure all settings sections exist
 */
export function ensureCompleteSettings(
  partial: Partial<EventSettings> | null | undefined
): EventSettings {
  const defaults = getDefaultEventSettings();
  if (!partial) return defaults;
  return deepMerge(defaults, partial);
}

