import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  /**
   * Upload file to Cloudinary from buffer
   * @param file - Express.Multer.File object
   * @param folder - Optional folder name in Cloudinary (default: 'uploads')
   * @returns Promise with upload result
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto', // Automatically detect file type (image, video, raw, etc.)
        },
        (error, result) => {
          if (error) return reject(error);
          if (result) resolve(result);
        },
      ).end(file.buffer);
    });
  }

  /**
   * Upload multiple files to Cloudinary
   * @param files - Array of Express.Multer.File objects
   * @param folder - Optional folder name in Cloudinary (default: 'uploads')
   * @returns Promise with array of upload results
   */
  async uploadFiles(
    files: Express.Multer.File[],
    folder: string = 'uploads',
  ): Promise<(UploadApiResponse | UploadApiErrorResponse)[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete file from Cloudinary by public_id
   * @param publicId - The public ID of the file to delete
   * @returns Promise with deletion result
   */
  async deleteFile(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }

  /**
   * Delete multiple files from Cloudinary
   * @param publicIds - Array of public IDs to delete
   * @returns Promise with deletion result
   */
  async deleteFiles(publicIds: string[]): Promise<any> {
    return cloudinary.api.delete_resources(publicIds);
  }
}
