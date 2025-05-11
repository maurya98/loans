# PDF Generation Service

A Node.js service for generating PDFs from HTML and PDF templates with support for variable substitution.

## Features

- Upload HTML or PDF templates
- Generate PDFs from templates with variable substitution
- Support for both HTML-to-PDF conversion and PDF form filling
- RESTful API endpoints
- PostgreSQL database with Sequelize ORM
- TypeScript support

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pdf-generation-service
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pdf_generation
DB_USER=postgres
DB_PASSWORD=your_password
UPLOAD_DIR=uploads
```

4. Create the PostgreSQL database:
```bash
createdb pdf_generation
```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## API Endpoints

### Upload Template
```
POST /templates
Content-Type: multipart/form-data

Parameters:
- template: File (HTML or PDF)
- type: string ('html' or 'pdf')
```

### Generate PDF
```
POST /templates/:templateId/generate
Content-Type: application/json

Body:
{
  "variable1": "value1",
  "variable2": "value2"
}
```

### List Templates
```
GET /templates
```

## Template Format

### HTML Templates
Use double curly braces for variable substitution:
```html
<h1>Hello {{name}}!</h1>
<p>Your order number is {{orderNumber}}</p>
```

### PDF Templates
Create PDF forms with form fields matching the variable names in your data.

## Error Handling

The service includes error handling for:
- Invalid template types
- Missing files
- Database connection issues
- PDF generation errors

## Security

- File size limits (5MB)
- CORS enabled
- Helmet security headers
- Input validation

## License

MIT 