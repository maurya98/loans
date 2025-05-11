# KYC Service with DigiLocker Integration

A Node.js-based KYC (Know Your Customer) service that integrates with DigiLocker for Aadhaar-based identity verification. Built with TypeScript, Express, and PostgreSQL.

## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Flow Diagram](#flow-diagram)
- [Database Schema](#database-schema)
- [Development](#development)

## Features
- DigiLocker integration for Aadhaar verification
- RESTful API endpoints for KYC operations
- PostgreSQL database with Sequelize ORM
- TypeScript support
- Environment-based configuration
- Error handling and validation

## Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- DigiLocker API credentials
- TypeScript

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kyc-service
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kyc_service
DB_USER=postgres
DB_PASSWORD=your_password

# DigiLocker Configuration
DIGILOCKER_CLIENT_ID=your_client_id
DIGILOCKER_CLIENT_SECRET=your_client_secret
DIGILOCKER_REDIRECT_URI=http://localhost:3000/api/kyc/callback
DIGILOCKER_API_URL=https://api.digitallocker.gov.in/public/oauth2/1
```

4. Build the project:
```bash
npm run build
```

5. Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
```

## Project Structure
```
kyc-service/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── controllers/
│   │   └── kyc.controller.ts
│   ├── models/
│   │   └── Kyc.ts
│   ├── routes/
│   │   └── kyc.routes.ts
│   ├── services/
│   │   └── digilocker.service.ts
│   └── app.ts
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## API Documentation

### 1. Initiate KYC Process
Initiates the KYC process by generating a DigiLocker authorization URL.

- **URL**: `/api/kyc/initiate`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "authUrl": "https://api.digitallocker.gov.in/public/oauth2/1/authorize?response_type=code&client_id=..."
  }
  ```

### 2. DigiLocker Callback
Handles the callback from DigiLocker after user authorization.

- **URL**: `/api/kyc/callback`
- **Method**: `GET`
- **Query Parameters**:
  - `code`: Authorization code from DigiLocker
- **Response**:
  ```json
  {
    "message": "KYC process initiated successfully",
    "kycId": "123"
  }
  ```

### 3. Get KYC Status
Retrieves the current status of a KYC verification.

- **URL**: `/api/kyc/status/:kycId`
- **Method**: `GET`
- **URL Parameters**:
  - `kycId`: ID of the KYC record
- **Response**:
  ```json
  {
    "status": "pending|verified|rejected"
  }
  ```

### 4. Verify KYC
Manually verifies a KYC record.

- **URL**: `/api/kyc/verify/:kycId`
- **Method**: `POST`
- **URL Parameters**:
  - `kycId`: ID of the KYC record
- **Response**:
  ```json
  {
    "message": "KYC verified successfully"
  }
  ```

## Flow Diagram

1. **KYC Initiation**:
   - User requests KYC verification
   - System generates DigiLocker authorization URL
   - User is redirected to DigiLocker

2. **DigiLocker Authorization**:
   - User authorizes access to their DigiLocker account
   - DigiLocker redirects back with authorization code

3. **Data Processing**:
   - System exchanges code for access token
   - Fetches Aadhaar details from DigiLocker
   - Creates KYC record in database

4. **Verification**:
   - System verifies Aadhaar details
   - Updates KYC status
   - Notifies user of verification result

## Database Schema

### KYC Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary Key |
| userId | STRING | User identifier |
| aadhaarNumber | STRING | Aadhaar number |
| name | STRING | Full name |
| dateOfBirth | DATE | Date of birth |
| gender | STRING | Gender |
| address | TEXT | Full address |
| digilockerId | STRING | DigiLocker identifier |
| status | ENUM | Status (pending/verified/rejected) |
| verificationDate | DATE | Date of verification |
| createdAt | DATE | Record creation date |
| updatedAt | DATE | Record update date |

## Development

### Available Scripts
- `npm start`: Start the production server
- `npm run dev`: Start the development server with hot-reload
- `npm run build`: Build the TypeScript project
- `npm test`: Run tests (to be implemented)

### Error Handling
The service includes basic error handling for:
- Invalid authorization codes
- Database connection issues
- DigiLocker API errors
- Invalid KYC records

### Security Considerations
- All API endpoints should be protected with authentication
- Sensitive data should be encrypted
- API keys and secrets should be properly secured
- Input validation should be implemented
- Rate limiting should be considered

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the ISC License. 