/**
 * Event Create Wizard Component (Phase 6)
 * 
 * Multi-step wizard for creating events
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import EventCreateStepGeneral from './EventCreateStepGeneral';
import EventCreateStepBranding from './EventCreateStepBranding';
import EventCreateStepRegistration from './EventCreateStepRegistration';
import { createEvent } from '@/actions/events/createEvent';
import { getDefaultEventSettings } from '@/lib/settings/defaults';
import toast from 'react-hot-toast';

type WizardStep = 1 | 2 | 3;

export default function EventCreateWizard() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>(1);
  const [saving, setSaving] = useState(false);

  const defaultSettings = getDefaultEventSettings();

  const [general, setGeneral] = useState({
    name: '',
    startDate: '',
    endDate: '',
    location: '',
    timezone: 'Asia/Seoul',
  });

  const [branding, setBranding] = useState<typeof defaultSettings.branding>(defaultSettings.branding);
  const [registration, setRegistration] = useState<typeof defaultSettings.registration>(
    defaultSettings.registration
  );

  const handleNext = () => {
    if (step < 3) {
      setStep((step + 1) as WizardStep);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((step - 1) as WizardStep);
    }
  };

  const handleSubmit = async () => {
    if (!general.name || !general.startDate || !general.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const result = await createEvent({
        name: general.name,
        startDate: general.startDate,
        endDate: general.endDate,
        location: general.location || undefined,
        timezone: general.timezone,
        settingsOverrides: {
          branding,
          registration,
          general: {
            timezone: general.timezone,
            defaultLanguage: 'ko',
            isPublic: true,
          },
        },
      });

      if ('error' in result) {
        toast.error(result.error);
      } else {
        toast.success('Event created successfully');
        router.push(`/admin/events/${result.id}/dashboard`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            {s < 3 && (
              <div
                className={`flex-1 h-1 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div>
        {step === 1 && (
          <EventCreateStepGeneral value={general} onChange={setGeneral} />
        )}
        {step === 2 && (
          <EventCreateStepBranding value={branding} onChange={setBranding} />
        )}
        {step === 3 && (
          <EventCreateStepRegistration value={registration} onChange={setRegistration} />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="secondary" onClick={handlePrev} disabled={step === 1}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        {step < 3 ? (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Creating...' : 'Create Event'}
          </Button>
        )}
      </div>
    </div>
  );
}

