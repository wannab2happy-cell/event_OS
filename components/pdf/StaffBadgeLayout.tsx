import React from 'react';
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { BADGE_SIZE, getPrimaryColor } from '@/lib/pdf/base';
import { truncateText } from '@/lib/pdf/utils';

interface StaffBadgeLayoutProps {
  staffName: string;
  role: 'staff' | 'lead' | 'admin';
  eventTitle: string;
  primaryColor?: string | null;
  qrCodeDataUrl?: string; // 선택적 QR 코드
}

export default function StaffBadgeLayout({
  staffName,
  role,
  eventTitle,
  primaryColor,
  qrCodeDataUrl,
}: StaffBadgeLayoutProps) {
  const primary = getPrimaryColor(primaryColor);
  
  // 역할별 색상 강조
  const roleColor = role === 'admin' ? '#DC2626' : role === 'lead' ? '#059669' : primary;
  const roleLabel = role === 'admin' ? 'ADMIN' : role === 'lead' ? 'LEAD STAFF' : 'STAFF';

  const styles = StyleSheet.create({
    badge: {
      width: BADGE_SIZE.width,
      height: BADGE_SIZE.height,
      border: `3pt solid ${roleColor}`,
      borderRadius: 8,
      padding: 12,
      backgroundColor: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    header: {
      borderBottom: `2pt solid ${roleColor}`,
      paddingBottom: 8,
      marginBottom: 8,
    },
    eventTitle: {
      fontSize: 8,
      color: roleColor,
      fontWeight: 500,
      textAlign: 'center',
      marginBottom: 4,
    },
    staffBadge: {
      backgroundColor: roleColor,
      color: '#FFFFFF',
      fontSize: 8,
      fontWeight: 600,
      padding: 3,
      paddingHorizontal: 8,
      borderRadius: 4,
      textAlign: 'center',
      marginBottom: 4,
    },
    name: {
      fontSize: 20,
      fontWeight: 600,
      color: '#000000',
      textAlign: 'center',
      marginBottom: 4,
    },
    roleText: {
      fontSize: 10,
      fontWeight: 500,
      color: roleColor,
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
      width: 100,
      height: 100,
    },
    footer: {
      borderTop: `1pt solid #E5E5E5`,
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
        <View style={{ marginBottom: 4 }}>
          <Text style={styles.staffBadge}>{roleLabel}</Text>
        </View>
      </View>

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={styles.name}>{truncateText(staffName, 20)}</Text>
        <Text style={styles.roleText}>{roleLabel}</Text>
      </View>

      {qrCodeDataUrl && (
        <View style={styles.qrContainer}>
          <Image src={qrCodeDataUrl} style={styles.qrCode} />
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Event Staff</Text>
      </View>
    </View>
  );
}

