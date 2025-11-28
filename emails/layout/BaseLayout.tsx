import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
} from '@react-email/components';

type BaseLayoutProps = {
  children: React.ReactNode;
  eventTitle: string;
  heroTagline?: string | null;
  primaryColor?: string | null;
  showPipaNotice?: boolean;
  supportEmail?: string;
};

export function BaseLayout({
  children,
  eventTitle,
  heroTagline,
  primaryColor = '#2563eb',
  showPipaNotice = true,
  supportEmail = 'support@event-os.com',
}: BaseLayoutProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* 헤더 */}
          <Section style={header}>
            <Text style={headerTitle}>{eventTitle}</Text>
            {heroTagline && (
              <Text style={headerSubtitle}>{heroTagline}</Text>
            )}
          </Section>

          {/* 본문 */}
          <Section style={content}>
            {children}
          </Section>

          {/* PIPA 푸터 */}
          {showPipaNotice && (
            <Section style={footer}>
              <Hr style={hr} />
              <Text style={footerText}>
                본 메일은 행사 참가 안내를 위해 발송되었습니다.
              </Text>
              <Text style={footerText}>
                개인정보 관련 문의는{' '}
                <Link href={`mailto:${supportEmail}`} style={link}>
                  {supportEmail}
                </Link>
                로 부탁드립니다.
              </Text>
              <Text style={footerText}>
                추가 안내 수신을 원치 않으시면 운영팀에 연락해 주세요.
              </Text>
            </Section>
          )}
        </Container>
      </Body>
    </Html>
  );
}

// 스타일 정의 (다크모드 대응)
const main = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  backgroundColor: '#ffffff',
  color: '#222222',
};

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
};

const header = {
  backgroundColor: '#2563eb',
  padding: '40px 30px',
  textAlign: 'center' as const,
  borderRadius: '8px 8px 0 0',
};

const headerTitle = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
  lineHeight: '1.4',
};

const headerSubtitle = {
  color: '#e0e7ff',
  fontSize: '14px',
  margin: '0',
  lineHeight: '1.4',
};

const content = {
  backgroundColor: '#ffffff',
  padding: '40px 30px',
  borderRadius: '0 0 8px 8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
};

const footer = {
  padding: '20px 30px',
  backgroundColor: '#f5f5f5',
};

const hr = {
  borderColor: '#e5e5e5',
  margin: '20px 0',
};

const footerText = {
  fontSize: '12px',
  color: '#666666',
  margin: '4px 0',
  lineHeight: '1.6',
};

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
};

