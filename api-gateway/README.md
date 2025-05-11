# API Gateway Project

Node.js + TypeScript + Sequelize (Postgres)

This project is a modular, extensible API Gateway implementing advanced API management, security, integration, monitoring, caching, and developer experience features.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Detailed Feature List](#detailed-feature-list)
4. [API Reference](#api-reference)
5. [Authentication & Authorization](#authentication--authorization)
6. [API Lifecycle & Governance](#api-lifecycle--governance)
7. [Rate Limiting & Analytics](#rate-limiting--analytics)
8. [Developer Portal & Self-Service](#developer-portal--self-service)
9. [Extending & Customization](#extending--customization)
10. [Example Workflows](#example-workflows)
11. [FAQ / Troubleshooting](#faq--troubleshooting)
12. [Appendix: Environment, Setup, and Tech Stack](#appendix-environment-setup-and-tech-stack)

---

## Project Overview

**API Gateway** is a modular, extensible platform built with Node.js, TypeScript, Express, and Sequelize (Postgres) for managing, securing, and monitoring APIs in a microservices or multi-API environment.

---

## Architecture Diagram

```
+-------------------+      +-------------------+      +-------------------+
|   Client/Consumer | ---> |   API Gateway     | ---> |   Backend Service |
+-------------------+      +-------------------+      +-------------------+
                                 |   |   |   |
                                 |   |   |   +--> Analytics/Logging DB
                                 |   |   +------> Developer Portal
                                 |   +----------> API Key Management
                                 +--------------> (API Docs)
```

---

## Detailed Feature List

- **API CRUD & Versioning**: Manage multiple APIs and their versions.
- **Lifecycle Management**: Draft, published, deprecated, retired.
- **Authentication**: API Key & JWT.
- **Authorization**: Role-based (admin/user).
- **Rate Limiting**: Global and per-API.
- **API Composition**: Orchestrate multiple backend calls.
- **Mocking**: Enable mock responses for any API.
- **Analytics**: Usage, error rates, latency.
- **Developer Portal**: Discover APIs, manage keys, download SDKs.
- **Self-Service**: Users manage their own API keys.
- **Governance**: Enforce standards, deprecation, and retirement.

---

## API Reference

### Authentication
- **API Key**:  `x-api-key: <your-api-key>`
- **JWT**:  `Authorization: Bearer <your-jwt>`

### API Management
| Method | Endpoint         | Description                | Auth      |
|--------|------------------|----------------------------|-----------|
| GET    | /apis            | List APIs                  | admin/user|
| POST   | /apis            | Create API                 | admin     |
| GET    | /apis/:id        | Get API by ID              | admin/user|
| PUT    | /apis/:id        | Update API                 | admin     |
| DELETE | /apis/:id        | Delete API                 | admin     |

**Example:**
```http
POST /apis
{
  "name": "Order Service",
  "version": "1",
  "basePath": "/orders",
  "defaultVersion": true,
  "lifecycleStatus": "published"
}
```

### API Key Management
| Method | Endpoint           | Description                | Auth      |
|--------|--------------------|----------------------------|-----------|
| GET    | /my/apikeys        | List your API keys         | user      |
| POST   | /my/apikeys        | Create new API key         | user      |
| DELETE | /my/apikeys/:id    | Revoke API key             | user      |

### Analytics
| Method | Endpoint                | Description                | Auth      |
|--------|-------------------------|----------------------------|-----------|
| GET    | /analytics/usage        | API usage (admin)          | admin     |
| GET    | /analytics/errors       | API error rates (admin)    | admin     |
| GET    | /analytics/latency      | API latency (admin)        | admin     |
| GET    | /analytics/my/usage     | Your API key usage         | user      |

### Proxy & Mocking
- **Proxy**: `/api/v1/resource` or `/api/resource` (uses default version)
- **Mocking**: If `mockEnabled` is true, returns `mockResponse`.

---

## Authentication & Authorization
- **API Key**: Issued per user per API. Use in `x-api-key` header.
- **JWT**: Issued on login (not shown here, but can be added).
- **Roles**:  
  - `admin`: Full access to all management endpoints.
  - `user`: Can only manage own API keys and view own analytics.

---

## API Lifecycle & Governance
- **lifecycleStatus**:  
  - `draft`: Not accessible to consumers.
  - `published`: Available for use.
  - `deprecated`: Available, but returns warning.
  - `retired`: Returns HTTP 410 Gone.
- **Deprecation/Retirement Dates**: Set for planning and automation.

---

## Rate Limiting & Analytics
- **Global**: 100 requests per 15 minutes per IP (default).
- **Per-API**: Set `rateLimit` and `rateLimitWindow` on API.
- **Analytics**:  
  - Usage, error rates, latency per API and per user.

---

## Developer Portal & Self-Service
- **Portal**: `/portal`
  - Lists APIs, links to docs, SDK download (stub), API key management instructions.
- **API Key Self-Service**: `/my/apikeys`
- **User Analytics**: `/analytics/my/usage`

---

## Extending & Customization
- **Add new features**: Create new routes/controllers/middleware.
- **Integrate Redis**: For distributed rate limiting and caching.
- **SDK Generation**: Use OpenAPI Generator for real SDKs.
- **UI**: Build a React/Vue SPA for the portal.

---

## Example Workflows

### Create and Use an API
1. **Admin creates API:**
   ```http
   POST /apis
   {
     "name": "Inventory",
     "version": "1",
     "basePath": "/inventory",
     "defaultVersion": true,
     "lifecycleStatus": "published"
   }
   ```
2. **User requests API key:**
   ```http
   POST /my/apikeys
   {
     "apiId": 1
   }
   ```
3. **User calls API:**
   ```http
   GET /api/v1/inventory
   x-api-key: <user-api-key>
   ```

### Enable Mocking for an API
```http
PATCH /apis/:id
{
  "mockEnabled": true,
  "mockResponse": "{ \"message\": \"This is a mock!\" }"
}
```

---

## FAQ / Troubleshooting
- **Q: Why do I get 403/410 errors?**  
  A: The API may be in `draft` or `retired` status. Only `published` and `deprecated` APIs are accessible.
- **Q: How do I get an API key?**  
  A: Use `/my/apikeys` endpoints after authenticating.
- **Q: How do I see my usage?**  
  A: Use `/analytics/my/usage`.

---

## Appendix: Environment, Setup, and Tech Stack
- **Node.js**, **TypeScript**, **Express**
- **Sequelize** (Postgres)
- **Morgan** for logging
- **Rate limiting** via express-rate-limit
- **Axios** for backend composition
- **JWT** and **API Key** authentication

**Setup:**
```bash
npm install
# Configure .env for Postgres
npx ts-node-dev src/server.ts
```

---

## License
MIT 