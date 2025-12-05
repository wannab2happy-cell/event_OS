/**
 * Vendor Workspace Client Component
 * 
 * Main vendor workspace interface
 */

'use client';

import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import VendorCategoryTabs from '@/components/vendors/VendorCategoryTabs';
import VendorNoteList from '@/components/vendors/VendorNoteList';
import VendorNoteEditor from '@/components/vendors/VendorNoteEditor';
import { upsertVendorNote } from '@/actions/vendors/upsertVendorNote';
import { deleteVendorNote } from '@/actions/vendors/deleteVendorNote';
import toast from 'react-hot-toast';
import type { VendorNote, VendorCategory } from '@/lib/vendors/vendorTypes';

interface VendorWorkspaceClientProps {
  eventId: string;
  eventName: string;
  eventDateRange?: string;
  initialNotes: VendorNote[];
}

import VendorExportMenu from '@/components/vendors/VendorExportMenu';

export default function VendorWorkspaceClient({
  eventId,
  eventName,
  eventDateRange,
  initialNotes,
}: VendorWorkspaceClientProps) {
  const [activeCategory, setActiveCategory] = useState<VendorCategory>('hotel');
  const [notes, setNotes] = useState<VendorNote[]>(initialNotes);
  const [selectedNote, setSelectedNote] = useState<VendorNote | undefined>();
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Filter notes by active category
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => note.category === activeCategory);
  }, [notes, activeCategory]);

  const handleCreate = () => {
    setSelectedNote(undefined);
    setIsEditorOpen(true);
  };

  const handleEdit = (note: VendorNote) => {
    setSelectedNote(note);
    setIsEditorOpen(true);
  };

  const handleDelete = async (note: VendorNote) => {
    if (!confirm(`Are you sure you want to delete "${note.title}"?`)) {
      return;
    }

    try {
      await deleteVendorNote(eventId, note.id);
      setNotes((prev) => prev.filter((n) => n.id !== note.id));
      toast.success('Vendor note deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete note');
    }
  };

  const handleSave = async (data: Omit<VendorNote, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const savedNote = await upsertVendorNote(eventId, {
        ...data,
        ...(selectedNote && { id: selectedNote.id }),
      });

      if (selectedNote) {
        // Update existing
        setNotes((prev) => prev.map((n) => (n.id === savedNote.id ? savedNote : n)));
        toast.success('Vendor note updated');
      } else {
        // Add new
        setNotes((prev) => [...prev, savedNote]);
        toast.success('Vendor note created');
      }

      setIsEditorOpen(false);
      setSelectedNote(undefined);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save note');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Vendor Workspace</h1>
          <p className="text-sm text-muted-foreground mt-1">{eventName}</p>
        </div>
        <div className="flex items-center gap-2">
          <VendorExportMenu
            eventId={eventId}
            eventName={eventName}
            eventDateRange={eventDateRange}
            notes={notes}
          />
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <VendorCategoryTabs activeCategory={activeCategory} onChange={setActiveCategory} />

      {/* Note List */}
      <VendorNoteList notes={filteredNotes} onEdit={handleEdit} onDelete={handleDelete} />

      {/* Editor Dialog */}
      <VendorNoteEditor
        open={isEditorOpen}
        mode={selectedNote ? 'edit' : 'create'}
        category={activeCategory}
        eventId={eventId}
        note={selectedNote}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedNote(undefined);
        }}
        onSave={handleSave}
      />
    </div>
  );
}

