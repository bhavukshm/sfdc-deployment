# Detailed guide describing the codebase and flow of the application.

## Visit Site
Will open [index.js](./public/index.js) file. This runs [App.js](./src/App.js) file.

## App.js and SalesforceContext.js
This is the main component of the application. It uses [BrowserRouter](https://reactrouter.com/docs/en/v6.14.2/api#browserrouter) to navigate between different pages.

This uses [SalesforceContext.js](./src/context/SalesforceContext.js) to store/check the Salesforce authentication state.

App.js first checks if sessionId and orgId is stored in localstorage or not. If yes, it sets following variables: session, orgInfo, isAuthenticated.

## Routing
After setting variables in SalesforceContext, it routes the app to default route ('/'). Which opens [Authpage.js](./src/pages/AuthPage.js).

Here it checks if user is authenticated already or not by using SalesforceContext. 
- YES
    - It will redirect to '/metadata' route.
- NO
    - It will redirect to '/' route.

## Unauthorized route:
[Authpage.js](./src/pages/Authpage.js) will open and on pressing **Connect to Salesforce** button, it will call getAuthorizationUrl in [authService.js](./src/services/authService.js), which will make a get request to '/auth/authorize' endpoint of backend using axios with the help of [apiClient.js](./src/services/apiClient.js).

apiClient makes a request to REACT_APP_API_URL environment variable or 'http://localhost:5000/api' as default endpoint and '/auth/authorize' as default path.

## Backend for /auth/authorize
Backend handles the request on `/api/auth` route. It goes to index.js which routes the request to [authRoutes.js](./src/routes/authRoutes.js).

authRouter calls authorize method in [authController.js](./src/controllers/authController.js) file. This method generates a PKCE code verifier and code challenge and then generates a authorizationUrl to redirect user to salesforce login page. It also stores the code verifier in session.

User will be redirected to salesforce login page and will have to login using their salesforce credentials.

After successful login, Salesforce will redirect user to 'http://localhost:5000/api/auth/callback' (callback url must be configured in salesforce connected app) with a code and state parameter.

Backend handles the request on `/api/auth/callback` route. It goes to index.js which routes the request to [authRoutes.js](./src/routes/authRoutes.js).

authRouter calls callback method in [authController.js](./src/controllers/authController.js) file (Web Server Flow 2 of Salesforce auth apis). This method exchanges the code for token and then generates a session for the user. It also stores the session in session storage and then redirects the user to '/auth/callback' route of frontend which redirects to '/metadata' route of frontend.