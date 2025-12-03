// Frontend/src/utils/graphql.js

import { Auth } from 'aws-amplify'; // <-- ADD THIS
import awsExports from './config/aws-exports'; // <-- ADD THIS

// Use exports from the new config file
const GRAPHQL_ENDPOINT = awsExports.aws_appsync_graphqlEndpoint;
// We no longer rely on VITE_GRAPHQL_API_KEY for authorized requests

export const graphqlRequest = async (query, variables = {}) => {
  // Get the JWT token from the currently authenticated user
  let token;
  try {
    const session = await Auth.currentSession();
    token = session.getIdToken().getJwtToken();
  } catch (e) {
    // If no user is logged in, you can handle this (e.g., throw or use API Key if configured for unauth access)
    // For now, we throw since most operations require a logged-in user
    throw new Error("Authentication required for this operation.");
  }

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token, // <-- USE JWT FOR AUTHORIZATION
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const result = await response.json();
  
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
};

// ... existing mutations and queries remain below ...
// The new logic to use the token is contained entirely in graphqlRequest.
// The rest of the file remains the same.
// ...
// ...
// ...
