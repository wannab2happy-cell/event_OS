import { NextRequest, NextResponse } from 'next/server';
import { getEmailJobLogs } from '@/lib/mail/api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('jobId');
    const filter = searchParams.get('filter') as 'all' | 'success' | 'failed' | null;
    const page = parseInt(searchParams.get('page') || '0', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const search = searchParams.get('search') || '';

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    }

    const result = await getEmailJobLogs(jobId, {
      filter: filter || 'all',
      page,
      pageSize,
      search: search || undefined,
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

