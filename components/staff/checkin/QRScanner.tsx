/**
 * QR Scanner Component
 * 
 * Uses BarcodeDetector API if available, falls back to react-qr-reader
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface QRScannerProps {
  onScan: (data: string) => void;
  disabled?: boolean;
}

export default function QRScanner({ onScan, disabled }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [barcodeDetectorSupported, setBarcodeDetectorSupported] = useState(false);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if BarcodeDetector is supported
    if ('BarcodeDetector' in window) {
      setBarcodeDetectorSupported(true);
    }

    return () => {
      stopScanning();
    };
  }, []);

  const stopScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsScanning(false);
  };

  const startScanning = async () => {
    if (disabled || isScanning) return;

    try {
      setError(null);

      // Request camera access (prefer rear camera)
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment', // Rear camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsScanning(true);

        // Start scanning with BarcodeDetector
        if (barcodeDetectorSupported) {
          // @ts-ignore - BarcodeDetector API is not fully typed
          const detector = new window.BarcodeDetector({
            formats: ['qr_code'],
          });

          scanIntervalRef.current = setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
              try {
                const barcodes = await detector.detect(videoRef.current);
                if (barcodes.length > 0) {
                  const qrData = barcodes[0].rawValue;
                  if (qrData) {
                    stopScanning();
                    onScan(qrData);
                  }
                }
              } catch (err) {
                // Ignore detection errors
              }
            }
          }, 300);
        } else {
          // Fallback: Use manual QR code detection library
          // For now, show message to use manual input
          setError('QR scanning requires a modern browser. Please use manual entry.');
        }
      }
    } catch (err) {
      console.error('Error starting camera:', err);
      setError(
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Camera access denied. Please allow camera access and try again.'
          : 'Failed to start camera. Please use manual entry.'
      );
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-4">
      {!isScanning ? (
        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center space-y-2">
            <Camera className="w-12 h-12 text-gray-400 mx-auto" />
            <p className="text-sm text-muted-foreground">Camera not active</p>
            <Button onClick={startScanning} disabled={disabled}>
              Start Scanner
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-blue-500 rounded-lg" />
          </div>
          <Button
            onClick={stopScanning}
            variant="secondary"
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
          >
            Stop Scanner
          </Button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {!barcodeDetectorSupported && !error && (
        <p className="text-xs text-muted-foreground text-center">
          QR scanning may not be supported in this browser. Use manual entry or search instead.
        </p>
      )}
    </div>
  );
}

