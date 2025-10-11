# Cupperly Application Architecture

## Overview

Cupperly is a full-stack coffee cupping SaaS platform with separate frontend and backend services.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         LOCAL DEVELOPMENT                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐              ┌──────────────────┐         │
│  │   Frontend Web   │              │   Backend API    │         │
│  │   (Next.js)      │─────────────▶│   (Express.js)   │         │
│  │                  │   HTTP       │                  │         │
│  │ localhost:3000   │   Requests   │ localhost:3001   │         │
│  └──────────────────┘              └──────────────────┘         │
│                                              │                   │
│                                              │                   │
│                                              ▼                   │
│                                     ┌──────────────────┐         │
│                                     │   PostgreSQL     │         │
│                                     │  localhost:5432  │         │
│                                     └──────────────────┘         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION (COOLIFY)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐         ┌──────────────────────┐      │
│  │   User's Browser     │         │   User's Browser     │      │
│  └──────────┬───────────┘         └──────────┬───────────┘      │
│             │                                 │                  │
│             │ HTTPS                           │ HTTPS            │
│             ▼                                 ▼                  │
│  ┌──────────────────────┐         ┌──────────────────────┐      │
│  │  demo.cupperly.com   │         │  api.cupperly.com    │      │
│  │  ┌────────────────┐  │         │  ┌────────────────┐  │      │
│  │  │  Frontend Web  │  │────────▶│  │  Backend API   │  │      │
│  │  │  (Next.js)     │  │  HTTPS  │  │  (Express.js)  │  │      │
│  │  │  Port: 3000    │  │ Requests│  │  Port: 3001    │  │      │
│  │  └────────────────┘  │         │  └────────┬───────┘  │      │
│  └──────────────────────┘         └───────────┼──────────┘      │
│                                                │                 │
│                                                │                 │
│                                                ▼                 │
│                                    ┌──────────────────────┐      │
│                                    │   PostgreSQL DB      │      │
│                                    │   (Coolify Service)  │      │
│                                    └──────────────────────┘      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend (Next.js)

**Technology**: Next.js 14 with React, TypeScript, Tailwind CSS

**Responsibilities**:
- User interface and user experience
- Client-side routing
- Form validation
- API communication
- Session management (client-side)

**Key Files**:
- `apps/web/src/lib/api.ts` - API client with axios
- `apps/web/next.config.js` - Next.js configuration
- `apps/web/src/app/` - Application pages and routes

**Environment Variables**:
- `NEXT_PUBLIC_API_URL` - Backend API URL (visible to browser)
- `NEXTAUTH_URL` - Frontend URL for authentication
- `NEXTAUTH_SECRET` - Secret for NextAuth.js

### Backend (Express.js)

**Technology**: Express.js with TypeScript, Prisma ORM

**Responsibilities**:
- RESTful API endpoints
- Authentication and authorization
- Database operations
- Business logic
- Data validation
- Session management (server-side)

**Key Files**:
- `apps/api/src/index.ts` - Main server file with CORS configuration
- `apps/api/src/routes/` - API route handlers
- `apps/api/src/controllers/` - Business logic
- `apps/api/src/middleware/` - Authentication, authorization, error handling

**Environment Variables**:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token generation
- `WEB_URL` - Frontend URL for CORS configuration
- `API_URL` - Backend API URL

### Database (PostgreSQL)

**Technology**: PostgreSQL with Prisma ORM

**Responsibilities**:
- Data persistence
- Relational data management
- Transaction support
- Data integrity

**Key Files**:
- `packages/database/prisma/schema.prisma` - Database schema
- `packages/database/prisma/migrations/` - Database migrations

## Data Flow

### Authentication Flow

```
1. User enters credentials in frontend (demo.cupperly.com)
   ↓
2. Frontend sends POST request to api.cupperly.com/api/auth/login
   ↓
3. Backend validates credentials against database
   ↓
4. Backend generates JWT tokens (access + refresh)
   ↓
5. Backend sends tokens in response
   ↓
6. Frontend stores tokens and includes in subsequent requests
   ↓
7. Backend validates JWT on each protected endpoint
```

### API Request Flow

```
1. User interacts with UI (e.g., creates a sample)
   ↓
2. Frontend calls API client method (e.g., api.createSample())
   ↓
3. API client adds authentication headers (JWT token)
   ↓
4. Request sent to api.cupperly.com/api/samples
   ↓
5. Backend middleware validates JWT token
   ↓
6. Backend middleware checks user permissions
   ↓
7. Backend controller processes request
   ↓
8. Backend queries/updates database via Prisma
   ↓
9. Backend sends response to frontend
   ↓
10. Frontend updates UI with response data
```

## Security Layers

### 1. CORS (Cross-Origin Resource Sharing)

**Location**: `apps/api/src/index.ts`

