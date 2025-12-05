/**
 * Vendor Note Card Component
 * 
 * Individual card for a vendor note
 */

'use client';

import { MoreVertical, Edit, Trash2, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { VendorNote } from '@/lib/vendors/vendorTypes';
import { getPriorityColor, getStatusColor, getPriorityLabel, getStatusLabel } from '@/lib/vendors/vendorTypes';
import { formatDateTimeKorean } from '@/lib/utils/date';
import { useState } from 'react';

interface VendorNoteCardProps {
  note: VendorNote;
  onEdit: (note: VendorNote) => void;
  onDelete: (note: VendorNote) => void;
}

export default function VendorNoteCard({ note, onEdit, onDelete }: VendorNoteCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1 truncate">{note.title}</h3>
            {note.vendor_name && (
              <p className="text-sm text-muted-foreground mb-1">Vendor: {note.vendor_name}</p>
            )}
            {note.owner && (
              <p className="text-sm text-muted-foreground mb-2">Owner: {note.owner}</p>
            )}
            {note.content && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{note.content}</p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getPriorityColor(note.priority)}>{getPriorityLabel(note.priority)}</Badge>
              <Badge className={getStatusColor(note.status)}>{getStatusLabel(note.status)}</Badge>
              {note.due_at && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDateTimeKorean(note.due_at)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
              className="h-8 w-8 p-0"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
            {showMenu && (
              <div className="absolute right-0 top-8 z-10 w-32 bg-white border rounded-lg shadow-lg py-1">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(note);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(note);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

