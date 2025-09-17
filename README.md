# CuppingLab - Professional Coffee Cupping SaaS Platform

A comprehensive multi-tenant SaaS platform for professional coffee cupping, quality assessment, and analytics.

## 🚀 Features

### Core Functionality
- **Multi-tenant Architecture**: Secure tenant isolation with subdomain routing
- **Cupping Sessions**: Create, manage, and conduct professional coffee cupping sessions
- **Sample Management**: Track coffee samples with detailed metadata and scoring
- **Real-time Collaboration**: Multiple cuppers can participate in sessions simultaneously
- **Advanced Analytics**: Comprehensive reports and data visualization

### SaaS Features
- **Organization Management**: Multi-user organizations with role-based access
- **Subscription Plans**: Tiered pricing with usage-based limits
- **Billing Integration**: Stripe-powered subscription and payment management
- **User Roles**: Admin, Cupper, and Viewer permissions
- **Data Export**: PDF, Excel, and CSV export capabilities

### Technical Features
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: WebSocket integration for live session updates
- **Voice Transcription**: AI-powered voice notes during cupping
- **Custom Templates**: Configurable cupping forms and scoring systems
- **Flavor Wheels**: Interactive flavor descriptor wheels

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Cache**: Redis for sessions and caching
- **Authentication**: JWT with refresh tokens
- **File Storage**: AWS S3 compatible storage
- **Payments**: Stripe for subscription management

### Multi-tenancy
- **Strategy**: Shared database with tenant isolation
- **Security**: Row Level Security (RLS) policies
- **Routing**: Subdomain-based tenant identification
- **Data Isolation**: Tenant ID in all data models

## 🐳 Development Setup

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd cupping

# Start all services with Docker Compose
docker-compose up -d

# Install dependencies (for local development)
npm install

# Run database migrations
npm run db:migrate

# Seed the database
npm run db:seed

# Start development servers
npm run dev
```

### Services
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: PostgreSQL on port 5432
- **Redis**: Port 6379
- **Adminer**: http://localhost:8080 (Database admin)

## 📁 Project Structure

```
cupping/
├── apps/
│   ├── web/                 # Next.js frontend application
│   └── api/                 # Express.js backend API
├── packages/
│   ├── database/            # Prisma schema and migrations
│   ├── ui/                  # Shared UI components
│   └── types/               # Shared TypeScript types
├── docker/                  # Docker configurations
├── docs/                    # Documentation
└── scripts/                 # Build and deployment scripts
```

## 🔧 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/cuppinglab"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# AWS S3 (or compatible)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="cuppinglab-files"
```

## 🚀 Deployment

### Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### Environment-specific Configurations
- **Development**: `docker-compose.yml`
- **Staging**: `docker-compose.staging.yml`
- **Production**: `docker-compose.prod.yml`

## 📊 Database Schema

### Core Entities
- **Organizations**: Tenant organizations
- **Users**: User accounts with role-based access
- **CuppingSessions**: Cupping session metadata
- **Samples**: Coffee sample information
- **Scores**: Individual cupping scores and notes
- **Templates**: Custom cupping form templates

### Multi-tenancy
All data tables include `organization_id` for tenant isolation with RLS policies.

## 🔐 Security

- **Row Level Security**: PostgreSQL RLS for data isolation
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API rate limiting per tenant
- **Input Validation**: Comprehensive input sanitization
- **CORS**: Configured for secure cross-origin requests

## 📈 Monitoring & Analytics

- **Application Metrics**: Performance and usage tracking
- **Error Monitoring**: Comprehensive error logging
- **Database Monitoring**: Query performance and optimization
- **User Analytics**: Feature usage and engagement metrics

## 🧪 Testing

```bash
# Run all tests
npm test

# Run frontend tests
npm run test:web

# Run backend tests
npm run test:api

# Run integration tests
npm run test:integration

# Generate coverage report
npm run test:coverage
```

## 📚 Documentation

- [API Documentation](./docs/api.md)
- [Database Schema](./docs/database.md)
- [Deployment Guide](./docs/deployment.md)
- [Contributing Guide](./docs/contributing.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact: support@cuppinglab.com
- Documentation: https://docs.cuppinglab.com