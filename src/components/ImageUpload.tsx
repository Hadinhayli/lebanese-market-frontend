import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadAPI } from '@/lib/api';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, required = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Update preview when value changes
  React.useEffect(() => {
    if (value) {
      setPreview(value);
    }
  }, [value]);

  const handleFileSelect = async (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file (JPEG, PNG, GIF, or WebP)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Upload file
      const response = await uploadAPI.uploadImage(file);
      
      if (response.success && response.data) {
        // Use the URL directly from Vercel Blob (already a full URL)
        const imageUrl = response.data.url;
        onChange(imageUrl);
        setPreview(imageUrl);
        toast({
          description: 'Image uploaded successfully',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    onChange('');
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>Product Image {required && '*'}</Label>
      
      {/* Image Preview */}
      {preview && (
        <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-gray-100">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Upload Area */}
      {!preview && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? 'border-brand-500 bg-brand-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-gray-100 rounded-full">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                {isUploading ? 'Uploading...' : 'Drag and drop an image here'}
              </p>
              <p className="text-xs text-gray-500 mt-1">or</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF, WebP up to 5MB
            </p>
          </div>
        </div>
      )}

      {/* File Input (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* URL Input */}
      <div className="space-y-2">
        <p className="text-sm text-gray-600">Or paste an image URL:</p>
        <Input
          type="url"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (e.target.value) {
              setPreview(e.target.value);
            } else {
              setPreview(null);
            }
          }}
          placeholder="https://example.com/image.jpg"
          required={required && !preview}
        />
      </div>

      {/* Change Image Button (when preview exists) */}
      {preview && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? 'Uploading...' : 'Change Image'}
        </Button>
      )}
    </div>
  );
};

export default ImageUpload;

