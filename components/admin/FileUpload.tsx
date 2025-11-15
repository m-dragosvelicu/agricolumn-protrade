'use client';

import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export interface FileUploadRef {
  clear: () => void;
}

export const FileUpload = forwardRef<FileUploadRef, FileUploadProps>(({
  onFileSelect,
  onFileRemove,
  accept = '.xlsx,.xls',
  maxSize = 10,
  className
}, ref) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSize) {
      return `File size exceeds ${maxSize}MB limit`;
    }

    // Check file type
    const acceptedTypes = accept.split(',').map(t => t.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!acceptedTypes.includes(fileExtension)) {
      return `File type not supported. Please upload ${accept}`;
    }

    return null;
  };

  const handleFile = (file: File) => {
    setError('');
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onFileRemove?.();
  };

  // Expose clear method to parent component
  useImperativeHandle(ref, () => ({
    clear: clearFile
  }));

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          dragActive
            ? "border-amber-500 bg-amber-500/10"
            : selectedFile
            ? "border-green-500/50 bg-green-500/5"
            : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center">
            <Upload className="h-12 w-12 text-slate-400 mb-4" />
            <p className="text-sm text-white font-medium mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-slate-400">
              {accept.toUpperCase()} up to {maxSize}MB
            </p>
          </div>
        </CardContent>
      </Card>

      {selectedFile && (
        <div className="mt-3 flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-white font-medium">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-400">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFile}
            className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-center space-x-2 text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
});

FileUpload.displayName = 'FileUpload';
