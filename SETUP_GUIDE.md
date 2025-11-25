# Setup Guide

Complete step-by-step guide to set up and run the Salesforce DevOps Platform.

## Prerequisites

Before starting, ensure you have:

- ✅ **Node.js v16+** and npm installed
- ✅ **Salesforce account** (Developer Edition or higher)
- ✅ **Git** (optional, for version control)
- ✅ **Code editor** (VS Code recommended)

---

## Step 1: Salesforce Connected App Setup

### 1.1 Create Connected App

1. Log in to your Salesforce org
2. Go to **Setup** → **App Manager**
3. Click **New Connected App**

### 1.2 Configure Basic Information

- **Connected App Name:** `SF DevOps Platform`
- **API Name:** `SF_DevOps_Platform`
- **Contact Email:** Your email

### 1.3 Enable OAuth Settings

Check: **Enable OAuth Settings**

**Callback URL:**
```
http://localhost:5000/api/auth/callback
```

**Selected OAuth Scopes:**
- Full access (full)
- Perform requests at any time (refresh_token, offline_access)
- Access and manage your data (api)
- Access your basic information (id, profile, email, address, phone)
- Access the identity URL service (openid)

### 1.4 Additional Settings

- **Require Secret for Web Server Flow:** ✅ Checked
- **Require Secret for Refresh Token Flow:** ✅ Checked
- **Enable Client Credentials Flow:** ⬜ Unchecked (optional)

### 1.5 Save and Get Credentials

1. Click **Save**
2. Click **Continue**
3. Copy **Consumer Key** (Client ID)
4. Click **Click to reveal** and copy **Consumer Secret** (Client Secret)

**⚠️ Important:** Keep these credentials secure!

---

## Step 2: Project Setup

### 2.1 Install Backend Dependencies

```bash
cd backend
npm install
```

This installs:
- express
- axios
- cors
- xml2js
- adm-zip
- node-cron
- winston
- And development dependencies

### 2.2 Configure Backend Environment

```bash
cd backend
cp .env.sample .env
```

Edit `.env` file:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Salesforce OAuth - REPLACE WITH YOUR VALUES
SF_LOGIN_URL=https://login.salesforce.com  # or https://test.salesforce.com for sandbox
SF_CLIENT_ID=YOUR_CONSUMER_KEY_HERE
SF_CLIENT_SECRET=YOUR_CONSUMER_SECRET_HERE
SF_CALLBACK_URL=http://localhost:5000/api/auth/callback
SF_OAUTH_SCOPES=api refresh_token web full
SF_API_VERSION=59.0

# Session Configuration
SESSION_SECRET=your_random_string_here_min_32_chars
SESSION_TIMEOUT=7200000

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Backup Configuration
BACKUP_DIRECTORY=./backups
BACKUP_RETENTION_DAYS=30

# Cron Jobs
ENABLE_SCHEDULED_BACKUPS=false
BACKUP_CRON_SCHEDULE=0 2 * * *
```

**Generate SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.3 Create Required Directories

```bash
mkdir -p backend/logs
mkdir -p backend/backups
```

### 2.4 Install Frontend Dependencies

```bash
cd frontend
npm install
```

This installs:
- react
- react-dom
- react-router-dom
- axios
- react-scripts

### 2.5 Configure Frontend (Optional)

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Step 3: Verify Connected App

### 3.1 Check Policies

Back in Salesforce Setup → App Manager:

1. Find your Connected App
2. Click dropdown → **Manage**
3. Click **Edit Policies**

**OAuth policies:**
- **Permitted Users:** All users may self-authorize
- **IP Relaxation:** Relax IP restrictions (for development)
- **Refresh Token Policy:** Refresh token is valid until revoked

Click **Save**

### 3.2 Test OAuth URL

In browser, visit:
```
https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:5000/api/auth/callback&scope=api%20refresh_token%20web%20full
```

Replace `YOUR_CLIENT_ID` with your actual Consumer Key.

You should see Salesforce login page. **Don't login yet** - just verify the page loads.

---

## Step 4: Start the Application

### 4.1 Start Backend Server

```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Server running on port 5000
📝 Environment: development
```

**Troubleshooting:**
- Port 5000 already in use? Change PORT in `.env`
- Missing environment variables? Check `.env` file
- Module not found? Run `npm install` again

### 4.2 Start Frontend Development Server

In a new terminal:

```bash
cd frontend
npm start
```

Expected output:
```
Compiled successfully!

You can now view sfdc-devops-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.x:3000
```

Browser should automatically open to `http://localhost:3000`

---

## Step 5: First Login

### 5.1 Click "Connect to Salesforce"

On the home page, click the button.

### 5.2 Authorize Application

1. You'll be redirected to Salesforce login
2. Enter your Salesforce credentials
3. Click **Log In**
4. Review permissions requested
5. Click **Allow**

