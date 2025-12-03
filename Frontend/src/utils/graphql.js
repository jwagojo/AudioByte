import { fetchAuthSession } from 'aws-amplify/auth';

const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT
const API_KEY = import.meta.env.VITE_GRAPHQL_API_KEY

export const graphqlRequest = async (query, variables = {}, useAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  // Try to use Cognito authentication if available, otherwise fall back to API key
  if (useAuth) {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (token) {
        headers['Authorization'] = token;
      } else {
        headers['x-api-key'] = API_KEY;
      }
    } catch (error) {
      // If auth fails, use API key
      headers['x-api-key'] = API_KEY;
    }
  } else {
    headers['x-api-key'] = API_KEY;
  }

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers,
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
      user_id
      username
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
      user_id
      username
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

export const getCurrentUserQuery = `
  query GetCurrentUser {
    getCurrentUser {
      user_id
      username
      email
      fullname
      created_at
      total_tracks
      total_plays
      followers
      following
    }
  }
`;

export const updateUserProfileMutation = `
  mutation UpdateUserProfile($fullname: String) {
    updateUserProfile(fullname: $fullname) {
      user_id
      username
      email
      fullname
    }
  }
`;
