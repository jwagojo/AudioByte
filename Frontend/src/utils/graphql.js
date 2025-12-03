// Frontend/src/utils/graphql.js

import { fetchAuthSession } from 'aws-amplify/auth';
import awsExports from '../config/aws-exports';

// Use exports from the new config file
const GRAPHQL_ENDPOINT = awsExports.aws_appsync_graphqlEndpoint;
// We no longer rely on VITE_GRAPHQL_API_KEY for authorized requests

export const graphqlRequest = async (query, variables = {}) => {
  // Get the JWT token from the currently authenticated user
  let token;
  try {
    const session = await fetchAuthSession();
    token = session.tokens?.idToken?.toString();
    if (!token) {
      throw new Error("No authentication token found");
    }
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

export const createMusicMutation = `
  mutation CreateMusic(
    $title: String!
    $artist: String
    $album: String
    $duration: Int
  ) {
    createMusic(
      title: $title
      artist: $artist
      album: $album
      duration: $duration
    ) {
      music_id
      upload_url
      message
    }
  }
`;

export const listMusicQuery = `
  query ListMusic {
    listMusic {
      music_id
      title
      artist
      album
      duration
      file_url
      stream_url
      uploaded_at
    }
  }
`;

export const getMusicQuery = `
  query GetMusic($music_id: ID!) {
    getMusic(music_id: $music_id) {
      music_id
      title
      artist
      album
      duration
      file_url
      uploaded_at
    }
  }
`;

export const deleteMusicMutation = `
  mutation DeleteMusic($music_id: ID!) {
    deleteMusic(music_id: $music_id) {
      music_id
      title
    }
  }
`;