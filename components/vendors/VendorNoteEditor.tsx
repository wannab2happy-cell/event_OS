/**
 * Vendor Note Editor Component
 * 
 * Dialog for creating/editing vendor notes
 */

'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import type { VendorNote, VendorCategory, VendorPriority, VendorStatus } from '@/lib/vendors/vendorTypes';

interface VendorNoteEditorProps {
  open: boolean;
  mode: 'create' | 'edit';
  category: VendorCategory;
  eventId: string;
  note?: VendorNote;
  onClose: () => void;
  onSave: (data: Omit<VendorNote, 'id' | 'created_at' | 'updated_at'>) => void;
}

export default function VendorNoteEditor({
  open,
  mode,
  category,
  eventId,
  note,
  onClose,
  onSave,
}: VendorNoteEditorProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    vendor_name: '',
    owner: '',
    priority: 'medium' as VendorPriority,
    status: 'planned' as VendorStatus,
    due_at: '',
  });

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title,
        content: note.content || '',
        vendor_name: note.vendor_name || '',
        owner: note.owner || '',
        priority: note.priority,
        status: note.status,
        due_at: note.due_at ? new Date(note.due_at).toISOString().slice(0, 16) : '',
      });
    } else {
      setFormData({
        title: '',
        content: '',
        vendor_name: '',
        owner: '',
        priority: 'medium',
        status: 'planned',
        due_at: '',
      });
    }
  }, [note, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      return;
    }

    onSave({
      event_id: eventId,
      category,
      title: formData.title.trim(),
      content: formData.content.trim() || null,
      vendor_name: formData.vendor_name.trim() || null,
      owner: formData.owner.trim() || null,
      priority: formData.priority,
      status: formData.status,
      due_at: formData.due_at ? new Date(formData.due_at).toISOString() : null,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} title={mode === 'create' ? 'Create Vendor Note' : 'Edit Vendor Note'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          placeholder="Enter note title..."
        />

        <Input
          label="Vendor Name"
          value={formData.vendor_name}
          onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
          placeholder="Enter vendor name..."
        />

        <Input
          label="Owner"
          value={formData.owner}
          onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
          placeholder="Enter owner name..."
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as VendorPriority })}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as VendorStatus })}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Due Date</label>
          <Input
            type="datetime-local"
            value={formData.due_at}
            onChange={(e) => setFormData({ ...formData, due_at: e.target.value })}
          />
        </div>

        <Textarea
          label="Content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={6}
          placeholder="Enter note content..."
        />

        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{mode === 'create' ? 'Create' : 'Save'}</Button>
        </div>
      </form>
    </Dialog>
  );
}

