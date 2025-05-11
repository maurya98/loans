import { IStorageService } from './IStorageService';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken';

export class LocalStorageService implements IStorageService {
  private readonly uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File): Promise<string> {
    const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
    const filePath = path.join(this.uploadDir, fileName);
    
    await fs.promises.writeFile(filePath, file.buffer);
    return fileName;
  }

  async download(filePath: string): Promise<Buffer> {
    const fullPath = path.join(this.uploadDir, filePath);
    return fs.promises.readFile(fullPath);
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(this.uploadDir, filePath);
    await fs.promises.unlink(fullPath);
  }

  async getSignedUrl(path: string, operation: 'upload' | 'download', expiresIn: number = 3600): Promise<string> {
    const token = jwt.sign(
      {
        path,
        operation,
        exp: Math.floor(Date.now() / 1000) + expiresIn
      },
      process.env.JWT_SECRET || 'your-secret-key'
    );

    return `${process.env.API_URL || 'http://localhost:3000'}/api/documents/${operation}/${token}`;
  }
} 