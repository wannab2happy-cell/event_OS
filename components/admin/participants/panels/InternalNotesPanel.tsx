import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Pin } from 'lucide-react';

interface InternalNotesPanelProps {
  data: {
    id: string;
    createdAt: string;
    updatedAt?: string | null;
    authorEmail?: string | null;
    authorName?: string | null;
    content: string;
    isPinned?: boolean;
  }[];
}

export default function InternalNotesPanel({ data }: InternalNotesPanelProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (data.length === 0) {
    return (
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl">Internal Notes</CardTitle>
          <CardDescription>내부 메모</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No internal notes.</p>
        </CardContent>
      </Card>
    );
  }

  // Pinned 노트를 먼저 표시
  const sortedNotes = [...data].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl">Internal Notes</CardTitle>
        <CardDescription>내부 메모 ({data.length}개)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedNotes.map((note) => (
            <div
              key={note.id}
              className="p-4 border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {note.isPinned && (
                      <Pin className="h-4 w-4 text-amber-600" fill="currentColor" />
                    )}
                    {note.authorName && (
                      <span className="text-sm font-medium text-gray-900">{note.authorName}</span>
                    )}
                    {note.authorEmail && (
                      <span className="text-sm text-gray-500">({note.authorEmail})</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {note.updatedAt && note.updatedAt !== note.createdAt ? (
                      <>
                        Updated: {formatDate(note.updatedAt)} | Created: {formatDate(note.createdAt)}
                      </>
                    ) : (
                      <>Created: {formatDate(note.createdAt)}</>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-900 whitespace-pre-wrap">{note.content}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

