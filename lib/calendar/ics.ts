/**
 * ICS (iCalendar) 파일 생성 유틸리티
 */

interface GenerateEventICSOptions {
  uid: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  url?: string;
  timezone?: string;
}

/**
 * 이벤트 정보를 기반으로 ICS 파일 내용 생성
 */
export function generateEventICS(options: GenerateEventICSOptions): string {
  const {
    uid,
    title,
    description,
    start,
    end,
    location,
    url,
    timezone = 'Asia/Seoul',
  } = options;

  // 날짜를 UTC로 변환 (ISO 8601 형식)
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startDate = formatDate(start);
  const endDate = formatDate(end);
  const now = formatDate(new Date());

  // ICS 파일 내용 생성
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Event OS//Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${escapeICSValue(title)}`,
  ];

  if (description) {
    lines.push(`DESCRIPTION:${escapeICSValue(description)}`);
  }

  if (location) {
    lines.push(`LOCATION:${escapeICSValue(location)}`);
  }

  if (url) {
    lines.push(`URL:${escapeICSValue(url)}`);
  }

  lines.push('STATUS:CONFIRMED');
  lines.push('SEQUENCE:0');
  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

/**
 * ICS 값 이스케이프 처리
 */
function escapeICSValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

/**
 * 이벤트 정보로부터 ICS 생성 헬퍼
 */
export function createEventICS(
  eventId: string,
  eventTitle: string,
  startDate: string | Date,
  endDate: string | Date,
  venueName?: string | null,
  venueAddress?: string | null,
  eventUrl?: string
): string {
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);

  const location = [venueName, venueAddress].filter(Boolean).join(', ') || undefined;

  const description = `${eventTitle}에 참가해주셔서 감사합니다.`;

  return generateEventICS({
    uid: `event-${eventId}@event-os.com`,
    title: eventTitle,
    description,
    start,
    end,
    location,
    url: eventUrl,
  });
}

