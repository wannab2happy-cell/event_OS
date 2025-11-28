/**
 * Pretendard 폰트 Base64 임베딩
 * 
 * 실제 사용 시:
 * 1. Pretendard 폰트 파일을 다운로드 (https://github.com/orioncactus/pretendard)
 * 2. 폰트 파일을 Base64로 인코딩
 * 3. 아래 상수에 Base64 문자열을 입력
 * 
 * 예시:
 * const fontBase64 = 'data:font/truetype;charset=utf-8;base64,AAEAAAAOAIAAAwBgT1MvMj...';
 */

// Pretendard Regular (400)
// TODO: 실제 폰트 파일을 Base64로 인코딩하여 아래에 입력
export const PRETENDARD_REGULAR = '';

// Pretendard Medium (500)
// TODO: 실제 폰트 파일을 Base64로 인코딩하여 아래에 입력
export const PRETENDARD_MEDIUM = '';

// Pretendard SemiBold (600)
// TODO: 실제 폰트 파일을 Base64로 인코딩하여 아래에 입력
export const PRETENDARD_SEMIBOLD = '';

/**
 * 폰트 등록 함수
 * @react-pdf/renderer의 Font.register()에 사용
 */
export function registerPretendardFonts() {
  // 폰트가 설정되지 않은 경우 시스템 폰트 사용
  // 실제 폰트 Base64가 있으면 아래 주석을 해제하고 사용
  
  /*
  if (PRETENDARD_REGULAR) {
    Font.register({
      family: 'Pretendard',
      fonts: [
        {
          src: PRETENDARD_REGULAR,
          fontWeight: 400,
        },
        {
          src: PRETENDARD_MEDIUM,
          fontWeight: 500,
        },
        {
          src: PRETENDARD_SEMIBOLD,
          fontWeight: 600,
        },
      ],
    });
  }
  */
  
  // 임시로 시스템 폰트 사용
  // 실제 운영 시에는 Pretendard 폰트를 등록해야 함
}

/**
 * 폰트 패밀리 이름 반환
 */
export function getFontFamily(): string {
  // 폰트가 등록되어 있으면 'Pretendard', 아니면 시스템 폰트 사용
  return 'Pretendard'; // 또는 '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
}

