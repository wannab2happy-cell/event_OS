import PDFDocument from 'pdfkit';
import type { Readable } from 'stream';

type CreatePdfOptions = {
  title?: string;
  author?: string;
};

/**
 * 기본 PDF 문서 생성
 */
export function createBaseDocument(opts?: CreatePdfOptions): PDFDocument {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 40,
    info: {
      Title: opts?.title ?? 'Event OS Document',
      Author: opts?.author ?? 'ANDERS Event OS',
    },
  });

  // 기본 폰트는 Helvetica 사용
  // 추후 Pretendard TTF 등록 가능
  return doc;
}

/**
 * 이벤트 브랜딩 정보 가져오기
 */
export async function getEventBranding(eventId: string) {
  const { supabaseAdmin } = await import('@/lib/supabaseAdmin');
  const { data } = await supabaseAdmin
    .from('event_branding')
    .select('*')
    .eq('event_id', eventId)
    .single();

  return data;
}

/**
 * 스트림을 Buffer로 변환
 */
export function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

