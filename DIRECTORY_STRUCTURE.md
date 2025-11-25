# Directory Structure & Purpose

Complete breakdown of the folder structure and the role of each directory.

## Root Level

```
SFDC_Deployment/
├── backend/              # Express.js API server
├── frontend/             # React application
├── README.md             # Project overview
├── COMMON_PITFALLS.md    # Troubleshooting guide
├── DIRECTORY_STRUCTURE.md # This file
└── .gitignore           # Git ignore rules
```

---

## Backend Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── routes/          # Express route definitions
│   ├── controllers/     # Route handlers
│   ├── services/        # Business logic layer
│   ├── utils/           # Helper functions
│   ├── jobs/            # Cron job schedulers
│   ├── middlewares/     # Express middleware
│   └── index.js         # Application entry point
├── package.json         # Node dependencies
├── .env.sample          # Environment variable template
└── API_DOCS.md          # API documentation
```

### /src/config - Configuration & Environment

**Purpose:** Centralized configuration management

**Files:**
- `env.js` - Environment variable validation and access
- `cors.js` - CORS configuration with origin whitelist
- `salesforce.js` - SF API endpoints and constants

**Why Separate?**
- Single source of truth for settings
- Easy to update API versions
- Environment-specific configurations

---

### /src/routes - API Route Definitions

**Purpose:** Define HTTP endpoints

**Files:**
- `authRoutes.js` - OAuth authentication routes
- `metadataRoutes.js` - Metadata operations
- `compareRoutes.js` - Comparison operations
- `deployRoutes.js` - Deployment operations
- `backupRoutes.js` - Backup operations

**Pattern:**
```javascript
router.get('/path', controller.method);
```

**Why Separate from Controllers?**
- Clean separation of routing logic
- Easy to see all available endpoints
- Middleware can be applied at route level

---

### /src/controllers - Route Handlers

**Purpose:** Handle HTTP requests/responses

**Files:**
- `authController.js` - Auth flow handling
- `metadataController.js` - Metadata request handling
- `compareController.js` - Comparison request handling
- `deployController.js` - Deployment request handling
- `backupController.js` - Backup request handling

**Responsibilities:**
- Parse request data
- Call appropriate service methods
- Format responses
- Handle HTTP status codes

**NOT Responsible For:**
- Business logic (belongs in services)
- Direct API calls (belongs in services)
- Data transformation (belongs in utils)

---

### /src/services - Business Logic Layer

**Purpose:** Core application logic and external API interactions

#### /services/salesforce - Salesforce API Clients

**Files:**
- `oauthService.js` - OAuth 2.0 flow (native implementation)
- `restClient.js` - REST API client (axios-based)
- `toolingClient.js` - Tooling API client
- `metadataClient.js` - Metadata API SOAP client
- `soapClient.js` - Partner API SOAP client

**Why Native APIs Only?**
- No dependency on jsforce or wrappers
- Full control over API calls
- Better understanding of Salesforce APIs
- Smaller bundle size

**Key Principle:** Each client is self-contained and handles one API type

#### /services/compare - Comparison Engine

**Purpose:** Compare metadata between orgs

**Files:**
- `compareService.js` - Diff algorithms

**Responsibilities:**
- Identify added/removed/modified components
- Generate diff reports
- Handle XML and JSON comparison

#### /services/deploy - Deployment Engine

**Purpose:** Orchestrate deployments

**Files:**
- `deployService.js` - Deployment orchestration

**Responsibilities:**
- Create deployment packages
- Monitor async deploy status
- Handle validation vs. actual deploy
- Implement quick deploy

#### /services/backup - Backup Management

**Purpose:** Create and manage metadata backups

**Files:**
- `backupService.js` - Backup operations

**Responsibilities:**
- Retrieve metadata from SF
- Store backups locally
- Manage backup retention
- List backup history

---

### /src/utils - Helper Functions

**Purpose:** Reusable utility functions

**Files:**
- `logger.js` - Winston logger configuration
- `soapHelper.js` - SOAP envelope builder/parser
- `zipHelper.js` - ZIP creation/extraction
- `diffHelper.js` - Text/XML/JSON diff utilities

**Characteristics:**
- Pure functions (no side effects)
- Reusable across services
- Well-tested
- No business logic

---

### /src/jobs - Scheduled Tasks

**Purpose:** Cron jobs and background tasks

**Files:**
- `scheduler.js` - Job scheduler setup

**Use Cases:**
- Automated backups
- Cleanup old files
- Token refresh
- Health checks

**Configuration:**
- Cron expressions in `.env`
- Can be enabled/disabled per environment

---

### /src/middlewares - Express Middleware

**Purpose:** Request/response interceptors

**Files:**
- `authMiddleware.js` - Session validation
- `errorHandler.js` - Global error handling
- `rateLimiter.js` - Rate limiting

**Execution Order:**
1. CORS (from cors package)
2. Body parsers
3. Rate limiter
4. Auth middleware (on protected routes)
5. Route handler
6. Error handler (if error occurs)

---

## Frontend Structure

```
frontend/
├── public/
│   └── index.html       # HTML template
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components
│   ├── services/        # API service wrappers
│   ├── context/         # React Context providers
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── types/           # Type definitions
│   ├── App.js           # Main app component
│   ├── App.css          # Global styles
│   ├── index.js         # React entry point
│   ├── index.css        # Base styles
│   └── config.js        # Frontend configuration
└── package.json         # React dependencies
```

### /src/components - Reusable UI Components

**Purpose:** Shared UI building blocks

**Files:**
- `Header.js` / `Header.css` - App header with navigation

**Characteristics:**
- Reusable across pages
- Self-contained
- Props-based configuration
- No direct API calls (use services)

**Example Structure:**
```javascript
function Component({ prop1, prop2 }) {
  return <div>...</div>;
}
```

---

### /src/pages - Page Components

**Purpose:** Full-page views

**Files:**
- `AuthPage.js` - Login page
- `AuthCallback.js` - OAuth callback handler
- `MetadataPage.js` - Metadata browser
- `ComparePage.js` - Org comparison
- `DeployPage.js` - Deployment interface
- `BackupPage.js` - Backup management
- `CommonPage.css` - Shared page styles

**Characteristics:**
- One page per route
- Orchestrate multiple components
- Handle page-level state
- Call API services

---

### /src/services - API Wrappers

**Purpose:** Abstract backend API calls

**Files:**
- `apiClient.js` - Axios instance with interceptors
- `authService.js` - Auth API calls
- `metadataService.js` - Metadata API calls
- `compareService.js` - Comparison API calls
- `deployService.js` - Deployment API calls
- `backupService.js` - Backup API calls

**Why Separate Services?**
- Single responsibility
- Easy to test
- Consistent error handling
- Centralized API configuration

**Pattern:**
```javascript
export const service = {
  async method(params, headers) {
    const response = await apiClient.post(url, data, { headers });
    return response.data;
  }
};
```

**CRITICAL:** All services call backend, NEVER Salesforce directly!

---

### /src/context - React Context

**Purpose:** Global state management

**Files:**
- `SalesforceContext.js` - SF session & org state

**Provides:**
- Session token
- Org information
- Authentication status
- Auth header builder
- Login/logout functions

**Why Context?**
- Avoid prop drilling
- Centralized auth state
- Easy to access from any component

---

### /src/hooks - Custom React Hooks

**Purpose:** Reusable stateful logic

**Files:**
- `useFetchMetadata.js` - Metadata fetching logic
- `useDeploy.js` - Deployment logic

**Benefits:**
- Encapsulate complex logic
- Reusable across components
- Separate concerns
- Easier testing

**Pattern:**
```javascript
export function useCustomHook() {
  const [state, setState] = useState();
  
  const method = useCallback(async () => {
    // Logic here
  }, []);

  return { state, method };
}
```

---

### /src/utils - Utility Functions

**Purpose:** Helper functions for formatting

**Files:**
- `formatters.js` - Format XML, JSON, dates, file sizes

**Characteristics:**
- Pure functions
- No side effects
- Reusable
- Easy to test

---

### /src/types - Type Definitions

**Purpose:** JSDoc type definitions (TypeScript-ready)

**Files:**
- `index.js` - Type definitions

**Benefits:**
- Documentation
- IDE autocomplete
- Type safety (with TypeScript)
- API contract definition

---

## Key Architecture Decisions

### 1. Backend as Proxy
**Decision:** All Salesforce API calls go through backend

**Rationale:**
- Salesforce doesn't support CORS
- Security (no credentials in frontend)
- Token refresh handling
- Rate limit management

### 2. Native APIs Only
**Decision:** No jsforce or wrapper libraries

**Rationale:**
- Full understanding of APIs
- No black-box dependencies
- Smaller bundle size
- Learning exercise

### 3. Service Layer Pattern
**Decision:** Separate services from controllers

**Rationale:**
- Reusable business logic
- Easier testing
- Clear separation of concerns
- Can swap implementations

### 4. Async Operations
**Decision:** Poll for deploy/retrieve status

**Rationale:**
- Metadata API is async by design
- Better user experience (progress updates)
- Handle long-running operations
- Prevent timeouts

### 5. Session Management
**Decision:** Custom session store (in-memory for dev)

**Rationale:**
- Full control over session lifecycle
- Easy to add Redis later
- Refresh token handling
- Multi-org support

---

## Data Flow

### Authentication Flow
```
Frontend → Backend → Salesforce
   ↓
