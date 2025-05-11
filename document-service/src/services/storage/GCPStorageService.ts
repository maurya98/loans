import { IStorageService } from './IStorageService';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

export class GCPStorageService implements IStorageService {
  private storage: Storage;
  private bucketName: string;

  constructor() {
    this.storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GCP_CREDENTIALS_PATH
    });
    this.bucketName = process.env.GCP_BUCKET_NAME || '';
  }

  async upload(file: Express.Multer.File): Promise<string> {
    const fileName = `${uuidv4()}${file.originalname}`;
    const bucket = this.storage.bucket(this.bucketName);
    const blob = bucket.file(fileName);
    
    await blob.save(file.buffer, {
      metadata: { contentType: file.mimetype }
    });
    
    return fileName;
  }

  async download(path: string): Promise<Buffer> {
    const bucket = this.storage.bucket(this.bucketName);
    const blob = bucket.file(path);
    const [buffer] = await blob.download();
    return buffer;
  }

  async delete(path: string): Promise<void> {
    const bucket = this.storage.bucket(this.bucketName);
    const blob = bucket.file(path);
    await blob.delete();
  }

  async getSignedUrl(path: string, operation: 'upload' | 'download', expiresIn: number = 3600): Promise<string> {
    const bucket = this.storage.bucket(this.bucketName);
    const blob = bucket.file(path);
    
    const [url] = await blob.getSignedUrl({
      version: 'v4',
      action: operation === 'upload' ? 'write' : 'read',
      expires: Date.now() + expiresIn * 1000
    });
    
    return url;
  }
} 