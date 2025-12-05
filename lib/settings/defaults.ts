/**
 * Event Settings Defaults
 * 
 * Provides default values for event settings
 */

import type { EventSettings } from './eventSettingsTypes';

/**
 * Get default event settings
 */
export function getDefaultEventSettings(): EventSettings {
  return {
    general: {
      eventNameOverride: undefined,
      timezone: 'Asia/Seoul',
      isPublic: true,
      defaultLanguage: 'ko',
    },
    branding: {
      logoUrl: undefined,
      heroImageUrl: undefined,
      primaryColor: '#0070f3',
      secondaryColor: '#f8f8f8',
      accentColor: undefined,
      useDarkThemeByDefault: false,
    },
    registration: {
      fields: {
        company: {
          enabled: true,
          required: false,
          label: 'Company',
        },
        title: {
          enabled: true,
          required: false,
          label: 'Title',
        },
        phone: {
          enabled: true,
          required: true,
          label: 'Phone',
        },
        dietaryRestrictions: {
          enabled: false,
          required: false,
          label: 'Dietary Restrictions',
        },
        notes: {
          enabled: false,
          required: false,
          label: 'Notes',
        },
      },
      termsText: undefined,
    },
    communications: {
      defaultFromName: undefined,
      defaultFromEmail: undefined,
      replyToEmail: undefined,
      footerText: undefined,
      autoEmails: {
        registrationConfirmation: false,
        reminderBeforeEvent: false,
        thankYouAfterEvent: false,
      },
    },
  };
}

