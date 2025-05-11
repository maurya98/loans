import { IStorageService } from './IStorageService';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, GetObjectCommandInput } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

export class S3StorageService implements IStorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    });
    this.bucketName = process.env.S3_BUCKET_NAME || '';
  }

  async upload(file: Express.Multer.File): Promise<string> {
    const key = `${uuidv4()}${file.originalname}`;
    await this.s3Client.send(new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    }));
    return key;
  }

  async download(path: string): Promise<Buffer> {
    const response = await this.s3Client.send(new GetObjectCommand({
      Bucket: this.bucketName,
      Key: path
    }));
    return Buffer.from(await response.Body?.transformToByteArray() || []);
  }

  async delete(path: string): Promise<void> {
    await this.s3Client.send(new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: path
    }));
  }

  async getSignedUrl(path: string, operation: 'upload' | 'download', expiresIn: number = 3600): Promise<string> {
    const command = operation === 'upload' 
      ? new PutObjectCommand({ Bucket: this.bucketName, Key: path })
      : new GetObjectCommand({ Bucket: this.bucketName, Key: path });
    
    return getSignedUrl(this.s3Client, command, { expiresIn });
  }
} 