# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All endpoints (except `/auth/*`) require authentication headers:

```
X-Session-Token: <session_token>
X-Org-Id: <org_id>
```

---

## Auth Endpoints

### GET /auth/authorize
Generate OAuth authorization URL.

**Response:**
```json
{
  "authorizationUrl": "https://login.salesforce.com/services/oauth2/authorize?...",
  "state": "random_state"
}
```

### GET /auth/callback
OAuth callback endpoint (redirects to frontend).

**Query Parameters:**
- `code` - Authorization code
- `state` - State parameter

### POST /auth/refresh
Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:**
```json
{
  "accessToken": "new_access_token",
  "instanceUrl": "https://instance.salesforce.com",
  "issuedAt": "1234567890"
}
```

### POST /auth/logout
Logout and revoke token.

**Request Body:**
```json
{
  "sessionToken": "session_token",
  "orgId": "org_id",
  "accessToken": "access_token"
}
```

---

## Metadata Endpoints

### GET /metadata/describe
Describe org metadata.

**Response:**
```json
{
  "metadataObjects": [...],
  "organizationNamespace": "",
  "partialSaveAllowed": true,
  "testRequired": false
}
```

### GET /metadata/list/:type
List metadata of specific type.

**Parameters:**
- `type` - Metadata type (e.g., ApexClass)

**Query Parameters:**
- `folder` - Optional folder name

### POST /metadata/retrieve
Initiate metadata retrieve.

**Request Body:**
```json
{
  "retrieveRequest": {
    "types": [
      {
        "name": "ApexClass",
        "members": ["*"]
      }
    ]
  }
}
```

**Response:**
```json
{
  "id": "retrieve_id",
  "done": false,
  "state": "Queued"
}
```

### GET /metadata/retrieve/status/:retrieveId
Check retrieve status.

**Response:**
```json
{
  "id": "retrieve_id",
  "done": true,
  "success": true,
  "zipFile": "base64_encoded_zip"
}
```

---

## Comparison Endpoints

### POST /compare/metadata
Compare metadata between orgs.

**Request Body:**
```json
{
  "sourceMetadata": {...},
  "targetMetadata": {...}
}
```

**Response:**
```json
{
  "onlyInSource": [...],
  "onlyInTarget": [...],
  "modified": [...],
  "identical": [...]
}
```

---

## Deployment Endpoints

### POST /deploy/deploy
Deploy metadata package.

**Request Body:**
```json
{
  "deploymentPackage": {
    "types": [...],
    "apiVersion": "59.0",
    "files": [...]
  },
  "options": {
    "checkOnly": false,
    "rollbackOnError": true
  }
}
```

**Response:**
```json
{
  "deployId": "deploy_id",
  "status": "InProgress",
  "success": false
}
```

### GET /deploy/deploy/status/:deployId
Check deployment status.

**Query Parameters:**
- `includeDetails` - Include component details (true/false)

**Response:**
```json
{
  "id": "deploy_id",
  "done": true,
  "success": true,
  "status": "Succeeded",
  "componentSuccesses": [...],
  "componentFailures": []
}
```

### POST /deploy/validate
Validate deployment (checkOnly).

**Request Body:** Same as `/deploy/deploy`

### POST /deploy/quickDeploy/:validationId
Quick deploy after validation.

---

## Backup Endpoints

### POST /backup/create
Create new backup.

**Request Body:**
```json
{
  "metadataTypes": ["ApexClass", "ApexTrigger", "CustomObject"]
}
```

**Response:**
```json
{
  "backupId": "backup_id",
  "path": "/path/to/backup",
  "timestamp": "2024-01-01T00:00:00Z",
  "componentCount": 150
}
```

### GET /backup/list
List all backups.

**Query Parameters:**
- `orgId` - Optional org ID filter

**Response:**
```json
[
  {
    "backupId": "backup_id",
    "orgId": "org_id",
    "timestamp": "2024-01-01T00:00:00Z",
    "componentCount": 150
  }
]
```

### DELETE /backup/:backupId
Delete specific backup.

### POST /backup/cleanup
Clean up old backups based on retention policy.

**Response:**
```json
{
  "deletedCount": 5
}
```

---

## Error Responses

All endpoints may return error responses:

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Status Codes:**
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
- `502` - Salesforce API Error
