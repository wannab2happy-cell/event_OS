import React from 'react';
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { TABLE_CARD_SIZE, getPrimaryColor, VIP_GOLD } from '@/lib/pdf/base';
import { truncateText } from '@/lib/pdf/utils';

interface TableParticipant {
  name: string;
  seatNumber?: number | null;
  isVip?: boolean;
}

interface TableCardLayoutProps {
  tableName: string;
  participants: TableParticipant[];
  isVipTable?: boolean;
  primaryColor?: string | null;
  qrCodeDataUrl?: string; // 선택적 QR 코드
}

export default function TableCardLayout({
  tableName,
  participants,
  isVipTable = false,
  primaryColor,
  qrCodeDataUrl,
}: TableCardLayoutProps) {
  const primary = getPrimaryColor(primaryColor);
  const borderColor = isVipTable ? VIP_GOLD : primary;

  const styles = StyleSheet.create({
    card: {
      width: TABLE_CARD_SIZE.width,
      height: TABLE_CARD_SIZE.height,
      border: `2pt solid ${borderColor}`,
      borderRadius: 8,
      padding: 12,
      backgroundColor: isVipTable ? '#FFF9E6' : '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
    },
    header: {
      borderBottom: `2pt solid ${borderColor}`,
      paddingBottom: 8,
      marginBottom: 8,
    },
    tableName: {
      fontSize: 16,
      fontWeight: 600,
      color: borderColor,
      textAlign: 'center',
      marginBottom: 4,
    },
    vipLabel: {
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
    participantsList: {
      flex: 1,
      marginTop: 8,
    },
    participantRow: {
      flexDirection: 'row',
      marginBottom: 4,
      paddingVertical: 2,
    },
    seatNumber: {
      fontSize: 8,
      fontWeight: 500,
      color: '#666666',
      width: 30,
      marginRight: 6,
    },
    participantName: {
      fontSize: 9,
      fontWeight: 400,
      color: '#000000',
      flex: 1,
    },
    vipIndicator: {
      fontSize: 7,
      color: VIP_GOLD,
      fontWeight: 600,
      marginLeft: 4,
    },
    qrContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
      marginBottom: 4,
    },
    qrCode: {
      width: 80,
      height: 80,
    },
    footer: {
      borderTop: `1pt solid ${borderColor}`,
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
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.tableName}>{tableName}</Text>
        {isVipTable && (
          <View style={{ marginBottom: 4 }}>
            <Text style={styles.vipLabel}>VIP TABLE</Text>
          </View>
        )}
      </View>

      <View style={styles.participantsList}>
        {participants.length > 0 ? (
          participants.map((participant, index) => (
            <View key={index} style={styles.participantRow}>
              {participant.seatNumber && (
                <Text style={styles.seatNumber}>#{participant.seatNumber}</Text>
              )}
              <Text style={styles.participantName}>
                {truncateText(participant.name, 20)}
              </Text>
              {participant.isVip && (
                <Text style={styles.vipIndicator}>VIP</Text>
              )}
            </View>
          ))
        ) : (
          <Text style={{ fontSize: 8, color: '#999999', textAlign: 'center' }}>
            배정된 참가자 없음
          </Text>
        )}
      </View>

      {qrCodeDataUrl && (
        <View style={styles.qrContainer}>
          <Image src={qrCodeDataUrl} style={styles.qrCode} />
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {participants.length}명 배정
        </Text>
      </View>
    </View>
  );
}

