import { Document } from '../entities/Document';
import { StorageFactory } from './storage/StorageFactory';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export class DocumentService {
  private storageService = StorageFactory.getStorageService();

  async uploadDocument(file: Express.Multer.File, metadata?: any) {
    // Calculate MD5 hash of the file
    const fileHash = crypto.createHash('md5').update(file.buffer).digest('hex');

    // Check if document with same hash exists
    const existingDocument = await Document.findOne({ 
      raw: true, 
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'metadata']
      },
      where: { hash: fileHash } 
    });

    if (existingDocument) {
      return {
        status: 409,
        data: {
          ...existingDocument,
          message: 'A document with the same content already exists'
        }
      };
    }

    const storagePath = await this.storageService.upload(file);
    
    const document = await Document.create({
      fileName: file.originalname,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      hash: fileHash,
      storageType: process.env.STORAGE_TYPE || 'local',
      storagePath,
      metadata: JSON.stringify(metadata || {})
    });
    
    return {
      status: 201,
      data: document
    };
  }

  async updateDocumentAfterUpload(documentId: string, file: Express.Multer.File) {
    const document = await Document.findByPk(documentId);
    
    if (!document) {
      throw new Error('Document not found');
    }

    // Calculate MD5 hash of the file
    const fileHash = crypto.createHash('md5').update(file.buffer).digest('hex');

    // Update document with actual file details
    await document.update({
      size: file.size,
      hash: fileHash
    });

    return {
      status: 200,
      data: document
    };
  }

  async generateUploadSignedUrl(fileName: string, mimeType: string, metadata?: any) {
    if (!fileName || !mimeType) {
      throw new Error('fileName and mimeType are required');
    }

    // Generate a unique path for the file
    const fileExtension = fileName.split('.').pop();
    const storagePath = `${uuidv4()}.${fileExtension}`;

    // Create a temporary document record
    const document = await Document.create({
      fileName,
      originalName: fileName,
      mimeType,
      size: 0, // Will be updated after actual upload
      hash: '', // Will be updated after actual upload
      storageType: process.env.STORAGE_TYPE || 'local',
      storagePath,
      metadata: JSON.stringify(metadata || {})
    });

    // Get signed URL for upload with callback
    const callbackUrl = `${process.env.API_URL || 'http://localhost:3000'}/api/documents/upload-callback`;
    const signedUrl = await this.storageService.getSignedUrl(
      storagePath,
      'upload',
      3600,
      {
        callbackUrl,
        documentId: document.id.toString()
      }
    );

    return {
      signedUrl,
      documentId: document.id,
      storagePath
    };
  }

  async handleUploadCallback(documentId: string, etag: string, contentLength: number) {
    const document = await Document.findByPk(documentId);
    
    if (!document) {
      throw new Error('Document not found');
    }

    // Update document with actual file details
    await document.update({
      size: contentLength,
      hash: etag.replace(/"/g, '') // Remove quotes from ETag
    });

    return document;
  }
} 