Generate Auth URL
   ↓
Redirect to SF
   ↓
User Logs In
   ↓
SF → Backend (callback)
   ↓
Exchange code for token
   ↓
Create session
   ↓
Redirect to Frontend
   ↓
Store session token
```

### API Request Flow
```
Frontend Component
   ↓
Call Service Method
   ↓
HTTP Request to Backend
   ↓
Route → Controller
   ↓
Auth Middleware (validate session)
   ↓
Service Method
   ↓
Salesforce API Client
   ↓
HTTP Request to Salesforce
   ↓
Response Processing
   ↓
Return to Frontend
   ↓
Update Component State
```

### Deployment Flow
```
1. User selects components (Frontend)
2. Build deployment package (Frontend)
3. Send to backend (API call)
4. Create ZIP (Backend util)
5. Initiate deploy (Metadata Client)
6. Get deploy ID (Salesforce)
7. Return ID to frontend
8. Poll status (Frontend → Backend → SF)
9. Display progress
10. Show final result
```

---

## Environment Variables

### Backend (.env)
```
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Salesforce OAuth
SF_LOGIN_URL=https://login.salesforce.com
SF_CLIENT_ID=...
SF_CLIENT_SECRET=...
SF_CALLBACK_URL=http://localhost:5000/api/auth/callback
SF_OAUTH_SCOPES=api refresh_token web full
SF_API_VERSION=59.0

