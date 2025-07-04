export interface IStorageService {
  upload(file: Express.Multer.File): Promise<string>;
  download(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
  getSignedUrl(
    path: string, 
    operation: 'upload' | 'download', 
    expiresIn?: number,
    metadata?: { callbackUrl?: string, documentId?: string }
  ): Promise<string>;
  getObjectMetadata(path: string): Promise<{ ETag: string, ContentLength: number }>;
} 