import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Upload a buffer to Cloudinary
   * @param buffer  - file buffer from multer memoryStorage
   * @param folder  - Cloudinary folder e.g. 'jce-portfolio/projects'
   * @param publicId - optional custom public_id
   */
  uploadBuffer(
    buffer: Buffer,
    folder: string,
    publicId?: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          transformation: [
            { width: 1200, height: 630, crop: 'fill', gravity: 'auto' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error || !result) reject(error);
          else resolve(result);
        },
      );
      stream.end(buffer);
    });
  }

  /**
   * Delete an image from Cloudinary by its public_id
   * Extracts public_id from a full Cloudinary URL automatically
   */
  async deleteByUrl(url: string): Promise<void> {
    if (!url || !url.includes('cloudinary.com')) return;
    // Extract public_id from URL: ...upload/v123456/folder/public_id.ext
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
    if (match) {
      await cloudinary.uploader.destroy(match[1]);
    }
  }
}