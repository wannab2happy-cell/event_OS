import { StyleSheet, Font } from '@react-pdf/renderer';
import { getFontFamily } from './fonts';

/**
 * PDF 캔버스 프리셋
 */

// A4 크기 (210mm × 297mm, 포인트 단위)
export const A4_SIZE = {
  width: 595.28, // 210mm in points
  height: 841.89, // 297mm in points
};

// Badge 크기 (90mm × 120mm)
export const BADGE_SIZE = {
  width: 255.12, // 90mm in points
  height: 340.16, // 120mm in points
};

// Table Card 크기 (A4 2-up 기준, 각 카드)
export const TABLE_CARD_SIZE = {
  width: 255.12, // A4 가로 절반
  height: 340.16, // A4 세로 절반
};

// A3 크기 (297mm × 420mm)
export const A3_SIZE = {
  width: 841.89, // 297mm in points
  height: 1190.55, // 420mm in points
};

/**
 * 기본 마진 (인쇄용)
 */
export const DEFAULT_MARGIN = 20; // 20pt

/**
 * 공통 스타일 시트
 */
export const baseStyles = StyleSheet.create({
  page: {
    fontFamily: getFontFamily(),
    fontSize: 10,
    paddingTop: DEFAULT_MARGIN,
    paddingBottom: DEFAULT_MARGIN,
    paddingLeft: DEFAULT_MARGIN,
    paddingRight: DEFAULT_MARGIN,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  text: {
    fontFamily: getFontFamily(),
    fontSize: 10,
    color: '#000000',
  },
  textBold: {
    fontFamily: getFontFamily(),
    fontSize: 10,
    fontWeight: 600,
    color: '#000000',
  },
  textMedium: {
    fontFamily: getFontFamily(),
    fontSize: 10,
    fontWeight: 500,
    color: '#000000',
  },
  title: {
    fontFamily: getFontFamily(),
    fontSize: 18,
    fontWeight: 600,
    color: '#000000',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: getFontFamily(),
    fontSize: 14,
    fontWeight: 500,
    color: '#000000',
    marginBottom: 8,
  },
});

/**
 * 색상 변환 헬퍼
 * hex 색상을 RGB로 변환
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * primary_color 기반 색상 생성
 */
export function getPrimaryColor(primaryColor?: string | null): string {
  return primaryColor || '#2563eb';
}

/**
 * VIP Gold 색상
 */
export const VIP_GOLD = '#D4AF37';
export const VIP_GOLD_RGB = hexToRgb(VIP_GOLD);

