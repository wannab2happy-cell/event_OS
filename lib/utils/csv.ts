/**
 * CSV 유틸리티 함수
 */

/**
 * CSV 문자열 생성
 * @param headers CSV 헤더 배열
 * @param rows 데이터 행 배열
 * @returns CSV 문자열 (UTF-8 BOM 포함)
 */
export function toCsv(
  headers: string[],
  rows: (string | number | null | undefined)[][]
): string {
  const headerLine = headers.join(',');
  const dataLines = rows.map((row) =>
    row
      .map((value) => {
        const v = value ?? '';
        // 콤마/따옴표/줄바꿈이 있으면 "로 감싸고 내부 "는 ""로 escape
        const s = String(v);
        if (/[",\n]/.test(s)) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      })
      .join(',')
  );
  return '\uFEFF' + [headerLine, ...dataLines].join('\n');
}

/**
 * 날짜 포맷팅 (CSV용)
 */
export function formatDateForCsv(dateString: string | null | undefined): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16).replace('T', ' ');
  } catch {
    return dateString;
  }
}

