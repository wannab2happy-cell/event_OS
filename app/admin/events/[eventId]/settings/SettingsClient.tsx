/**
 * Settings Client Component (Phase 5)
 * 
 * Manages settings state and tab navigation
 */

'use client';

import { useState } from 'react';
import SettingsTabs, { type SettingsTab } from '@/components/settings/SettingsTabs';
import GeneralSettingsForm from '@/components/settings/GeneralSettingsForm';
import BrandingSettingsForm from '@/components/settings/BrandingSettingsForm';
import RegistrationSettingsForm from '@/components/settings/RegistrationSettingsForm';
import CommunicationSettingsForm from '@/components/settings/CommunicationSettingsForm';
import { updateEventSettings } from '@/actions/settings/updateEventSettings';
import type { EventSettings } from '@/lib/settings/eventSettingsTypes';
import toast from 'react-hot-toast';

interface SettingsClientProps {
  eventId: string;
  initialSettings: EventSettings;
}

export default function SettingsClient({ eventId, initialSettings }: SettingsClientProps) {
  const [settings, setSettings] = useState<EventSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [saving, setSaving] = useState<Record<SettingsTab, boolean>>({
    general: false,
    branding: false,
    registration: false,
    communications: false,
  });

  const handleSave = async (tab: SettingsTab, partial: Partial<EventSettings>) => {
    setSaving((prev) => ({ ...prev, [tab]: true }));
    try {
      const updated = await updateEventSettings(eventId, partial);
      setSettings(updated);
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving((prev) => ({ ...prev, [tab]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div>
        {activeTab === 'general' && (
          <GeneralSettingsForm
            value={settings.general}
            onChange={(next) => setSettings({ ...settings, general: next })}
            onSave={() => handleSave('general', { general: settings.general })}
            saving={saving.general}
          />
        )}

        {activeTab === 'branding' && (
          <BrandingSettingsForm
            value={settings.branding}
            onChange={(next) => setSettings({ ...settings, branding: next })}
            onSave={() => handleSave('branding', { branding: settings.branding })}
            saving={saving.branding}
            eventId={eventId}
          />
        )}

        {activeTab === 'registration' && (
          <RegistrationSettingsForm
            value={settings.registration}
            onChange={(next) => setSettings({ ...settings, registration: next })}
            onSave={() => handleSave('registration', { registration: settings.registration })}
            saving={saving.registration}
          />
        )}

        {activeTab === 'communications' && (
          <CommunicationSettingsForm
            value={settings.communications}
            onChange={(next) => setSettings({ ...settings, communications: next })}
            onSave={() =>
              handleSave('communications', { communications: settings.communications })
            }
            saving={saving.communications}
          />
        )}
      </div>
    </div>
  );
}

