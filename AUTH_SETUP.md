# Authentication Setup Guide

## Steps to Enable Authentication:

### 1. Deploy Infrastructure with Cognito

```bash
cd Infrastructure
source venv/Scripts/activate  # or `venv/Scripts/activate` on Windows
cdk deploy
```

This will create:

- Cognito User Pool
- Cognito User Pool Client
- AppSync API configured for Cognito auth

### 2. Get Cognito Configuration

After deployment completes, get your Cognito values:

```bash
# Option 1: Use the helper script
bash get-cognito-config.sh

# Option 2: Check AWS Console CloudFormation Outputs
# Go to CloudFormation > InfrastructureStack > Outputs tab
```

### 3. Update Frontend Configuration

Copy the example config:

```bash
cd ../Frontend/src/config
cp aws-exports.js.example aws-exports.js
```

Update `aws-exports.js` with your values from step 2:

```javascript
const awsExports = {
  aws_project_region: "us-east-1",
  aws_appsync_graphqlEndpoint: "YOUR_GRAPHQL_ENDPOINT",
  aws_appsync_region: "us-east-1",
  aws_appsync_authenticationType: "AMAZON_COGNITO_USER_POOLS",

  aws_cognito_region: "us-east-1",
  aws_user_pools_id: "YOUR_USER_POOL_ID", // From CloudFormation outputs
  aws_user_pools_web_client_id: "YOUR_CLIENT_ID", // From CloudFormation outputs
};
```

### 4. Test Authentication

```bash
cd Frontend
npm run dev
```

Visit http://localhost:5173/auth to:

1. Sign up with email/password
2. Check email for confirmation code
3. Confirm account
4. Sign in

## Features Enabled:

✅ **Protected Routes** - Library, Upload, Profile require login
✅ **Sign Up/Sign In** - Email-based authentication  
✅ **Email Verification** - Confirmation codes sent to email
✅ **JWT Authentication** - Secure GraphQL requests
✅ **Session Management** - Auto-login on page refresh
✅ **Logout** - Clear session

## How It Works:

1. **User signs up** → Cognito creates user account
2. **Email verification** → Cognito sends code to email
3. **User confirms** → Account activated
4. **User signs in** → Cognito returns JWT tokens
5. **GraphQL requests** → Include JWT in Authorization header
6. **AppSync validates** → Checks token with Cognito before allowing access

## Security Notes:

- `aws-exports.js` is gitignored (contains User Pool IDs)
- Passwords never stored - managed by Cognito
- JWT tokens auto-refresh
- AppSync validates every request
