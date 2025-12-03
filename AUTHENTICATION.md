# AWS Cognito Authentication Implementation

This document describes the AWS Cognito authentication system implemented for AudioByte.

## Architecture Overview

The authentication system uses:

- **AWS Cognito User Pool**: Manages user authentication and user data
- **AWS Cognito Identity Pool**: Provides AWS credentials for authenticated users
- **AWS Amplify**: Frontend library for Cognito integration
- **AppSync with Cognito**: GraphQL API secured with Cognito authentication

## Infrastructure Components

### Cognito User Pool

- Self sign-up enabled
- Email and username sign-in
- Email verification required
- Password policy: min 8 characters, requires uppercase, lowercase, and digits

### AppSync Authorization

- Primary: Cognito User Pool authentication
- Secondary: API Key (for backward compatibility)

## Frontend Components

### Authentication Context (`src/context/AuthContext.jsx`)

Provides authentication state and methods throughout the app:

- `user`: Current authenticated user
- `loading`: Loading state
- `isAuthenticated`: Boolean authentication status
- `register()`: Sign up new users
- `confirmRegistration()`: Verify email with code
- `login()`: Sign in existing users
- `logout()`: Sign out current user
- `getAuthToken()`: Get JWT token for API calls

### Pages

- **Login** (`src/pages/Login.jsx`): User sign-in
- **Signup** (`src/pages/Signup.jsx`): User registration with email verification
- **Profile** (`src/pages/Profile.jsx`): User profile with Cognito data

### Components

- **ProtectedRoute** (`src/components/ProtectedRoute.jsx`): Wraps routes requiring authentication

## Setup Instructions

### 1. Deploy Infrastructure

```bash
cd Infrastructure
cdk deploy
```

After deployment, note the following outputs:

- UserPoolId
- UserPoolClientId
- IdentityPoolId
- GraphQLApiUrl
- GraphQLApiKey

### 2. Configure Frontend

Create `Frontend/.env` file from `.env.example`:

```bash
cd Frontend
cp .env.example .env
```

Update `.env` with values from CDK outputs:

```env
VITE_GRAPHQL_ENDPOINT=<GraphQLApiUrl>
VITE_GRAPHQL_API_KEY=<GraphQLApiKey>
VITE_USER_POOL_ID=<UserPoolId>
VITE_USER_POOL_CLIENT_ID=<UserPoolClientId>
VITE_IDENTITY_POOL_ID=<IdentityPoolId>
VITE_AWS_REGION=us-east-1
```

### 3. Install Dependencies

```bash
cd Frontend
npm install
```

### 4. Run Application

```bash
npm run dev
```

## Authentication Flow

### Sign Up Flow

1. User fills signup form (username, email, password, optional full name)
2. Cognito creates user and sends verification email
3. User enters verification code
4. Account is confirmed and user is automatically logged in

### Sign In Flow

1. User enters username/email and password
2. Cognito validates credentials
3. Returns JWT tokens (ID token, Access token, Refresh token)
4. User is redirected to home page

### Protected Routes

All main routes (`/`, `/library`, `/upload`, `/profile`) require authentication:

- Unauthenticated users are redirected to `/login`
- Authentication state is checked via AuthContext

## GraphQL Integration

The `graphql.js` utility automatically includes authentication:

- Fetches JWT token from Cognito session
- Includes token in `Authorization` header
- Falls back to API Key if user is not authenticated

### Example Usage

```javascript
import { graphqlRequest, listMusicQuery } from "./utils/graphql";

// Automatically includes auth token
const data = await graphqlRequest(listMusicQuery);
```

## Backend Updates Needed

To fully integrate authentication, update your Lambda functions to:

1. **Extract User Info from Context**

```python
def handler(event, context):
    # Get user from Cognito claims
    claims = event['identity']['claims']
    user_id = claims['sub']
    username = claims['cognito:username']
    email = claims['email']
```

2. **Associate Music with Users**
   Update `upload_handler.py`, `list_handler.py`, and `delete_handler.py` to:

- Store `user_id` with music metadata
- Filter music by authenticated user
- Enforce ownership for delete operations

3. **Add User Data Resolvers**
   Create Lambda functions for:

- `getCurrentUser`: Return current user's profile
- `updateUserProfile`: Update user profile data

## Security Features

- Email verification required
- Strong password policy
- JWT-based authentication
- Automatic token refresh
- Secure credential storage via AWS Amplify
- Per-user data isolation

## Testing

1. **Sign Up**: Create new account and verify email
2. **Sign In**: Login with credentials
3. **Protected Routes**: Try accessing routes without auth
4. **Logout**: Verify logout clears session
5. **Token Refresh**: Test long sessions (tokens auto-refresh)

## Troubleshooting

### "User does not exist" error

- Ensure user has verified their email
- Check User Pool in AWS Console

### "Not authorized" errors

- Verify environment variables are set correctly
- Check that CDK stack deployed successfully
- Ensure tokens are being sent in requests

### Email not received

- Check spam folder
- Verify email configuration in Cognito User Pool
- Check SES settings if in sandbox mode

## Next Steps

1. Update Lambda functions to use Cognito user context
2. Add user profile management features
3. Implement social sign-in (Google, Facebook)
4. Add password reset functionality
5. Implement user statistics tracking
6. Add user-to-user following/followers
