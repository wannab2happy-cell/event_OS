import React from 'react';
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { A4_SIZE, A3_SIZE, getPrimaryColor } from '@/lib/pdf/base';

interface QrPosterLayoutProps {
  title: string;
  subtitle?: string;
  qrCodeDataUrl: string;
  primaryColor?: string | null;
  size?: 'A4' | 'A3';
}

export default function QrPosterLayout({
  title,
  subtitle,
  qrCodeDataUrl,
  primaryColor,
  size = 'A4',
}: QrPosterLayoutProps) {
  const primary = getPrimaryColor(primaryColor);
  const pageSize = size === 'A3' ? A3_SIZE : A4_SIZE;

  const styles = StyleSheet.create({
    page: {
      width: pageSize.width,
      height: pageSize.height,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
      padding: 40,
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    title: {
      fontSize: size === 'A3' ? 36 : 28,
      fontWeight: 600,
      color: primary,
      textAlign: 'center',
      marginBottom: 12,
    },
    subtitle: {
      fontSize: size === 'A3' ? 20 : 16,
      fontWeight: 400,
      color: '#666666',
      textAlign: 'center',
      marginBottom: 30,
    },
    qrContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      padding: 20,
      backgroundColor: '#F9FAFB',
      borderRadius: 12,
    },
    qrCode: {
      width: size === 'A3' ? 400 : 300,
      height: size === 'A3' ? 400 : 300,
    },
    instruction: {
      fontSize: size === 'A3' ? 18 : 14,
      fontWeight: 500,
      color: '#333333',
      textAlign: 'center',
      marginTop: 20,
    },
    footer: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      right: 0,
      textAlign: 'center',
    },
    footerText: {
      fontSize: 10,
      color: '#999999',
    },
  });

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        
        <View style={styles.qrContainer}>
          <Image src={qrCodeDataUrl} style={styles.qrCode} />
        </View>

        <Text style={styles.instruction}>
          QR 코드를 스캔하여 체크인하세요
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Event OS - Check-in System</Text>
      </View>
    </View>
  );
}

