'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import type { ParticipantInfoCenterData } from '@/lib/types';
import { mapStatusToLabel } from '@/lib/types';
import BasicInfoPanel from './panels/BasicInfoPanel';
import TravelInfoPanel from './panels/TravelInfoPanel';
import HotelInfoPanel from './panels/HotelInfoPanel';
import InternalNotesPanel from './panels/InternalNotesPanel';
import CheckInHistoryPanel from './panels/CheckInHistoryPanel';
import ChangeLogsPanel from './panels/ChangeLogsPanel';

interface ParticipantInfoCenterClientProps {
  eventId: string;
  participantId: string;
  infoData: ParticipantInfoCenterData;
}

type SectionId = 'section-basic' | 'section-travel' | 'section-hotel' | 'section-notes' | 'section-checkin' | 'section-changelogs';

const sections: { id: SectionId; label: string }[] = [
  { id: 'section-basic', label: 'Basic Info' },
  { id: 'section-travel', label: 'Travel Info' },
  { id: 'section-hotel', label: 'Hotel Info' },
  { id: 'section-notes', label: 'Internal Notes' },
  { id: 'section-checkin', label: 'Check-in History' },
  { id: 'section-changelogs', label: 'Change Logs' },
];

export default function ParticipantInfoCenterClient({
  eventId,
  participantId,
  infoData,
}: ParticipantInfoCenterClientProps) {
  const [activeSection, setActiveSection] = useState<SectionId>('section-basic');

  // 섹션으로 스크롤
  const scrollToSection = (sectionId: SectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  };

  // 스크롤 위치에 따라 active section 업데이트
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // offset for header

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* 좌측 네비게이션 */}
      <div className="w-full lg:w-64 flex-shrink-0">
        <Card className="border border-gray-200 sticky top-6">
          <CardHeader>
            <CardTitle className="text-lg">Sections</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <nav className="space-y-1 p-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>
      </div>

      {/* 우측 패널 영역 */}
      <div className="flex-1 space-y-6">
        <div id="section-basic">
          <BasicInfoPanel data={infoData.basic} />
        </div>

        <div id="section-travel">
          <TravelInfoPanel data={infoData.travel} />
        </div>

        <div id="section-hotel">
          <HotelInfoPanel data={infoData.hotel} />
        </div>

        <div id="section-notes">
          <InternalNotesPanel data={infoData.internalNotes} />
        </div>

        <div id="section-checkin">
          <CheckInHistoryPanel data={infoData.checkInLogs} />
        </div>

        <div id="section-changelogs">
          <ChangeLogsPanel data={infoData.changeLogs} />
        </div>
      </div>
    </div>
  );
}

