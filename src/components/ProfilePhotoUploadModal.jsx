import { useState, useRef } from 'react';
import { X, Upload, Camera } from 'lucide-react';
import { uploadImage } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/authService';

const ProfilePhotoUploadModal = ({ isOpen, onClose, onPhotoUploaded }) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError('');
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);
    setError('');

    try {
      // Upload to Firebase Storage
      const storagePath = `profilePhotos/${user.uid}/profile_${Date.now()}.jpg`;
      const photoUrl = await uploadImage(selectedFile, storagePath);

      // Update user profile in Firestore
      await updateUserProfile(user.uid, {
        profilePhoto: photoUrl,
      });

      // Notify parent component
      if (onPhotoUploaded) {
        onPhotoUploaded(photoUrl);
      }

      // Reset and close
      handleClose();
    } catch (err) {
      console.error('Error uploading profile photo:', err);
      setError('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setError('');
    setUploadProgress(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Upload Profile Photo</h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Preview or Upload Button */}
        {preview ? (
          <div className="mb-4">
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="mt-2 text-[#FF6B6B] text-sm hover:underline disabled:opacity-50"
            >
              Choose different photo
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-square rounded-lg border-2 border-dashed border-gray-300
                     flex flex-col items-center justify-center gap-2 hover:border-[#FF6B6B]
                     transition-colors mb-4"
          >
            <Camera className="w-12 h-12 text-gray-400" />
            <span className="text-gray-600">Click to select photo</span>
            <span className="text-xs text-gray-400">Max size: 5MB</span>
          </button>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#FF6B6B] h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 text-center mt-2">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700
                     hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="flex-1 px-4 py-2 bg-[#FF6B6B] text-white rounded-lg
                     hover:bg-[#FF5252] disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePhotoUploadModal;