**Configuration**:
- Production: Only allows `demo.cupperly.com` and `*.cupperly.com`
- Development: Allows `localhost:3000` and `localhost:3001`
- Credentials: Enabled (allows cookies and auth headers)

### 2. Authentication (JWT)

**Location**: `apps/api/src/middleware/auth.ts`

**Flow**:
- User logs in → receives JWT access token + refresh token
- Access token expires in 15 minutes
- Refresh token expires in 7 days
- Frontend automatically refreshes tokens when needed

### 3. Authorization (Role-Based)

**Roles**:
- `ADMIN` - Full access to all features
- `CUPPER` - Limited access (create sessions, evaluate samples)

**Location**: `apps/api/src/middleware/authorize.ts`

### 4. Rate Limiting

**Configuration**:
- Window: 15 minutes (900,000 ms)
- Max requests: 100 (production) / 1000 (development)

### 5. Input Validation

**Technology**: Express-validator

**Location**: `apps/api/src/routes/*.ts` (validation middleware)

## Environment Configuration

### Local Development

| Service | URL | Port | Environment |
|---------|-----|------|-------------|
| Frontend | http://localhost:3000 | 3000 | development |
| Backend | http://localhost:3001 | 3001 | development |
| Database | localhost:5432 | 5432 | development |

**Configuration Files**:
- `.env` - Root environment variables
- `apps/api/.env` - Backend-specific variables

### Production (Coolify)

| Service | URL | Port | Environment |
|---------|-----|------|-------------|
| Frontend | https://demo.cupperly.com | 3000 | production |
| Backend | https://api.cupperly.com | 3001 | production |
| Database | Internal Coolify service | 5432 | production |

**Configuration**:
- Set in Coolify Dashboard → Environment Variables
- Separate services for frontend and backend
- Shared database and Redis services

## Key Features

### 1. Multi-Tenancy

**Implementation**: Tenant ID in request headers (`X-Tenant-ID`)

**Isolation**: All database queries filtered by organization ID

### 2. Real-Time Collaboration

**Technology**: WebSockets (planned)

**Use Case**: Multiple cuppers evaluating samples simultaneously

### 3. Voice Transcription

**Technology**: Web Speech API / External service (planned)

**Use Case**: Hands-free note-taking during cupping sessions

### 4. AI-Powered Summaries

**Technology**: Google Gemini API / OpenRouter

**Use Case**: Generate cupping session summaries and insights

### 5. PDF Report Generation

**Technology**: Custom PDF generation

**Use Case**: Professional cupping reports with charts and analysis

## Deployment Strategy

### Development

```bash
# Terminal 1: Start backend
cd apps/api
npm run dev

# Terminal 2: Start frontend
cd apps/web
npm run dev
```

### Production (Coolify)

**Two separate services**:

1. **Backend Service**
   - Repository: Your Git repo
   - Build: `cd apps/api && npm install && npm run build`
   - Start: `cd apps/api && npm start`
   - Domain: `api.cupperly.com`

2. **Frontend Service**
   - Repository: Same Git repo
   - Build: `cd apps/web && npm install && npm run build`
   - Start: `cd apps/web && npm start`
   - Domain: `demo.cupperly.com`

**Shared Services**:
- PostgreSQL database
- Redis (for caching/sessions)

## Monitoring and Logging

### Development

- Console logs in terminal
- Browser DevTools for frontend debugging
- Database queries logged by Prisma

### Production

- Coolify service logs
- Application logs (Winston/Morgan)
- Error tracking (planned: Sentry)
- Performance monitoring (planned: New Relic)

## Scaling Considerations

### Horizontal Scaling

- Frontend: Can run multiple instances behind load balancer
- Backend: Can run multiple instances (stateless design)
- Database: Single instance with connection pooling

### Caching

- Redis for session storage
- API response caching (planned)
- Static asset CDN (planned)

### Performance

- Database indexes on frequently queried fields
- Pagination for large datasets
- Lazy loading for images and components
- Code splitting in Next.js

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 | React framework with SSR |
| UI Library | Tailwind CSS | Utility-first CSS |
| State Management | React Hooks | Local state management |
| API Client | Axios | HTTP requests |
| Backend | Express.js | Node.js web framework |
| ORM | Prisma | Database abstraction |
| Database | PostgreSQL | Relational database |
| Authentication | JWT | Stateless auth tokens |
| Validation | Express-validator | Input validation |
| Security | Helmet, CORS | Security headers |
| Deployment | Coolify | Self-hosted PaaS |

## Next Steps

1. ✅ Configure environment variables for both services
2. ✅ Deploy backend to `api.cupperly.com`
3. ✅ Deploy frontend to `demo.cupperly.com`
4. 🔄 Test authentication flow
5. 🔄 Verify all API endpoints work
6. 📋 Set up monitoring and logging
7. 📋 Configure automated backups
8. 📋 Set up CI/CD pipeline

