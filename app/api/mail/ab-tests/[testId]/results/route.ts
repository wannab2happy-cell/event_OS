import { NextRequest, NextResponse } from 'next/server';
import { getABTestResults } from '@/lib/mail/analytics';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ testId?: string }> }
) {
  try {
    const resolvedParams = await params;
    const testId = resolvedParams?.testId;

    if (!testId) {
      return NextResponse.json({ error: 'Test ID is required' }, { status: 400 });
    }

    const results = await getABTestResults(testId);

    return NextResponse.json({ results });
  } catch (err) {
    console.error('Failed to fetch AB test results:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

