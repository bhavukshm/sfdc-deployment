# Common Pitfalls & Troubleshooting Guide

## 🚫 1. CORS Issues

### Problem
Frontend cannot call Salesforce APIs directly due to CORS restrictions.

### Symptoms
- Browser console shows: `CORS policy: No 'Access-Control-Allow-Origin' header`
- Failed requests to `*.salesforce.com` domains

### Solution
✅ **Always proxy through backend**
- All Salesforce API calls MUST go through Express backend
- Frontend only calls `http://localhost:5000/api/*`
- Backend makes actual Salesforce API calls

### Why?
1. Salesforce doesn't support CORS for most APIs
2. Exposes credentials in browser (security risk)
3. Cannot handle OAuth refresh flow client-side
4. No way to secure API tokens in frontend code

---

## 🔐 2. OAuth Callback URL Mismatch

### Problem
OAuth callback fails with "redirect_uri_mismatch" error.

### Symptoms
- Redirected to Salesforce error page after login
- Error message about callback URL not matching

### Solution
✅ **Exact URL match required**

In Salesforce Connected App:
```
http://localhost:5000/api/auth/callback
```

In `.env` file:
```
SF_CALLBACK_URL=http://localhost:5000/api/auth/callback
```

### Important Notes
- Protocol must match (`http://` vs `https://`)
- Port must match exactly
- No trailing slashes
- Case-sensitive
- Production: Use HTTPS and update Connected App

---

## ⚙️ 3. Metadata API: Synchronous vs Asynchronous

### Problem
Expecting immediate deploy/retrieve results.

### Symptoms
- Getting only an ID back from deploy
- No ZIP file in retrieve response
- Unclear deployment status

### Solution
✅ **Metadata API is ASYNCHRONOUS**

**Deploy Flow:**
```javascript
// 1. Initiate deploy - returns immediately
const result = await client.deploy(zipBuffer);
// result = { id: '0Af...' }

// 2. Poll for status
while (!done) {
  const status = await client.checkDeployStatus(result.id);
  if (status.done) break;
  await sleep(5000); // Wait 5 seconds
}
```

**Retrieve Flow:**
```javascript
// 1. Initiate retrieve
const result = await client.retrieve(retrieveRequest);

// 2. Poll for completion
while (!done) {
  const status = await client.checkRetrieveStatus(result.id);
  if (status.done && status.zipFile) {
    // Now ZIP is available
    break;
  }
  await sleep(5000);
}
```

### Polling Best Practices
- Start with 5-second intervals
- Increase interval for long-running operations
- Set reasonable timeout (5-30 minutes)
- Handle partial success/failure states

---

## 📦 4. ZIP File Structure Issues

### Problem
Deployment fails with "invalid zip file" or "missing package.xml"

### Symptoms
- Deploy returns error immediately
- "package.xml not found" message
- Component files not recognized

### Solution
✅ **Correct ZIP structure required**

```
deployment.zip
├── package.xml           ← MUST be at root
├── classes/
│   ├── MyClass.cls
│   └── MyClass.cls-meta.xml
├── triggers/
│   ├── MyTrigger.trigger
│   └── MyTrigger.trigger-meta.xml
└── objects/
    └── Custom_Object__c/
        ├── fields/
        │   └── Field__c.field-meta.xml
        └── Custom_Object__c.object-meta.xml
```

### Package.xml Requirements
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
  <types>
    <members>MyClass</members>
    <name>ApexClass</name>
  </types>
  <version>59.0</version>
</Package>
```

### Common Mistakes
- ❌ package.xml in subdirectory
- ❌ Missing `-meta.xml` files
- ❌ Wrong directory names
- ❌ Incorrect XML namespace

---

## 📊 5. API Rate Limits

### Problem
Requests fail with "REQUEST_LIMIT_EXCEEDED" error.

### Symptoms
- 403 errors from Salesforce
- Message about daily API limit
- Intermittent failures during bulk operations

### Solution
✅ **Implement throttling and caching**

**Rate Limit Tracking:**
```javascript
// Check limits before heavy operations
const limits = await restClient.getLimits();
const remaining = limits.DailyApiRequests.Remaining;

if (remaining < 100) {
  throw new Error('API limit nearly exceeded');
}
```

**Throttling Pattern:**
```javascript
// Delay between requests
async function throttledRequests(items, delay = 1000) {
  const results = [];
  for (const item of items) {
    results.push(await processItem(item));
    await sleep(delay); // 1 second between requests
  }
  return results;
}
```

**Caching Strategy:**
```javascript
// Cache describe results (changes infrequently)
const cache = new Map();

