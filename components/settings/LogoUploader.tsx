/**
 * Logo Uploader Component
 * 
 * Image upload with preview
 */

'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { uploadEventAsset } from '@/actions/settings/uploadEventAsset';

interface LogoUploaderProps {
  label: string;
  imageUrl?: string;
  eventId: string;
  type: 'logo' | 'hero';
  onChange: (url: string) => void;
}

export default function LogoUploader({
  label,
  imageUrl,
  eventId,
  type,
  onChange,
}: LogoUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadEventAsset(eventId, file, type);
      if ('url' in result) {
        onChange(result.url);
      } else {
        alert(`Upload failed: ${result.error}`);
      }
    } catch (err) {
      console.error('Error uploading:', err);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      {imageUrl ? (
        <div className="relative inline-block">
          <div className="relative w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt={label}
              className="w-full h-full object-contain"
            />
          </div>
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <label className="cursor-pointer">
            <span className="text-sm text-muted-foreground">Click to upload</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
          {uploading && <p className="text-xs text-muted-foreground mt-2">Uploading...</p>}
        </div>
      )}
    </div>
  );
}

