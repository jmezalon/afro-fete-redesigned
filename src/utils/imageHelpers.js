/**
 * Image Processing and Validation Utilities
 *
 * This module provides helper functions for validating image files,
 * resizing images, generating storage paths, and handling image data.
 */

/**
 * Validate image file type and size
 * @param {File} file - Image file to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxSize - Maximum file size in bytes (default 5MB)
 * @param {Array<string>} options.allowedTypes - Allowed MIME types
 * @returns {Object} Validation result with isValid and error message
 *
 * @example
 * validateImageFile(file, {
 *   maxSize: 5 * 1024 * 1024, // 5MB
 *   allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
 * });
 * // Returns: { isValid: true, error: null }
 *
 * @test
 * describe('validateImageFile', () => {
 *   it('should validate correct image files', () => {
 *     const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
 *     Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
 *     const result = validateImageFile(file);
 *     expect(result.isValid).toBe(true);
 *   });
 *
 *   it('should reject files exceeding max size', () => {
 *     const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
 *     Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 }); // 10MB
 *     const result = validateImageFile(file, { maxSize: 5 * 1024 * 1024 });
 *     expect(result.isValid).toBe(false);
 *     expect(result.error).toContain('File size exceeds');
 *   });
 *
 *   it('should reject invalid file types', () => {
 *     const file = new File([''], 'test.pdf', { type: 'application/pdf' });
 *     const result = validateImageFile(file);
 *     expect(result.isValid).toBe(false);
 *     expect(result.error).toContain('Invalid file type');
 *   });
 *
 *   it('should handle missing file', () => {
 *     const result = validateImageFile(null);
 *     expect(result.isValid).toBe(false);
 *     expect(result.error).toBe('No file provided');
 *   });
 * });
 */
export const validateImageFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  } = options;

  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  if (!(file instanceof File)) {
    return { isValid: false, error: 'Invalid file object' };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  return { isValid: true, error: null };
};

/**
 * Resize image to fit within max dimensions while maintaining aspect ratio
 * @param {File} file - Image file to resize
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} maxHeight - Maximum height in pixels
 * @param {number} quality - Image quality (0-1) for JPEG/WebP
 * @returns {Promise<Blob>} Resized image blob
 * @throws {Error} If image processing fails
 *
 * @example
 * const resizedBlob = await resizeImage(file, 1920, 1080, 0.8);
 * const resizedFile = new File([resizedBlob], file.name, { type: file.type });
 *
 * @test
 * describe('resizeImage', () => {
 *   it('should resize large images', async () => {
 *     const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
 *     // Mock canvas operations
 *     const result = await resizeImage(file, 800, 600, 0.8);
 *     expect(result).toBeInstanceOf(Blob);
 *   });
 *
 *   it('should maintain aspect ratio', async () => {
 *     // Test would need actual image data
 *     // This is a placeholder for the concept
 *   });
 *
 *   it('should handle errors gracefully', async () => {
 *     await expect(resizeImage(null, 800, 600)).rejects.toThrow();
 *   });
 * });
 */