async function describeSObject(type) {
  if (cache.has(type)) {
    return cache.get(type);
  }
  
  const result = await client.describeSObject(type);
  cache.set(type, result);
  return result;
}
```

### API Limit Hierarchy
1. **Per-org daily limit** (varies by edition)
2. **Concurrent request limit** (25 max)
3. **Bulk API has separate limits**
4. **Some operations don't count** (login, logout)

---

## 🔄 6. Session Management & Token Expiration

### Problem
Requests fail after initial success with "Invalid Session ID"

### Symptoms
- Works initially, then fails after ~2 hours
- "INVALID_SESSION_ID" error
- Need to re-authenticate

### Solution
✅ **Implement automatic token refresh**

**Backend Token Refresh:**
```javascript
async function makeAuthenticatedRequest(client, operation) {
  try {
    return await operation();
  } catch (error) {
    if (error.message.includes('INVALID_SESSION')) {
      // Refresh token
      const newToken = await OAuthService.refreshAccessToken(
        session.refreshToken
      );
      
      // Update session
      session.accessToken = newToken.access_token;
      
      // Retry operation
      return await operation();
    }
    throw error;
  }
}
```

**Session Expiration Times:**
- Access Token: ~2 hours (default)
- Refresh Token: Until revoked or changed password
- Session timeout configurable in Salesforce Setup

**Best Practices:**
- Store refresh tokens securely
- Implement automatic refresh before expiration
- Handle refresh failures gracefully
- Use Redis/database for session storage (not in-memory)

---

## 🧪 7. SOAP API Complexity

### Problem
Hand-crafted SOAP envelopes fail with mysterious errors.

### Symptoms
- "unexpected element" errors
- "Invalid SOAP request" messages
- Namespace-related failures

### Solution
✅ **Follow exact XML structure**

**Correct SOAP Envelope:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope 
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
  xmlns:met="http://soap.sforce.com/2006/04/metadata">
  <soapenv:Header>
    <met:SessionHeader>
      <met:sessionId>SESSION_ID_HERE</met:sessionId>
    </met:SessionHeader>
  </soapenv:Header>
  <soapenv:Body>
    <met:deploy>
      <met:ZipFile>BASE64_ZIP_HERE</met:ZipFile>
      <met:DeployOptions>
        <met:rollbackOnError>true</met:rollbackOnError>
        ...
      </met:DeployOptions>
    </met:deploy>
  </soapenv:Body>
</soapenv:Envelope>
```

**Common Mistakes:**
- ❌ Wrong namespace prefix
- ❌ Missing namespace declarations
- ❌ Incorrect element order
- ❌ Typos in element names (case-sensitive)
- ❌ Missing session header

**Debugging SOAP:**
```javascript
// Log raw SOAP request/response
console.log('SOAP Request:', soapEnvelope);
const response = await axios.post(url, soapEnvelope);
console.log('SOAP Response:', response.data);
```

---

## 🏢 8. Salesforce Edition Differences

### Problem
Features work in one org but not another.

### Symptoms
- API calls return "Feature not enabled"
- Different API limits
- Missing metadata types

### Common Differences by Edition

| Feature | Developer | Professional | Enterprise | Unlimited |
|---------|-----------|--------------|------------|-----------|
| API Calls/Day | 15,000 | 1,000 | 25,000 | Unlimited |
| Metadata API | ✅ | Limited | ✅ | ✅ |
| Sandboxes | 0 | 0 | 1 | Unlimited |
| Apex Code | ✅ | ❌ | ✅ | ✅ |

### Solution
- Check org edition before operations
- Gracefully handle feature unavailability
- Document minimum required edition

---

## 📝 9. Connected App Configuration

### Problem
OAuth fails immediately or intermittently.

### Required Setup in Salesforce
1. Setup → App Manager → New Connected App
2. Enable OAuth Settings
3. Callback URL: `http://localhost:5000/api/auth/callback`
4. Selected OAuth Scopes:
   - `api` - API access
   - `refresh_token` - Refresh token
   - `web` - Web access
   - `full` - Full access (for development)
5. Save and note Consumer Key/Secret

### Important Settings
- ✅ "Require Secret for Web Server Flow" = Checked
- ✅ "Enable Client Credentials Flow" = Optional
- ✅ IP Relaxation = "Relax IP restrictions" (for development)

---

## 🐛 Quick Debugging Checklist

When something fails:

1. ☑️ Check backend logs for errors
2. ☑️ Verify `.env` configuration
3. ☑️ Confirm OAuth tokens are valid
4. ☑️ Check Salesforce API limits
5. ☑️ Validate SOAP XML structure
6. ☑️ Verify ZIP package structure
7. ☑️ Test with Salesforce Workbench
8. ☑️ Check Connected App permissions
9. ☑️ Review Salesforce debug logs
10. ☑️ Verify API version compatibility

---

## 📚 Additional Resources

- [Salesforce REST API Guide](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/)
- [Metadata API Guide](https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/)
- [OAuth 2.0 Guide](https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_web_server_flow.htm)
- [Salesforce Workbench](https://workbench.developerforce.com/) - Test API calls
- [API Rate Limits](https://developer.salesforce.com/docs/atlas.en-us.salesforce_app_limits_cheatsheet.meta/salesforce_app_limits_cheatsheet/salesforce_app_limits_platform_api.htm)
