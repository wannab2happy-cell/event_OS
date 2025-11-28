import React from 'react';
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { BADGE_SIZE, getPrimaryColor, VIP_GOLD } from '@/lib/pdf/base';
import { truncateText } from '@/lib/pdf/utils';

interface ParticipantBadgeLayoutProps {
  participantName: string;
  company?: string | null;
  position?: string | null;
  isVip?: boolean;
  vipLevel?: number | null;
  eventTitle: string;
  primaryColor?: string | null;
  qrCodeDataUrl: string; // 미리 생성된 QR 코드 Data URL
}

export default function ParticipantBadgeLayout({
  participantName,
  company,
  position,
  isVip = false,
  vipLevel,
  eventTitle,
  primaryColor,
  qrCodeDataUrl,
}: ParticipantBadgeLayoutProps) {
  const primary = getPrimaryColor(primaryColor);

  const styles = StyleSheet.create({
    badge: {
      width: BADGE_SIZE.width,
      height: BADGE_SIZE.height,
      border: isVip ? `3pt solid ${VIP_GOLD}` : `2pt solid ${primary}`,
      borderRadius: 8,
      padding: 12,
      backgroundColor: isVip ? '#FFF9E6' : '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    header: {
      borderBottom: isVip ? `2pt solid ${VIP_GOLD}` : `2pt solid ${primary}`,
      paddingBottom: 8,
      marginBottom: 8,
    },
    eventTitle: {
      fontSize: 8,
      color: isVip ? VIP_GOLD : primary,
      fontWeight: 500,
      textAlign: 'center',
      marginBottom: 4,
    },
    vipBadge: {
      backgroundColor: VIP_GOLD,
      color: '#FFFFFF',
      fontSize: 7,
      fontWeight: 600,
      padding: 2,
      paddingHorizontal: 6,
      borderRadius: 4,
      textAlign: 'center',
      marginBottom: 4,
    },
    name: {
      fontSize: isVip ? 22 : 20,
      fontWeight: 600,
      color: '#000000',
      textAlign: 'center',
      marginBottom: 4,
    },
    company: {
      fontSize: 10,
      fontWeight: 500,
      color: '#333333',
      textAlign: 'center',
      marginBottom: 2,
    },
    position: {
      fontSize: 8,
      color: '#666666',
      textAlign: 'center',
      marginBottom: 8,
    },
    qrContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 'auto',
      marginBottom: 8,
    },
    qrCode: {
      width: 120,
      height: 120,
    },
    footer: {
      borderTop: `1pt solid ${isVip ? VIP_GOLD : '#E5E5E5'}`,
      paddingTop: 4,
      marginTop: 4,
    },
    footerText: {
      fontSize: 6,
      color: '#999999',
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.badge}>
      <View style={styles.header}>
        <Text style={styles.eventTitle}>{truncateText(eventTitle, 30)}</Text>
        {isVip && (
          <View style={{ marginBottom: 4 }}>
            <Text style={styles.vipBadge}>VIP Level {vipLevel || 1}</Text>
          </View>
        )}
      </View>

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={styles.name}>{truncateText(participantName, 20)}</Text>
        {company && (
          <Text style={styles.company}>{truncateText(company, 25)}</Text>
        )}
        {position && (
          <Text style={styles.position}>{truncateText(position, 25)}</Text>
        )}
      </View>

      <View style={styles.qrContainer}>
        <Image src={qrCodeDataUrl} style={styles.qrCode} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Scan for Check-in</Text>
      </View>
    </View>
  );
}
