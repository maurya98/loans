import { IStorageService } from './IStorageService';
import { LocalStorageService } from './LocalStorageService';
import { S3StorageService } from './S3StorageService';
import { AzureStorageService } from './AzureStorageService';
import { GCPStorageService } from './GCPStorageService';

export class StorageFactory {
  private static instance: IStorageService;

  static getStorageService(): IStorageService {
    if (!this.instance) {
      const storageType = process.env.STORAGE_TYPE || 'local';

      switch (storageType.toLowerCase()) {
        case 's3':
          this.instance = new S3StorageService();
          break;
        case 'azure':
          this.instance = new AzureStorageService();
          break;
        case 'gcp':
          this.instance = new GCPStorageService();
          break;
        case 'local':
        default:
          this.instance = new LocalStorageService();
          break;
      }
    }

    return this.instance;
  }
} 