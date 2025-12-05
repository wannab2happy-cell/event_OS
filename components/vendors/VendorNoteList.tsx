/**
 * Vendor Note List Component
 * 
 * Displays a list of vendor notes
 */

'use client';

import VendorNoteCard from './VendorNoteCard';
import type { VendorNote } from '@/lib/vendors/vendorTypes';

interface VendorNoteListProps {
  notes: VendorNote[];
  onEdit: (note: VendorNote) => void;
  onDelete: (note: VendorNote) => void;
}

export default function VendorNoteList({ notes, onEdit, onDelete }: VendorNoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">No vendor notes in this category</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => (
        <VendorNoteCard key={note.id} note={note} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

