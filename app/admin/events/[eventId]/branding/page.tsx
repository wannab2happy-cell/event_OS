'use server';

export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import EventBrandingClient from '@/components/admin/EventBrandingClient';

type BrandingPageProps = {
  params: Promise<{ eventId?: string }>;
};

export default async function EventBrandingPage({ params }: BrandingPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  return <EventBrandingClient eventId={eventId} />;
}

