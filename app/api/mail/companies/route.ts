import { NextRequest, NextResponse } from 'next/server';
import { getParticipantCompanies } from '@/lib/mail/segmentation';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'eventId is required' }, { status: 400 });
    }

    const companies = await getParticipantCompanies(eventId);

    return NextResponse.json({ companies });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}




