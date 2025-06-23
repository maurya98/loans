# API Gateway Admin Interface

A modern, responsive admin interface for managing API Gateway configurations, monitoring health, and viewing metrics.

## 🚀 Features

- **Real-time Health Monitoring** - Monitor API Gateway status and uptime
- **Live Metrics Dashboard** - View request statistics, response times, and error rates
- **Route Management** - Create, update, and delete API routes with full CRUD operations
- **Authentication System** - Secure login with JWT token management
- **Responsive Design** - Modern UI built with Tailwind CSS and Heroicons

## 🏗️ Architecture

This admin interface is fully integrated with the actual API Gateway from the `../api-gateway` folder, providing:

- **Health Check Integration** - Real-time status monitoring
- **Metrics Collection** - Performance and error tracking
- **Route Management** - Dynamic route configuration
- **Authentication** - Secure access control

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd api-gateway-admin
   ```

2. **Run the setup script**
   ```bash
   npm run setup
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the API Gateway** (in a separate terminal)
   ```bash
   cd ../api-gateway
   npm install
   npm run dev
   ```

5. **Start the admin interface**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3001](http://localhost:3001)

## 🔐 Authentication

Use the demo credentials to log in:
- **Username**: `admin`
- **Password**: `password`

## 🛠️ Configuration

The application uses environment variables for configuration. Create a `.env.local` file:

```env
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3000
```

## 📊 Available Features

### Dashboard
- Overview of system status
- Quick access to key metrics
- Recent activity feed

### Health Monitoring
- Real-time health status
- Uptime tracking
- Connection status
- Service availability

### Metrics Dashboard
- Request statistics
- Response time analysis
- Error rate monitoring
- Performance trends

### Route Management
- Create new API routes
- Configure authentication
- Set rate limits
- Manage caching
- Route priority settings

### Authentication
- Secure login system
- JWT token management
- Session handling
- User management

## 🏛️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── Authentication.tsx # Auth management
│   ├── Dashboard.tsx      # Main dashboard
│   ├── Health.tsx         # Health monitoring
│   ├── Metrics.tsx        # Metrics dashboard
│   ├── Routes.tsx         # Route management
│   └── Sidebar.tsx        # Navigation sidebar
└── utils/                 # Utility functions
    └── api.ts            # API client and types
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run setup` - Run setup script

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **HTTP Client**: Axios
- **Charts**: Recharts (for metrics visualization)

## 📈 API Integration

The admin interface integrates with the following API Gateway endpoints:

- `GET /health` - Health status
- `GET /metrics` - System metrics
- `POST /auth/login` - User authentication
- `GET /auth/me` - Current user info
- `GET /api/routes` - List routes
- `POST /api/routes` - Create route
- `PUT /api/routes/:id` - Update route
- `DELETE /api/routes/:id` - Delete route

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the [INTEGRATION.md](./INTEGRATION.md) file for detailed integration information
- Open an issue on GitHub
- Review the API Gateway documentation

---

Built with ❤️ using Next.js and Tailwind CSS
