import { Request, Response, NextFunction } from 'express';
import { Document } from '../entities/Document';
import { StorageFactory } from '../services/storage/StorageFactory';

export class DocumentController {
  private storageService = StorageFactory.getStorageService();

  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const storagePath = await this.storageService.upload(req.file);
      
      const document = await Document.create({
        fileName: req.file.originalname,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        storageType: process.env.STORAGE_TYPE || 'local',
        storagePath,
        metadata: JSON.stringify(req.body.metadata || {})
      });
      
      res.status(201).json(document);
    } catch (error) {
      next(error);
    }
  }

  async getSignedUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, operation } = req.params;
      const document = await Document.findByPk(id);
      
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      const signedUrl = await this.storageService.getSignedUrl(
        document.storagePath,
        operation as 'upload' | 'download'
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
} 