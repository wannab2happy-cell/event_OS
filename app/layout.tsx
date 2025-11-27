import type { Metadata } from 'next';
import './globals.css';
import { ToasterProvider } from '@/components/providers/ToasterProvider';

export const metadata: Metadata = {
  title: 'event_OS',
  description: 'Anders Event Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard.css"
        />
      </head>
      <body className="font-sans antialiased text-gray-900 bg-white">
        <ToasterProvider />
        {children}
      </body>
    </html>
  );
}

