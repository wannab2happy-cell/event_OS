'use client';

import { useEffect, useState } from 'react';
import { saveSubscriptionAction } from '@/actions/push/saveSubscription';

interface PushNotificationRegisterProps {
  eventId: string;
  participantId: string;
}

export default function PushNotificationRegister({
  eventId,
  participantId,
}: PushNotificationRegisterProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Service Worker 및 Push 지원 여부 확인
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window
    ) {
      setIsSupported(true);
      registerServiceWorker();
    } else {
      setIsSupported(false);
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      // Service Worker 등록
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      // Service Worker가 활성화될 때까지 대기
      await navigator.serviceWorker.ready;

      // Push 구독
      await subscribeToPush(registration);
    } catch (err: any) {
      console.error('Service Worker registration error:', err);
      setError('Service Worker 등록에 실패했습니다.');
    }
  };

  const subscribeToPush = async (registration: ServiceWorkerRegistration) => {
    try {
      // 권한 확인
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setError('알림 권한이 거부되었습니다.');
        return;
      }

      // VAPID public key 가져오기
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.warn('VAPID_PUBLIC_KEY가 설정되지 않았습니다.');
        setError('Push 알림 설정이 완료되지 않았습니다.');
        return;
      }

      // Push 구독 생성
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // 구독 정보를 서버에 저장
      const result = await saveSubscriptionAction({
        eventId,
        participantId,
        subscription: subscription.toJSON(),
        userAgent: navigator.userAgent,
      });

      if (result.success) {
        setIsRegistered(true);
      } else {
        setError(result.message || '구독 정보 저장에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Push subscription error:', err);
      if (err.name === 'NotAllowedError') {
        setError('알림 권한이 거부되었습니다.');
      } else {
        setError('Push 구독에 실패했습니다.');
      }
    }
  };

  // VAPID public key를 Uint8Array로 변환
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // UI는 숨김 (자동 등록만 수행)
  return null;
}

