import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { ImageUploadModal } from './ImageUploadModal.tsx';

interface EditableImageProps {
  src: string;
  alt: string;
  onSave: (newUrl: string) => Promise<void>;
  className?: string;
  containerClassName?: string;
  title?: string;
  buttonLabel?: string;
}

export const EditableImage: React.FC<EditableImageProps> = ({
  src,
  alt,
  onSave,
  className = 'w-full h-full object-contain',
  containerClassName = 'relative w-full h-full',
  title = 'Replace Image',
  buttonLabel = 'Change Image',
}) => {
  const { isEditMode } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If not in edit mode, render standard <img> tag
  if (!isEditMode) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className={`group relative ${containerClassName}`}>
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        referrerPolicy="no-referrer"
      />

      {/* Edit Mode Hover Action Button */}
      <div
        onClick={e => {
          e.stopPropagation();
          e.preventDefault();
          setIsModalOpen(true);
        }}
        className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-lg z-20"
      >
        <button
          type="button"
          className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-950 rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 transition-transform group-hover:scale-105"
        >
          <Camera className="w-3.5 h-3.5 text-orange-600" />
          <span>{buttonLabel}</span>
        </button>
      </div>

      <ImageUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentImage={src}
        title={title}
        onSave={onSave}
      />
    </div>
  );
};
