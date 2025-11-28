'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ParticipantHeaderProps {
  event: {
    id: string;
    title: string;
    code?: string | null;
  };
  branding: {
    logo_url?: string | null;
  };
}

const navItems = [
  { id: 'overview', label: 'Home', href: '#overview' },
  { id: 'schedule', label: 'Schedule', href: '#schedule' },
  { id: 'venue', label: 'Venue', href: '#venue' },
  { id: 'about', label: 'About', href: '#about' },
];

export default function ParticipantHeader({ event, branding }: ParticipantHeaderProps) {
  const [activeSection, setActiveSection] = useState('overview');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = navItems.map((item) => {
        const element = document.getElementById(item.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          return { id: item.id, top: rect.top, bottom: rect.bottom };
        }
        return null;
      }).filter(Boolean) as Array<{ id: string; top: number; bottom: number }>;

      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        if (scrollPosition >= sections[i].top) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm'
          : 'bg-white/80 backdrop-blur-sm border-b border-gray-200'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* 왼쪽: 로고/제목 */}
          <Link href={`/${event.id}`} className="flex items-center gap-3 hover:opacity-80 transition">
            {branding.logo_url ? (
              <Image
                src={branding.logo_url}
                alt={event.title}
                width={120}
                height={30}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900">{event.title}</span>
                {event.code && (
                  <span className="text-xs text-gray-500 font-mono">({event.code})</span>
                )}
              </div>
            )}
          </Link>

          {/* 오른쪽: 네비게이션 */}
          <nav className="flex items-center gap-1 md:gap-2">
            {/* 섹션 네비게이션 */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`px-3 py-2 text-sm font-medium transition-colors rounded-lg ${
                      isActive
                        ? 'text-[var(--primary)] bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>

            {/* 모바일: 수평 스크롤 */}
            <div className="md:hidden flex items-center gap-1 overflow-x-auto scrollbar-hide -mx-4 px-4 scroll-smooth">
              <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
              `}</style>
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`px-3 py-2 text-sm font-medium whitespace-nowrap transition-all rounded-lg flex-shrink-0 ${
                      isActive
                        ? 'text-[var(--primary)] bg-blue-50 font-semibold'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>

            {/* 액션 버튼 */}
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
              <Link
                href={`/${event.id}/me`}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
              >
                My Page
              </Link>
              <Link
                href={`/${event.id}/login`}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
              >
                Register
              </Link>
              <Link
                href={`/${event.id}/qr-pass`}
                className="px-4 py-2 text-sm font-semibold text-white bg-[var(--primary)] rounded-lg hover:opacity-90 transition"
              >
                QR Pass
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

