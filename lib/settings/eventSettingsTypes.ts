/**
 * Event Settings Type Definitions
 * 
 * TypeScript interfaces for event settings stored in events.settings jsonb
 */

/**
 * Branding Settings
 */
export interface BrandingSettings {
  logoUrl?: string;
  heroImageUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  useDarkThemeByDefault?: boolean;
}

/**
 * Registration Field Configuration
 */
export interface RegistrationFieldConfig {
  enabled: boolean;
  required: boolean;
  label: string;
}

/**
 * Registration Settings
 */
export interface RegistrationSettings {
  fields: {
    company?: RegistrationFieldConfig;
    title?: RegistrationFieldConfig;
    phone?: RegistrationFieldConfig;
    dietaryRestrictions?: RegistrationFieldConfig;
    notes?: RegistrationFieldConfig;
  };
  termsText?: string;
}

/**
 * Communication Settings
 */
export interface CommunicationSettings {
  defaultFromName?: string;
  defaultFromEmail?: string;
  replyToEmail?: string;
  footerText?: string;
  autoEmails: {
    registrationConfirmation: boolean;
    reminderBeforeEvent: boolean;
    thankYouAfterEvent: boolean;
  };
}

/**
 * General Settings
 */
export interface GeneralSettings {
  eventNameOverride?: string;
  timezone?: string;
  isPublic?: boolean;
  defaultLanguage?: 'ko' | 'en' | 'ja' | 'zh' | 'other';
}

/**
 * Complete Event Settings
 */
export interface EventSettings {
  general: GeneralSettings;
  branding: BrandingSettings;
  registration: RegistrationSettings;
  communications: CommunicationSettings;
}