### 5.3 Verify Success

- You should be redirected back to the app
- Header should show your username/org
- Navigation menu should appear

**If it fails:**
- Check browser console for errors
- Check backend logs
- Verify callback URL matches exactly
- Ensure Connected App is active

---

## Step 6: Verify Functionality

### 6.1 Test Metadata API

1. Navigate to **Metadata** page
2. Click "Describe Org Metadata"
3. Should see count of available metadata types

### 6.2 Test Backup (Optional)

1. Navigate to **Backup** page
2. Click "Create New Backup"
3. Wait for completion
4. Should appear in Backup History

---

## Development Workflow

### Backend Development

**Watch mode (auto-restart on changes):**
```bash
cd backend
npm run dev
```

**View logs:**
```bash
tail -f backend/logs/app.log
```

**Test API endpoints:**
```bash
# Health check
curl http://localhost:5000/health

# With authentication (replace tokens)
curl http://localhost:5000/api/metadata/describe \
  -H "X-Session-Token: your_token" \
  -H "X-Org-Id: your_org_id"
```

### Frontend Development

**Development server:**
```bash
cd frontend
npm start
```

Changes automatically reload in browser.

**Build for production:**
```bash
npm run build
```

---

## Troubleshooting

### Issue: "redirect_uri_mismatch"

**Solution:**
1. Check `.env` SF_CALLBACK_URL matches Connected App exactly
2. No trailing slash
3. Check http vs https
4. Port must match

### Issue: "INVALID_CLIENT"

**Solution:**
1. Verify SF_CLIENT_ID in `.env`
2. Verify SF_CLIENT_SECRET in `.env`
3. Check Connected App is active
4. Try regenerating Consumer Secret

### Issue: CORS errors in browser

**Solution:**
1. Verify backend is running
2. Check FRONTEND_URL in backend `.env`
3. Check ALLOWED_ORIGINS in backend `.env`
4. Clear browser cache

### Issue: "Session expired"

**Solution:**
- Refresh the page
- Log out and log back in
- Check SESSION_TIMEOUT setting

### Issue: Can't connect to Salesforce

**Solution:**
1. Verify SF_LOGIN_URL (login.salesforce.com vs test.salesforce.com)
2. Check firewall/proxy settings
3. Verify Salesforce org is accessible
4. Check API limits haven't been exceeded

### Issue: Backup fails

**Solution:**
1. Check BACKUP_DIRECTORY exists and is writable
2. Verify sufficient disk space
3. Check API limits
4. Review backend logs for details

---

## Next Steps

### Customize the Application

1. **Add more metadata types** - Edit `backend/src/config/salesforce.js`
2. **Modify UI** - Update React components in `frontend/src/components`
3. **Add features** - Create new services and routes
4. **Styling** - Customize CSS files

### Deploy to Production

See `README.md` for production deployment considerations:
- Use environment-specific URLs
- Enable HTTPS
- Use proper secret management
- Set up monitoring
- Configure production Connected App
- Use Redis for session storage

### Learn More

- [API Documentation](backend/API_DOCS.md)
- [Common Pitfalls](COMMON_PITFALLS.md)
- [Directory Structure](DIRECTORY_STRUCTURE.md)
- [Salesforce Developer Docs](https://developer.salesforce.com)

---

## Quick Command Reference

```bash
# Backend
cd backend
npm install              # Install dependencies
npm run dev             # Start development server
npm start               # Start production server
npm test                # Run tests

# Frontend
cd frontend
npm install              # Install dependencies
npm start               # Start development server
npm run build           # Build for production
npm test                # Run tests

# Both
npm install             # In root (if using workspaces)

# Useful
lsof -ti:5000 | xargs kill  # Kill process on port 5000 (Mac/Linux)
netstat -ano | findstr :5000  # Find process on port 5000 (Windows)
```

---

## Support

For issues or questions:
1. Check [Common Pitfalls](COMMON_PITFALLS.md)
2. Review backend logs
3. Check browser console
4. Test with Salesforce Workbench
5. Verify Connected App configuration

---

## Security Notes

⚠️ **Development Only:**
- Using `http://localhost` (not HTTPS)
- Storing sessions in memory (not persisted)
- Relaxed IP restrictions

⚠️ **Never Commit:**
- `.env` files
- Consumer Secret
- Access tokens
- Session tokens

⚠️ **Production Checklist:**
- [ ] Use HTTPS everywhere
- [ ] Store secrets in secret manager
- [ ] Use Redis for sessions
- [ ] Enable IP restrictions
- [ ] Set up monitoring
- [ ] Configure rate limiting
- [ ] Enable audit logging
- [ ] Regular security updates

---

You're now ready to use the Salesforce DevOps Platform! 🚀