# Security
SESSION_SECRET=...
SESSION_TIMEOUT=7200000
ALLOWED_ORIGINS=http://localhost:3000

# Features
ENABLE_SCHEDULED_BACKUPS=false
BACKUP_CRON_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Extension Points

### Adding New Metadata Type Support
1. Add type to `salesforce.js` config
2. Create type-specific service if needed
3. Add UI components in frontend
4. Update comparison logic if needed

### Adding New Salesforce API
1. Create new client in `/services/salesforce/`
2. Follow existing pattern (REST/SOAP)
3. Add error handling
4. Create service tests

### Adding Authentication Method
1. Update `oauthService.js` or create new service
2. Add routes in `authRoutes.js`
3. Update `authController.js`
4. Update frontend auth flow

### Adding Background Job
1. Create job function in `/jobs/`
2. Register in `scheduler.js`
3. Add cron expression to `.env`
4. Add enable/disable flag

---

## Testing Strategy

### Backend Tests
- Unit tests for services
- Integration tests for API endpoints
- Mock Salesforce responses
- Test error scenarios

### Frontend Tests
- Component tests (React Testing Library)
- Service tests (mock axios)
- Context tests
- Hook tests

### E2E Tests
- Full authentication flow
- Deploy workflow
- Comparison workflow
- Error handling

---

## Production Considerations

### Backend
- [ ] Use Redis for session storage
- [ ] Add request logging
- [ ] Implement proper secrets management
- [ ] Set up monitoring
- [ ] Configure production CORS
- [ ] Enable HTTPS
- [ ] Add request validation
- [ ] Implement circuit breakers

### Frontend
- [ ] Build optimization
- [ ] CDN for static assets
- [ ] Error boundary components
- [ ] Analytics integration
- [ ] Performance monitoring
- [ ] Bundle size optimization

### DevOps
- [ ] CI/CD pipeline
- [ ] Automated testing
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] Load balancing
- [ ] Database backups
- [ ] Disaster recovery plan
