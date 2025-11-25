# Salesforce DevOps Platform

A full-stack Salesforce DevOps application similar to Gearset/Copado, built with Express.js and React.

## 🏗️ Architecture Overview

This application provides:
- **Salesforce Authentication** (OAuth 2.0)
- **Metadata Management** (Retrieve, Compare, Deploy)
- **Org Comparison** (side-by-side diff)
- **Automated Deployments** (CI/CD ready)
- **Backup & Restore** (scheduled and on-demand)

## 📦 Tech Stack

### Backend
- **Node.js** + **Express.js**
- **Native Salesforce APIs** (REST, SOAP, Metadata, Tooling)
- **No wrapper libraries** (jsforce, etc.)
- **axios** for HTTP calls
- **adm-zip** for ZIP handling
- **xml2js** for XML parsing

### Frontend
- **React** (Create React App)
- **axios** for API calls
- **React Router** for navigation
- **Context API** for state management

## 🚀 Getting Started

### Prerequisites
- Node.js v16+ and npm
- Salesforce Connected App (for OAuth)

### Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

1. Create backend `.env` file:
```bash
cd backend
cp .env.sample .env
# Edit .env with your Salesforce credentials
```

2. Update frontend API URL in `frontend/src/config.js`

### Running the Application

```bash
# Start backend (port 5000)
cd backend
npm run dev

# Start frontend (port 3000)
cd frontend
npm start
```

## 📁 Project Structure

```
.
├── backend/          # Express.js API server
│   ├── src/
│   │   ├── config/           # Configuration & environment
│   │   ├── routes/           # API endpoints
│   │   ├── controllers/      # Route handlers
│   │   ├── services/         # Business logic
│   │   │   ├── salesforce/   # SF API clients
│   │   │   ├── compare/      # Comparison engine
│   │   │   ├── deploy/       # Deployment engine
│   │   │   └── backup/       # Backup utilities
│   │   ├── utils/            # Helper functions
│   │   ├── jobs/             # Scheduled tasks
│   │   └── middlewares/      # Express middlewares
│   └── package.json
│
└── frontend/         # React application
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── pages/            # Page components
    │   ├── services/         # API wrappers
    │   ├── context/          # React Context
    │   ├── hooks/            # Custom React hooks
    │   ├── utils/            # Helper functions
    │   └── types/            # Type definitions
    └── package.json
```

## 🔐 Security

- **Never** commit `.env` files
- All Salesforce API calls are proxied through the backend
- CORS is configured with origin whitelist
- OAuth tokens are stored securely (consider Redis for production)

## ⚠️ Common Pitfalls

### 1. CORS Issues
- **Never** call Salesforce APIs directly from the frontend
- All requests must go through the Express backend
- Configure proper CORS origin whitelist

### 2. OAuth Configuration
- Ensure callback URL matches exactly in Salesforce Connected App
- Format: `http://localhost:5000/api/auth/callback`
- Include all required OAuth scopes

### 3. Metadata API Deployment
- **Asynchronous** deployments return immediately with job ID
- Must poll `checkDeployStatus` to monitor progress
- Handle large deployments (>10MB) with proper chunking

### 4. ZIP File Handling
- Metadata API requires specific ZIP structure
- Must include `package.xml` at root
- Component files in correct directory structure

### 5. API Rate Limits
- Salesforce enforces API call limits per 24-hour period
- Implement request throttling and retry logic
- Cache responses when possible

### 6. Session Management
- OAuth tokens expire (typically 2 hours)
- Implement automatic refresh token flow
- Handle session expiration gracefully

### 7. SOAP API Complexity
- Hand-crafted SOAP envelopes require exact XML structure
- Include proper namespace declarations
- Handle SOAP faults correctly

## 📖 API Documentation

See `backend/API_DOCS.md` for detailed API endpoint documentation.

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📝 License

MIT
