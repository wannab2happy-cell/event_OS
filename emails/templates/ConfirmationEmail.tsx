import * as React from 'react';
import { Section, Text, Button, Hr, Row, Column } from '@react-email/components';
import { BaseLayout } from '../layout/BaseLayout';

interface ConfirmationEmailProps {
  participantName: string;
  eventName: string;
  eventTitle: string;
  eventLink: string;
  registerLink: string;
  flightTicketNo: string | null;
  guestConfirmationNo: string | null;
  isTravelConfirmed: boolean;
  isHotelConfirmed: boolean;
  heroTagline?: string | null;
  primaryColor?: string;
  supportEmail?: string;
  showPipaNotice?: boolean;
}

const ConfirmationEmail = ({
  participantName = '참가자',
  eventName = '이벤트',
  eventTitle,
  eventLink = 'https://example.com',
  registerLink = 'https://example.com',
  flightTicketNo,
  guestConfirmationNo,
  isTravelConfirmed,
  isHotelConfirmed,
  heroTagline,
  primaryColor = '#2563eb',
  supportEmail,
  showPipaNotice = true,
}: ConfirmationEmailProps) => {
  return (
    <BaseLayout
      eventTitle={eventTitle || eventName}
      heroTagline={heroTagline}
      primaryColor={primaryColor}
      showPipaNotice={showPipaNotice}
      supportEmail={supportEmail}
    >
      <Text style={greeting}>
        <strong>{participantName}</strong> 님, <strong>{eventName}</strong>에 오신 것을 환영합니다.
      </Text>

      <Text style={paragraph}>
        모든 예약 절차가 완료되어 최종 확정 정보를 안내해 드립니다.
      </Text>

      {/* 항공 예약 확정 정보 */}
      {isTravelConfirmed && flightTicketNo && (
        <Section style={highlightBox}>
          <Text style={sectionTitle}>
            <span style={checkIcon}>✓</span>
            항공 예약 확정 정보
          </Text>

          <Section style={infoBox}>
            <Row>
              <Column>
                <Text style={labelText}>항공권 번호</Text>
              </Column>
              <Column align="right">
                <Text style={valueText}>{flightTicketNo}</Text>
              </Column>
            </Row>
          </Section>
        </Section>
      )}

      {/* 호텔 숙박 확정 정보 */}
      {isHotelConfirmed && guestConfirmationNo && (
        <Section style={{ ...highlightBox, borderLeftColor: '#8b5cf6' }}>
          <Text style={sectionTitle}>
            <span style={checkIcon}>✓</span>
            호텔 숙박 확정 정보
          </Text>

          <Section style={infoBox}>
            <Row>
              <Column>
                <Text style={labelText}>예약 확인 번호</Text>
              </Column>
              <Column align="right">
                <Text style={valueText}>{guestConfirmationNo}</Text>
              </Column>
            </Row>
          </Section>
        </Section>
      )}

      {/* CTA 버튼 */}
      <Section style={buttonContainer}>
        <Button style={{ ...button, backgroundColor: primaryColor }} href={eventLink}>
          나의 QR PASS 확인
        </Button>
      </Section>

      <Hr style={hr} />

      <Text style={smallText}>
        행사장에서 뵙기를 기대합니다. 궁금한 점은 언제든지 문의해 주세요.
      </Text>
    </BaseLayout>
  );
};

const greeting = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#222222',
  margin: '0 0 16px 0',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#333333',
  margin: '0 0 16px 0',
};

const highlightBox = {
  backgroundColor: '#f8f9fa',
  borderRadius: '6px',
  padding: '25px',
  margin: '20px 0',
  borderLeft: '4px solid #2563eb',
};

const sectionTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#333333',
  margin: '0 0 20px 0',
  lineHeight: '1.4',
};

const checkIcon = {
  display: 'inline-block',
  width: '24px',
  height: '24px',
  backgroundColor: '#10b981',
  borderRadius: '50%',
  marginRight: '10px',
  textAlign: 'center' as const,
  lineHeight: '24px',
  color: 'white',
  fontSize: '14px',
};

const infoBox = {
  backgroundColor: '#ffffff',
  border: '2px solid #10b981',
  borderRadius: '6px',
  padding: '20px',
  marginBottom: '20px',
};

const labelText = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#059669',
  margin: '0',
  lineHeight: '1.6',
};

const valueText = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#047857',
  margin: '0',
  letterSpacing: '1px',
  lineHeight: '1.4',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#2563eb',
  color: '#ffffff',
  padding: '16px 40px',
  textDecoration: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  fontSize: '18px',
  display: 'inline-block',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
};

const hr = {
  borderColor: '#e5e5e5',
  margin: '30px 0',
};

const smallText = {
  fontSize: '14px',
  color: '#666666',
  margin: '0',
  lineHeight: '1.6',
};

export default ConfirmationEmail;

