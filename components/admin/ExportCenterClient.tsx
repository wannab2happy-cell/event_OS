'use client';

import Link from 'next/link';
import { Users, Crown, Table, CheckCircle, FileText, Download, Printer, FileDown, IdCard, UserCog, QrCode } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Event {
  id: string;
  title: string;
  code: string;
}

interface ExportSummary {
  totalParticipants: number;
  vipCount: number;
  tableCount: number;
  checkedInCount: number;
}

interface ExportCenterClientProps {
  event: Event;
  summary: ExportSummary;
  eventId: string;
}

export default function ExportCenterClient({
  event,
  summary,
  eventId,
}: ExportCenterClientProps) {
  const basePath = `/admin/events/${eventId}/export`;

  const exportCards = [
    {
      title: '참가자 전체 명단',
      description: '이름, 회사, 이메일, 상태, VIP, 테이블, 체크인 여부 포함',
      icon: Users,
      csvPath: `${basePath}/participants`,
      printPath: `${basePath}/participants/print`,
      pdfPath: `${basePath}/pass-pdf`,
      pdfVipPath: `${basePath}/pass-pdf?onlyVip=true`,
      hasPdf: true,
      hasPdfVip: true,
    },
    {
      title: 'VIP 리스트',
      description: 'VIP 레벨, Guest of 관계, 비고 포함',
      icon: Crown,
      csvPath: `${basePath}/vips`,
      printPath: `${basePath}/vips/print`,
      pdfPath: `${basePath}/vip-pdf`,
      hasPdf: true,
      hasPdfVip: false,
    },
    {
      title: '테이블 배정표',
      description: '테이블별 좌석/참가자/VIP 여부 포함',
      icon: Table,
      csvPath: `${basePath}/tables`,
      printPath: `${basePath}/tables/print`,
      pdfPath: `${basePath}/tables-pdf`,
      hasPdf: true,
      hasPdfVip: false,
    },
    {
      title: '체크인 리포트',
      description: '체크인 시간, 소스(Admin/Staff/KIOSK), 중복 여부 포함',
      icon: CheckCircle,
      csvPath: `${basePath}/checkins`,
      printPath: `${basePath}/checkins/print`,
      pdfPath: `${basePath}/checkins-pdf`,
      hasPdf: true,
      hasPdfVip: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 요약 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">총 참가자</p>
                <p className="text-xl font-semibold text-gray-900">
                  {summary.totalParticipants}
                </p>
              </div>
              <Users className="h-6 w-6 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">VIP 수</p>
                <p className="text-xl font-semibold text-gray-900">{summary.vipCount}</p>
              </div>
              <Crown className="h-6 w-6 text-amber-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">테이블 수</p>
                <p className="text-xl font-semibold text-gray-900">{summary.tableCount}</p>
              </div>
              <Table className="h-6 w-6 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">체크인 완료</p>
                <p className="text-xl font-semibold text-gray-900">
                  {summary.checkedInCount}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 text-emerald-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export 카드 */}
      <div className="grid gap-6 md:grid-cols-2">
        {exportCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon className="h-5 w-5 text-blue-600" />
                  {card.title}
                </CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link href={card.csvPath}>
                      <Download className="h-4 w-4 mr-2" />
                      CSV 다운로드
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="flex-1">
                    <Link href={card.printPath}>
                      <Printer className="h-4 w-4 mr-2" />
                      인쇄용 보기
                    </Link>
                  </Button>
                </div>
                {card.hasPdf && (
                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <Button variant="ghost" asChild className="flex-1">
                      <Link href={card.pdfPath}>
                        <FileDown className="h-4 w-4 mr-2" />
                        {card.title === '참가자 전체 명단' ? 'PASS PDF (전체)' : `${card.title} PDF`}
                      </Link>
                    </Button>
                    {card.hasPdfVip && (
                      <Button variant="ghost" asChild className="flex-1">
                        <Link href={card.pdfVipPath!}>
                          <FileDown className="h-4 w-4 mr-2" />
                          PASS PDF (VIP만)
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* PDF 출력물 카드 */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">PDF 출력물</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IdCard className="h-5 w-5 text-blue-600" />
                Badge PDF
              </CardTitle>
              <CardDescription>참가자 명찰 PDF (90mm × 120mm, A4 2-up)</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={`/admin/events/${eventId}/pdf/badges`}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Badge PDF 다운로드
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCog className="h-5 w-5 text-green-600" />
                Staff Badge PDF
              </CardTitle>
              <CardDescription>스태프 명찰 PDF (A4 2-up)</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={`/admin/events/${eventId}/pdf/staff`}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Staff Badge PDF 다운로드
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Table className="h-5 w-5 text-purple-600" />
                Table Cards PDF
              </CardTitle>
              <CardDescription>테이블 카드 PDF (A4 2-up)</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={`/admin/events/${eventId}/pdf/tables`}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Table Cards PDF 다운로드
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <QrCode className="h-5 w-5 text-orange-600" />
                QR Poster PDF
              </CardTitle>
              <CardDescription>체크인용 QR 포스터 PDF (A4/A3)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full">
                <Link href={`/admin/events/${eventId}/pdf/qr-poster?size=A4`}>
                  <FileDown className="h-4 w-4 mr-2" />
                  QR Poster PDF (A4)
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href={`/admin/events/${eventId}/pdf/qr-poster?size=A3`}>
                  <FileDown className="h-4 w-4 mr-2" />
                  QR Poster PDF (A3)
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

