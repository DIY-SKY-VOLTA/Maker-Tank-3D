import React, { useState, useEffect, useRef } from 'react';
import { Pencil, Check, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  className?: string;
  multiline?: boolean;
  type?: 'text' | 'number';
  prefix?: string;
  suffix?: string;
  placeholder?: string;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onSave,
  as: Component = 'span',
  className = '',
  multiline = false,
  type = 'text',
  prefix = '',
  suffix = '',
  placeholder = 'Click to edit...',
}) => {
  const { isEditMode } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Sync external changes
  useEffect(() => {
    setCurrentText(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  // If not in edit mode, render cleanly with zero administrative affordance
  if (!isEditMode) {
    return (
      <Component className={className}>
        {prefix}{value}{suffix}
      </Component>
    );
  }

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentText(value);
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setCurrentText(value);
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async (e?: React.MouseEvent | React.FormEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (currentText.trim() === '' && type !== 'number') {
      setError('Value cannot be empty');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onSave(currentText.trim());
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <div
        className="inline-flex flex-col gap-1.5 p-1 bg-white border border-orange-500 rounded-lg shadow-lg z-30 relative min-w-[180px] max-w-full text-slate-900"
        onClick={e => e.stopPropagation()}
      >
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={currentText}
            onChange={e => setCurrentText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            className={`w-full p-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 font-sans leading-normal ${className}`}
            placeholder={placeholder}
          />
        ) : (
          <div className="flex items-center gap-1">
            {prefix && <span className="text-xs font-bold text-slate-500">{prefix}</span>}
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type={type}
              value={currentText}
              onChange={e => setCurrentText(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 font-sans ${className}`}
              placeholder={placeholder}
            />
            {suffix && <span className="text-xs font-bold text-slate-500">{suffix}</span>}
          </div>
        )}

        {error && <div className="text-[10px] text-red-600 px-1">{error}</div>}

        <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Cancel</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-2.5 py-1 text-[11px] font-bold text-white bg-orange-600 hover:bg-orange-700 rounded flex items-center gap-1 transition-colors shadow-xs"
          >
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            <span>Save</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <Component
      onClick={handleStartEdit}
      title="Click to edit text"
      className={`${className} cursor-pointer relative group inline-block transition-all hover:outline hover:outline-dashed hover:outline-1 hover:outline-orange-500 hover:bg-orange-50/40 rounded px-1 -mx-1`}
    >
      <span>
        {prefix}{value}{suffix}
      </span>
      <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2.5 -right-2.5 z-20 bg-orange-600 text-white rounded-full p-1 shadow-xs pointer-events-none">
        <Pencil className="w-2.5 h-2.5" />
      </span>
    </Component>
  );
};
