import React, { useState, useRef } from 'react';
import { X, UploadCloud, Link as LinkIcon, Check, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../services/api.ts';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage: string;
  title?: string;
  onSave: (newUrl: string) => Promise<void>;
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  currentImage,
  title = 'Replace Image',
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setSelectedFile(file);
    setError(null);

    // Create object URL for immediate high-fidelity preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setImageUrl(val);
    setError(null);
    if (val.trim()) {
      setPreviewUrl(val.trim());
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSave = async () => {
    if (activeTab === 'upload') {
      if (!selectedFile) {
        setError('Please select an image file to upload.');
        return;
      }

      try {
        setIsUploading(true);
        setError(null);

        // Upload file to persistent disk volume via server endpoint
        const uploadRes = await api.uploadFile(selectedFile);
        // Persist the resulting URL to the database
        await onSave(uploadRes.url);

        handleCancel();
      } catch (err: any) {
        setError(err.message || 'Failed to upload and replace image.');
      } finally {
        setIsUploading(false);
      }
    } else {
      if (!imageUrl.trim()) {
        setError('Please enter a valid image web URL.');
        return;
      }

      try {
        setIsUploading(true);
        setError(null);
        await onSave(imageUrl.trim());
        handleCancel();
      } catch (err: any) {
        setError(err.message || 'Failed to save new image URL.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleCancel = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setImageUrl('');
    setPreviewUrl(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-sm font-extrabold text-slate-950">{title}</h3>
          <button
            onClick={handleCancel}
            className="p-1 text-slate-400 hover:text-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab switch: Upload vs URL */}
        <div className="flex border-b border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 text-center border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'upload'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-2 text-center border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'url'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Image URL</span>
          </button>
        </div>

        {/* Live Preview Area */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            {previewUrl ? 'New Replacement Preview:' : 'Current Image:'}
          </div>
          <div className="aspect-video w-full rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center p-2 relative">
            <img
              src={previewUrl || currentImage}
              alt="Preview"
              className="w-full h-full object-contain"
              onError={() => {
                if (previewUrl) {
                  setError('The provided image URL could not be loaded. Please check the URL.');
                }
              }}
            />
            {previewUrl && (
              <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-orange-600 text-white text-[10px] font-bold rounded shadow">
                New Preview
              </span>
            )}
          </div>
        </div>

        {/* Upload Mode */}
        {activeTab === 'upload' && (
          <div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-xl p-5 text-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />
              <UploadCloud className="w-7 h-7 text-slate-400 mx-auto mb-1.5" />
              <div className="text-xs font-bold text-slate-800">
                {selectedFile ? selectedFile.name : 'Click to select image from your device'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                PNG, JPG, WebP, SVG supported (max 25MB).
              </div>
            </div>
          </div>
        )}

        {/* URL Mode */}
        {activeTab === 'url' && (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Paste Image Web URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={handleUrlChange}
              placeholder="https://images.unsplash.com/... or https://..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
            />
            <p className="text-[10px] text-slate-500">
              Paste any public direct image link to replace this asset immediately.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isUploading}
            className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={(activeTab === 'upload' ? !selectedFile : !imageUrl.trim()) || isUploading}
            className="px-5 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save Replacement</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
