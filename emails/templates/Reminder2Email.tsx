import * as React from 'react';
import { Section, Text, Button, Hr } from '@react-email/components';
import { BaseLayout } from '../layout/BaseLayout';

type Reminder2EmailProps = {
  participantName: string;
  eventTitle: string;
  eventDates?: string | null;
  eventLocation?: string | null;
  heroTagline?: string | null;
  ctaUrl?: string;
  supportEmail?: string;
  showPipaNotice?: boolean;
  primaryColor?: string;
};

export default function Reminder2Email({
  participantName,
  eventTitle,
  eventDates,
  eventLocation,
  heroTagline,
  ctaUrl = '#',
  supportEmail,
  showPipaNotice = true,
  primaryColor = '#2563eb',
}: Reminder2EmailProps) {
  return (
    <BaseLayout
      eventTitle={eventTitle}
      heroTagline={heroTagline}
      primaryColor={primaryColor}
      showPipaNotice={showPipaNotice}
      supportEmail={supportEmail}
    >
      <Text style={greeting}>
        안녕하세요, <strong>{participantName}</strong>님,
      </Text>

      <Text style={paragraph}>
        {eventTitle} 등록 마감이 임박했습니다.
      </Text>

      {eventDates && (
        <Text style={paragraph}>
          <strong>일정:</strong> {eventDates}
        </Text>
      )}

      <Text style={paragraph}>
        빠른 시일 내에 등록을 완료해주세요. 등록 마감 후에는 참가 등록이 어려울 수 있습니다.
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={ctaUrl}>
          등록 완료하기
        </Button>
      </Section>

      <Hr style={hr} />

      <Text style={smallText}>
        문의사항이 있으시면 이메일로 연락주세요.
      </Text>
    </BaseLayout>
  );
}

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

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#2563eb',
  color: '#ffffff',
  padding: '12px 24px',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: '600',
  fontSize: '16px',
  display: 'inline-block',
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