export const resizeImage = (file, maxWidth, maxHeight, quality = 0.9) => {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof File)) {
      reject(new Error('Invalid file provided'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            const aspectRatio = width / height;

            if (width > height) {
              width = Math.min(width, maxWidth);
              height = width / aspectRatio;
            } else {
              height = Math.min(height, maxHeight);
              width = height * aspectRatio;
            }
          }

          // Create canvas and draw resized image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to create blob from canvas'));
              }
            },
            file.type,
            quality
          );
        } catch (error) {
          reject(new Error(`Image processing failed: ${error.message}`));
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Generate storage path for image upload
 * @param {string} userId - User ID uploading the image
 * @param {string} type - Image type ('profile', 'event', 'photo')
 * @param {string} filename - Original filename
 * @returns {string} Storage path for Firebase Storage
 *
 * @example
 * generateImagePath('user123', 'profile', 'avatar.jpg');
 * // Returns: 'images/profile/user123/1234567890_avatar.jpg'
 *
 * generateImagePath('user456', 'photo', 'party.jpg');
 * // Returns: 'images/photo/user456/1234567890_party.jpg'
 *
 * @test
 * describe('generateImagePath', () => {
 *   it('should generate correct path for profile images', () => {
 *     const path = generateImagePath('user123', 'profile', 'avatar.jpg');
 *     expect(path).toMatch(/^images\/profile\/user123\/\d+_avatar\.jpg$/);
 *   });
 *
 *   it('should generate correct path for event images', () => {
 *     const path = generateImagePath('user456', 'event', 'flyer.png');
 *     expect(path).toMatch(/^images\/event\/user456\/\d+_flyer\.png$/);
 *   });
 *
 *   it('should sanitize filename', () => {
 *     const path = generateImagePath('user123', 'photo', 'my photo #1.jpg');
 *     expect(path).toMatch(/^images\/photo\/user123\/\d+_my_photo_1\.jpg$/);
 *   });
 *
 *   it('should throw error for missing parameters', () => {
 *     expect(() => generateImagePath(null, 'profile', 'test.jpg')).toThrow();
 *     expect(() => generateImagePath('user123', null, 'test.jpg')).toThrow();
 *     expect(() => generateImagePath('user123', 'profile', null)).toThrow();
 *   });
 * });
 */
export const generateImagePath = (userId, type, filename) => {
  if (!userId || !type || !filename) {
    throw new Error('userId, type, and filename are required');
  }

  const validTypes = ['profile', 'event', 'photo'];
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid image type. Must be one of: ${validTypes.join(', ')}`);
  }

  // Sanitize filename: remove special characters and spaces
  const sanitizedFilename = filename
    .replace(/[^a-zA-Z0-9.\-_]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();

  // Add timestamp to ensure uniqueness
  const timestamp = Date.now();
  const uniqueFilename = `${timestamp}_${sanitizedFilename}`;

  return `images/${type}/${userId}/${uniqueFilename}`;
};

/**
 * Convert File to base64 data URL
 * @param {File} file - File to convert
 * @returns {Promise<string>} Base64 data URL
 * @throws {Error} If conversion fails
 *
 * @example
 * const dataURL = await fileToDataURL(file);
 * // Returns: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
 *
 * @test
 * describe('fileToDataURL', () => {
 *   it('should convert file to data URL', async () => {
 *     const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
 *     const result = await fileToDataURL(file);
 *     expect(result).toMatch(/^data:image\/jpeg;base64,/);
 *   });
 *
 *   it('should handle errors', async () => {
 *     await expect(fileToDataURL(null)).rejects.toThrow();
 *   });
 * });
 */
export const fileToDataURL = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof File)) {
      reject(new Error('Invalid file provided'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      resolve(e.target.result);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Get image dimensions from file
 * @param {File} file - Image file
 * @returns {Promise<Object>} Object with width and height
 * @throws {Error} If reading image fails
 *
 * @example
 * const { width, height } = await getImageDimensions(file);
 * console.log(`Image is ${width}x${height}px`);
 *
 * @test
 * describe('getImageDimensions', () => {
 *   it('should return image dimensions', async () => {
 *     // Would need actual image file for real test
 *     const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
 *     const result = await getImageDimensions(file);
 *     expect(result).toHaveProperty('width');
 *     expect(result).toHaveProperty('height');
 *   });
 *
 *   it('should handle invalid files', async () => {
 *     await expect(getImageDimensions(null)).rejects.toThrow();
 *   });
 * });
 */
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof File)) {
      reject(new Error('Invalid file provided'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Create thumbnail from image file
 * @param {File} file - Image file
 * @param {number} size - Thumbnail size (width/height in pixels)
 * @returns {Promise<Blob>} Thumbnail blob
 * @throws {Error} If thumbnail creation fails
 *
 * @example
 * const thumbnailBlob = await createThumbnail(file, 200);
 * const thumbnailFile = new File([thumbnailBlob], 'thumb_' + file.name, { type: file.type });
 *
 * @test
 * describe('createThumbnail', () => {
 *   it('should create square thumbnail', async () => {
 *     const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
 *     const result = await createThumbnail(file, 200);
 *     expect(result).toBeInstanceOf(Blob);
 *   });
 *
 *   it('should handle errors', async () => {
 *     await expect(createThumbnail(null, 200)).rejects.toThrow();
 *   });
 * });
 */
export const createThumbnail = (file, size = 200) => {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof File)) {
      reject(new Error('Invalid file provided'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;

          const ctx = canvas.getContext('2d');

          // Calculate crop to make square
          const sourceSize = Math.min(img.width, img.height);
          const sourceX = (img.width - sourceSize) / 2;
          const sourceY = (img.height - sourceSize) / 2;

          // Draw cropped and scaled image
          ctx.drawImage(
            img,
            sourceX,
            sourceY,
            sourceSize,
            sourceSize,
            0,
            0,
            size,
            size
          );

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to create thumbnail'));
              }
            },
            file.type,
            0.9
          );
        } catch (error) {
          reject(new Error(`Thumbnail creation failed: ${error.message}`));
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size string
 *
 * @example
 * formatFileSize(1024); // Returns: '1.0 KB'
 * formatFileSize(1048576); // Returns: '1.0 MB'
 * formatFileSize(500); // Returns: '500 B'
 *
 * @test
 * describe('formatFileSize', () => {
 *   it('should format bytes', () => {
 *     expect(formatFileSize(500)).toBe('500 B');
 *   });
 *
 *   it('should format kilobytes', () => {
 *     expect(formatFileSize(1024)).toBe('1.0 KB');
 *     expect(formatFileSize(1536)).toBe('1.5 KB');
 *   });
 *
 *   it('should format megabytes', () => {
 *     expect(formatFileSize(1048576)).toBe('1.0 MB');
 *     expect(formatFileSize(2621440)).toBe('2.5 MB');
 *   });
 *
 *   it('should format gigabytes', () => {
 *     expect(formatFileSize(1073741824)).toBe('1.0 GB');
 *   });
 *
 *   it('should handle zero', () => {
 *     expect(formatFileSize(0)).toBe('0 B');
 *   });
 * });
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';

  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);

  return `${size.toFixed(1)} ${sizes[i]}`;
};

/**
 * Extract image metadata
 * @param {File} file - Image file
 * @returns {Promise<Object>} Metadata object
 *
 * @example
 * const metadata = await getImageMetadata(file);
 * // Returns: {
 * //   name: 'photo.jpg',
 * //   type: 'image/jpeg',
 * //   size: 1048576,
 * //   formattedSize: '1.0 MB',
 * //   width: 1920,
 * //   height: 1080,
 * //   aspectRatio: 1.78
 * // }
 *
 * @test
 * describe('getImageMetadata', () => {
 *   it('should extract metadata', async () => {
 *     const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
 *     Object.defineProperty(file, 'size', { value: 1024 });
 *     const result = await getImageMetadata(file);
 *     expect(result).toHaveProperty('name');
 *     expect(result).toHaveProperty('type');
 *     expect(result).toHaveProperty('size');
 *     expect(result).toHaveProperty('formattedSize');
 *   });
 * });
 */
export const getImageMetadata = async (file) => {
  if (!file || !(file instanceof File)) {
    throw new Error('Invalid file provided');
  }

  try {
    const dimensions = await getImageDimensions(file);

    return {
      name: file.name,
      type: file.type,
      size: file.size,
      formattedSize: formatFileSize(file.size),
      width: dimensions.width,
      height: dimensions.height,
      aspectRatio: dimensions.width / dimensions.height,
    };
  } catch (error) {
    throw new Error(`Failed to extract metadata: ${error.message}`);
  }
};

/**
 * Compress image file
 * @param {File} file - Image file to compress
 * @param {number} quality - Compression quality (0-1)
 * @returns {Promise<File>} Compressed image file
 * @throws {Error} If compression fails
 *
 * @example
 * const compressedFile = await compressImage(file, 0.7);
 * console.log(`Reduced from ${file.size} to ${compressedFile.size} bytes`);
 *
 * @test
 * describe('compressImage', () => {
 *   it('should compress image', async () => {
 *     const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
 *     const result = await compressImage(file, 0.7);
 *     expect(result).toBeInstanceOf(File);
 *   });
 *
 *   it('should use specified quality', async () => {
 *     // Would need actual image data to test compression
 *   });
 * });
 */
export const compressImage = async (file, quality = 0.8) => {
  if (!file || !(file instanceof File)) {
    throw new Error('Invalid file provided');
  }

  try {
    // Get original dimensions
    const { width, height } = await getImageDimensions(file);

    // Resize to same dimensions but with lower quality
    const blob = await resizeImage(file, width, height, quality);

    // Convert blob to file
    return new File([blob], file.name, { type: file.type });
  } catch (error) {
    throw new Error(`Compression failed: ${error.message}`);
  }
};
