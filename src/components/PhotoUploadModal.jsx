import { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { uploadPhoto } from '../services/photoService';
import { useAuth } from '../context/AuthContext';

const PhotoUploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    caption: '',
    hashtags: '',
    eventId: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

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

    setSelectedFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedFile) {
      setError('Please select an image');
      return;
    }

    if (!user) {
      setError('You must be signed in to upload photos');
      return;
    }

    setUploading(true);

    try {
      // Parse hashtags (normalize to lowercase for consistent searching)
      const hashtagArray = formData.hashtags
        .split(',')
        .map(tag => tag.trim().replace('#', '').toLowerCase())
        .filter(tag => tag.length > 0);

      const photoData = {
        file: selectedFile,
        caption: formData.caption,
        hashtags: hashtagArray,
        eventId: formData.eventId || null,
      };

      const userName = user.fullName || user.username || user.email?.split('@')[0] || 'Anonymous';
      await uploadPhoto(photoData, user.uid, userName);

      // Reset form
      setFormData({ caption: '', hashtags: '', eventId: '' });
      setSelectedFile(null);
      setPreviewUrl(null);

      if (onUploadSuccess) {
        onUploadSuccess();
      }

      onClose();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFormData({ caption: '', hashtags: '', eventId: '' });
      setSelectedFile(null);
      setPreviewUrl(null);
      setError('');
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">Post a Photo</h2>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Photo *
            </label>
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-96 object-contain rounded-lg border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  disabled={uploading}
                  className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            ) : (
              <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-[#FF6B6B] hover:bg-gray-50 transition-all">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="hidden"
                />
                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, GIF up to 5MB
                </p>
              </label>
            )}
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Caption
            </label>
            <textarea
              name="caption"
              value={formData.caption}
              onChange={handleChange}
              disabled={uploading}
              placeholder="Add a caption..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent disabled:opacity-50 transition-all resize-none"
            />
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hashtags
            </label>
            <input
              type="text"
              name="hashtags"
              value={formData.hashtags}
              onChange={handleChange}
              disabled={uploading}
              placeholder="e.g., afrobeats, brunch, brooklyn (separate with commas)"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent disabled:opacity-50 transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple hashtags with commas
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] hover:from-[#ff5252] hover:to-[#FF6B6B] text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Post Photo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PhotoUploadModal;
