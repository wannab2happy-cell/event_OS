import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Hr,
  Link,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';

interface ConfirmationEmailProps {
  participantName: string;
  eventName: string;
  eventLink: string;
  registerLink: string;
  flightTicketNo: string | null;
  guestConfirmationNo: string | null;
  isTravelConfirmed: boolean;
  isHotelConfirmed: boolean;
  logoUrl?: string | null;
  primaryColor?: string;
}

const main = {
  backgroundColor: '#f5f5f5',
  margin: '0 auto',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  margin: '40px auto',
  padding: '0',
  width: '600px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
};

const header = {
  background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
  padding: '40px 30px',
  textAlign: 'center' as const,
  borderRadius: '8px 8px 0 0',
};

const heading = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  lineHeight: '1.3',
};

const content = {
  padding: '40px 30px',
};

const paragraph = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 20px 0',
};

const highlightBox = {
  backgroundColor: '#f8f9fa',
  borderRadius: '6px',
  padding: '25px',
  marginTop: '20px',
  borderLeft: '4px solid #2563eb',
};

const infoBox = {
  backgroundColor: '#ffffff',
  border: '2px solid #10b981',
  borderRadius: '6px',
  padding: '20px',
  marginBottom: '20px',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '18px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '16px 40px',
  margin: '20px 0',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
};

const footer = {
  backgroundColor: '#f8f9fa',
  padding: '30px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e5e7eb',
  borderRadius: '0 0 8px 8px',
};

const ConfirmationEmail = ({
  participantName = '참가자',
  eventName = '이벤트',
  eventLink = 'https://example.com',
  registerLink = 'https://example.com',
  flightTicketNo,
  guestConfirmationNo,
  isTravelConfirmed,
  isHotelConfirmed,
  logoUrl,
  primaryColor = '#2563eb',
}: ConfirmationEmailProps) => {
  const previewText = `${participantName} 님의 ${eventName} 예약이 최종 확정되었습니다!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* 헤더: 브랜딩 */}
          <Section style={header}>
            {logoUrl && (
              <Img
                src={logoUrl}
                width="200"
                height="auto"
                alt={eventName}
                style={{ marginBottom: '20px', maxWidth: '200px' }}
              />
            )}
            <Text style={heading}>{eventName}</Text>
          </Section>

          {/* 본문 */}
          <Section style={content}>
            {/* 인사말 */}
            <Text style={paragraph}>
              <strong>{participantName}</strong> 님, <strong>{eventName}</strong>에 오신 것을 환영합니다.
            </Text>
            <Text style={{ ...paragraph, color: '#666666' }}>
              모든 예약 절차가 완료되어 최종 확정 정보를 안내해 드립니다.
            </Text>

            {/* 항공 예약 확정 정보 */}
            {isTravelConfirmed && flightTicketNo && (
              <Section style={highlightBox}>
                <Text style={{ ...paragraph, fontWeight: 'bold', color: '#333333', fontSize: '20px', marginBottom: '20px' }}>
                  <span style={{ display: 'inline-block', width: '24px', height: '24px', backgroundColor: '#10b981', borderRadius: '50%', marginRight: '10px', textAlign: 'center', lineHeight: '24px', color: 'white', fontSize: '14px' }}>✓</span>
                  항공 예약 확정 정보
                </Text>
                
                <Section style={infoBox}>
                  <Row>
                    <Column>
                      <Text style={{ ...paragraph, fontSize: '16px', fontWeight: '600', color: '#059669', margin: '0' }}>
                        항공권 번호
                      </Text>
                    </Column>
                    <Column align="right">
                      <Text style={{ ...paragraph, fontSize: '24px', fontWeight: '700', color: '#047857', margin: '0', letterSpacing: '1px' }}>
                        {flightTicketNo}
                      </Text>
                    </Column>
                  </Row>
                </Section>
              </Section>
            )}

            {/* 호텔 숙박 확정 정보 */}
            {isHotelConfirmed && guestConfirmationNo && (
              <Section style={{ ...highlightBox, borderLeftColor: '#8b5cf6' }}>
                <Text style={{ ...paragraph, fontWeight: 'bold', color: '#333333', fontSize: '20px', marginBottom: '20px' }}>
                  <span style={{ display: 'inline-block', width: '24px', height: '24px', backgroundColor: '#10b981', borderRadius: '50%', marginRight: '10px', textAlign: 'center', lineHeight: '24px', color: 'white', fontSize: '14px' }}>✓</span>
                  호텔 숙박 확정 정보
                </Text>
                
                <Section style={infoBox}>
                  <Row>
                    <Column>
                      <Text style={{ ...paragraph, fontSize: '16px', fontWeight: '600', color: '#059669', margin: '0' }}>
                        예약 확인 번호
                      </Text>
                    </Column>
                    <Column align="right">
                      <Text style={{ ...paragraph, fontSize: '24px', fontWeight: '700', color: '#047857', margin: '0', letterSpacing: '1px' }}>
                        {guestConfirmationNo}
                      </Text>
                    </Column>
                  </Row>
                </Section>
              </Section>
            )}

            {/* CTA 버튼 */}
            <Section style={{ textAlign: 'center' as const, marginTop: '30px' }}>
              <Button href={eventLink} style={{ ...button, backgroundColor: primaryColor }}>
                나의 QR PASS 확인
              </Button>
              <Link 
                href={registerLink} 
                style={{ 
                  ...paragraph, 
                  color: primaryColor, 
                  textDecoration: 'underline',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'inline-block',
                  marginTop: '10px',
                }}
              >
                정보 수정 바로가기 →
              </Link>
            </Section>
          </Section>

          {/* 푸터 */}
          <Section style={footer}>
            <Text style={{ ...paragraph, fontSize: '14px', color: '#666666', margin: '0 0 10px 0' }}>
              행사장에서 뵙기를 기대합니다. 궁금한 점은 언제든지 문의해 주세요.
            </Text>
            <Text style={{ ...paragraph, fontSize: '14px', color: '#999999', margin: '0' }}>
              {eventName} 드림
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ConfirmationEmail;


