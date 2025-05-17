# PDF Generation Service API Specification

## Base URL
```
http://localhost:8080/api
```

## Authentication
Currently, the API does not require authentication. Future versions may implement JWT or OAuth2 authentication.

## API Endpoints

### 1. Upload Template
Upload a new HTML or PDF template to the system.

**Endpoint:** `POST /templates`

**Content-Type:** `multipart/form-data`

**Request Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | File | Yes | The template file (HTML or PDF) |
| type | String | Yes | Template type: "HTML" or "PDF" |

**Response:**
```json
{
    "id": 1,
    "name": "sample-invoice.html",
    "type": "HTML",
    "filePath": "uploads/abc123.html",
    "createdAt": "2024-03-15T10:30:00",
    "updatedAt": "2024-03-15T10:30:00"
}
```

**Status Codes:**
- 200: Success
- 400: Bad Request (invalid file type or missing parameters)
- 500: Internal Server Error

### 2. Get Template Fields
Retrieve all input fields and sample data structure for a template.

**Endpoint:** `GET /templates/{templateId}/fields`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| templateId | Long | ID of the template |

**Response:**
```json
{
    "variables": [
        "companyName",
        "companyAddress",
        "companyPhone",
        "companyEmail",
        "invoiceNumber",
        "invoiceDate",
        "dueDate",
        "customerName",
        "customerAddress",
        "customerPhone",
        "customerEmail",
        "subtotal",
        "taxRate",
        "taxAmount",
        "total",
        "paymentTerms"
    ],
    "loops": [
        "items"
    ],
    "sampleData": {
        "companyName": "Sample CompanyName",
        "companyAddress": "123 Sample Street, City, State 12345",
        "companyPhone": "(555) 123-4567",
        "companyEmail": "example@email.com",
        "invoiceNumber": "12345",
        "invoiceDate": "2024-03-15",
        "dueDate": "2024-03-15",
        "customerName": "Sample CustomerName",
        "customerAddress": "123 Sample Street, City, State 12345",
        "customerPhone": "(555) 123-4567",
        "customerEmail": "example@email.com",
        "subtotal": 0.00,
        "taxRate": "Sample TaxRate",
        "taxAmount": 0.00,
        "total": 0.00,
        "paymentTerms": "Sample PaymentTerms",
        "items": [
            {
                "itemsName": "Sample Item",
                "itemsDescription": "Sample Description",
                "itemsQuantity": 1,
                "itemsPrice": 0.00
            }
        ]
    }
}
```

**Status Codes:**
- 200: Success
- 404: Template not found
- 500: Internal Server Error

### 3. Generate PDF
Generate a PDF using a template and provided data.

**Endpoint:** `POST /templates/{templateId}/generate`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| templateId | Long | ID of the template |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| password | String | No | Optional password to protect the generated PDF. If provided, the PDF will be encrypted and require this password to open. |

**Request Body:**
```json
{
    "companyName": "Acme Corporation",
    "companyAddress": "123 Business St, Suite 100\nNew York, NY 10001",
    "companyPhone": "(555) 123-4567",
    "companyEmail": "billing@acme.com",
    "invoiceNumber": "INV-2024-001",
    "invoiceDate": "2024-03-15",
    "dueDate": "2024-04-15",
    "customerName": "John Doe",
    "customerAddress": "456 Customer Ave\nNew York, NY 10002",
    "customerPhone": "(555) 987-6543",
    "customerEmail": "john.doe@example.com",
    "items": [
        {
            "itemName": "Web Development",
            "itemDescription": "Website redesign and implementation",
            "quantity": 1,
            "unitPrice": "5000.00",
            "amount": "5000.00"
        }
    ],
    "subtotal": "5000.00",
    "taxRate": "8.875",
    "taxAmount": "443.75",
    "total": "5443.75",
    "paymentTerms": "30"
}
```

**Response:**
- Content-Type: `application/json`
```json
{
    "fileName": "generated-1234567890.pdf",
    "contentType": "application/pdf",
    "data": "JVBERi0xLjcKCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDI..."  // Base64 encoded PDF content
}
```

**Status Codes:**
- 200: Success
- 404: Template not found
- 400: Bad Request (invalid data)
- 500: Internal Server Error

**Example Usage:**
```bash
# Generate PDF without password
curl -X POST http://localhost:8080/api/templates/1/generate \
  -H "Content-Type: application/json" \
  -d @invoice-data.json

# Generate password-protected PDF
curl -X POST "http://localhost:8080/api/templates/1/generate?password=mysecret" \
  -H "Content-Type: application/json" \
  -d @invoice-data.json
```

### 4. List Templates
Retrieve a list of all available templates.

**Endpoint:** `GET /templates`

**Response:**
```json
[
    {
        "id": 1,
        "name": "sample-invoice.html",
        "type": "HTML",
        "filePath": "uploads/abc123.html",
        "createdAt": "2024-03-15T10:30:00",
        "updatedAt": "2024-03-15T10:30:00"
    }
]
```

**Status Codes:**
- 200: Success
- 500: Internal Server Error

## Error Responses

All error responses follow this format:
```json
{
    "timestamp": "2024-03-15T10:30:00",
    "status": 400,
    "error": "Bad Request",
    "message": "Detailed error message",
    "path": "/api/templates"
}
```

## Rate Limiting
Currently, there are no rate limits implemented. Future versions may include rate limiting based on IP address or API key.

## File Size Limits
- Maximum file size for template upload: 5MB
- Maximum request size: 5MB

## Template Variable Syntax
- Simple variables: `{{variableName}}`
- Loop start: `{{#loopName}}`
- Loop end: `{{/loopName}}`

## Example Usage

### 1. Upload a Template
```bash
curl -X POST http://localhost:8080/api/templates \
  -F "file=@sample-invoice.html" \
  -F "type=HTML"
```

### 2. Get Template Fields
```bash
curl http://localhost:8080/api/templates/1/fields
```

### 3. Generate PDF
```bash
curl -X POST http://localhost:8080/api/templates/1/generate \
  -H "Content-Type: application/json" \
  -d @invoice-data.json
```

### 4. List Templates
```bash
curl http://localhost:8080/api/templates
```