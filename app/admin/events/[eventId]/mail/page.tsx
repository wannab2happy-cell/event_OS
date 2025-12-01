'use client';

import { useState, useEffect } from 'react';
import TemplateList from './components/TemplateList';
import TemplateEditor from './components/TemplateEditor';
import JobList from './components/JobList';
import LogList from './components/LogList';
import SendEmailDialog from './components/SendEmailDialog';
import type { EmailTemplate } from '@/lib/mail/types';
import { getTemplates } from '@/actions/mail/getTemplates';
import { Button } from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/useToast';

type MailCenterPageProps = {
  params: Promise<{ eventId: string }>;
};

export default function MailCenterPage({ params }: MailCenterPageProps) {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'templates' | 'jobs' | 'logs'>('templates');
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null | undefined>(undefined);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [eventId, setEventId] = useState<string>('');
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // params를 async로 처리
  useEffect(() => {
    params.then((resolved) => {
      setEventId(resolved.eventId);
      loadTemplates(resolved.eventId);
    });
  }, [params]);

  async function loadTemplates(eId: string) {
    try {
      setLoadingTemplates(true);
      const data = await getTemplates(eId);
      setTemplates(data);
    } catch (err: any) {
      console.error('Failed to load templates:', err);
      error('템플릿을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoadingTemplates(false);
    }
  }

  const handleTemplateSaved = () => {
    if (eventId) {
      loadTemplates(eventId);
      success('템플릿이 저장되었습니다.');
    }
    setEditingTemplate(undefined);
  };

  const handleJobSent = () => {
    success('이메일 발송 작업이 생성되었습니다.');
    setActiveTab('jobs');
    setShowSendDialog(false);
    // JobList가 자동으로 새로고침되도록 key를 변경하거나 리로드 트리거 추가
  };

  const openEditor = (template: EmailTemplate | null) => {
    setEditingTemplate(template);
  };

  const closeEditor = () => {
    setEditingTemplate(undefined);
  };

  if (!eventId) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mail Center</h1>
        {activeTab === 'templates' && templates.length > 0 && !editingTemplate && (
          <Button onClick={() => setShowSendDialog(true)}>이메일 발송</Button>
        )}
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => {
              setActiveTab('templates');
              setSelectedJobId(null);
              setEditingTemplate(undefined);
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'templates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            템플릿 관리
          </button>
          <button
            onClick={() => {
              setActiveTab('jobs');
              setEditingTemplate(undefined);
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'jobs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            발송 작업
          </button>
          <button
            onClick={() => {
              setActiveTab('logs');
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'logs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            발송 로그
          </button>
        </nav>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="mt-6">
        {activeTab === 'templates' && (
          <div className="space-y-6">
            {loadingTemplates ? (
              <LoadingSpinner />
            ) : editingTemplate !== undefined ? (
              <TemplateEditor
                eventId={eventId}
                template={editingTemplate}
                onClose={closeEditor}
                onSaved={handleTemplateSaved}
              />
            ) : (
              <TemplateList
                eventId={eventId}
                onEdit={(tpl) => openEditor(tpl)}
                onRefresh={loadTemplates}
              />
            )}
          </div>
        )}

        {activeTab === 'jobs' && (
          <JobList
            eventId={eventId}
            onSelectJob={(jobId) => {
              setSelectedJobId(jobId);
              setActiveTab('logs');
            }}
          />
        )}

        {activeTab === 'logs' && (
          <div>
            {selectedJobId ? (
              <LogList jobId={selectedJobId} />
            ) : (
              <div className="text-gray-500 text-center py-8">
                발송 작업을 선택하면 로그를 확인할 수 있습니다.
              </div>
            )}
          </div>
        )}
      </div>

      {/* 이메일 발송 다이얼로그 */}
      {showSendDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <SendEmailDialog
              eventId={eventId}
              templates={templates}
              onSent={handleJobSent}
              onClose={() => setShowSendDialog(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
