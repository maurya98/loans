import { Request, Response, NextFunction } from 'express';
import { Document } from '../entities/Document';
import { StorageFactory } from '../services/storage/StorageFactory';
import { DocumentService } from '../services/DocumentService';
import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken';

export class DocumentController {
  private storageService = StorageFactory.getStorageService();
  private documentService = new DocumentService();

  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // If token is provided, verify it
      if (req.params.token) {
        if (!process.env.JWT_SECRET) {
          throw new Error('JWT_SECRET is not configured');
        }

        try {
          jwt.verify(req.params.token, process.env.JWT_SECRET);
        } catch (error) {
          return res.status(401).json({ message: 'Invalid or expired token' });
        }
      }

      const result = await this.documentService.uploadDocument(req.file, req.body.metadata);
      res.status(result.status).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  async getSignedUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const document = await Document.findByPk(id);

      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      const signedUrl = await this.storageService.getSignedUrl(
        document.storagePath,
        'download'
      );

      res.json({ signedUrl });
    } catch (error) {
      next(error);
    }
  }

  async download(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const document = await Document.findByPk(id);

      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      const fileBuffer = await this.storageService.download(document.storagePath);

      res.setHeader('Content-Type', document.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
      res.send(fileBuffer);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const document = await Document.findByPk(id);

      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      await this.storageService.delete(document.storagePath);
      await document.destroy();

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const documents = await Document.findAll();
      res.json(documents);
    } catch (error) {
      next(error);
    }
  }

  async generateUploadSignedUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileName, mimeType } = req.body;
      
      const result = await this.documentService.generateUploadSignedUrl(
        fileName,
        mimeType,
        req.body.metadata
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async handleUploadCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentId } = req.body;
      const etag = req.headers['etag'];
      const contentLength = parseInt(req.headers['content-length'] || '0', 10);

      if (!documentId || !etag) {
        return res.status(400).json({ 
          message: 'documentId and etag are required' 
        });
      }

      const document = await this.documentService.handleUploadCallback(
        documentId,
        etag,
        contentLength
      );

      res.json(document);
    } catch (error) {
      next(error);
    }
  }
} 