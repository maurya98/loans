# Document Service

A flexible document service that supports multiple storage backends (Local, AWS S3, Azure Blob Storage, and Google Cloud Storage) with signed URL support for secure uploads and downloads.

## Features

- Multiple storage backend support (Local, S3, Azure, GCP)
- Signed URL generation for secure uploads and downloads
- RESTful API for document management
- TypeScript support
- PostgreSQL database integration
- File upload via API or web interface
- Configurable storage backend

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- TypeScript
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd document-service
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example` and configure your environment variables:
```bash
cp .env.example .env
```

4. Configure your database and storage settings in the `.env` file.

## Configuration

The service can be configured through environment variables:

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `DB_*`: Database configuration
- `STORAGE_TYPE`: Storage backend (local/s3/azure/gcp)
- Storage-specific configuration (AWS, Azure, or GCP credentials)

## Usage

### Start the server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

### API Endpoints

- `POST /api/documents/upload` - Upload a document
- `GET /api/documents/:id/signed-url/:operation` - Get signed URL for upload/download
- `GET /api/documents/:id/download` - Download a document
- `DELETE /api/documents/:id` - Delete a document
- `GET /api/documents` - List all documents

### Example Usage

1. Upload a document:
```bash
curl -X POST -F "file=@document.pdf" http://localhost:3000/api/documents/upload
```

2. Get a signed URL for download:
```bash
curl http://localhost:3000/api/documents/:id/signed-url/download
```

3. Download a document:
```bash
curl http://localhost:3000/api/documents/:id/download
```

## Storage Backends

### Local Storage
Files are stored in the local filesystem under the `uploads` directory.

### AWS S3
Configure your AWS credentials and bucket name in the `.env` file.

### Azure Blob Storage
Configure your Azure connection string and container name in the `.env` file.

### Google Cloud Storage
Configure your GCP project ID and bucket name in the `.env` file.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 