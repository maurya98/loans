import { IStorageService } from './IStorageService';
import { BlobServiceClient, ContainerClient, BlobSASPermissions } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';

export class AzureStorageService implements IStorageService {
  private readonly containerClient: ContainerClient;

  constructor() {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING || ''
    );
    this.containerClient = blobServiceClient.getContainerClient(
      process.env.AZURE_STORAGE_CONTAINER_NAME || ''
    );
  }

  async upload(file: Express.Multer.File): Promise<string> {
    const blobName = `${uuidv4()}${file.originalname}`;
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype }
    });
    return blobName;
  }

  async download(path: string): Promise<Buffer> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(path);
    const response = await blockBlobClient.downloadToBuffer();
    return response;
  }

  async delete(path: string): Promise<void> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(path);
    await blockBlobClient.delete();
  }

  async getSignedUrl(path: string, operation: 'upload' | 'download', expiresIn: number = 3600): Promise<string> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(path);
    const startDate = new Date();
    const expiryDate = new Date(startDate);
    expiryDate.setSeconds(startDate.getSeconds() + expiresIn);

    const permissions = new BlobSASPermissions();
    if (operation === 'upload') {
      permissions.create = true;
      permissions.write = true;
    } else {
      permissions.read = true;
    }

    return blockBlobClient.generateSasUrl({
      permissions,
      expiresOn: expiryDate
    });
  }
} 