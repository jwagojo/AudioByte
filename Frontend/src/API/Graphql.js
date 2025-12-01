const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT;
const GRAPHQL_API_KEY = import.meta.env.VITE_GRAPHQL_API_KEY;

export const graphqlRequest = async (query, variables = {}) => {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': GRAPHQL_API_KEY,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();
    
    if (result.errors) {
      console.error('GraphQL Errors:', result.errors);
      throw new Error(result.errors[0].message);
    }

    return result.data;
  } catch (error) {
    console.error('GraphQL Request Error:', error);
    throw error;
  }
};

// Query to list all music
export const listMusic = async () => {
  const query = `
    query ListMusic {
      listMusic {
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
  
  return await graphqlRequest(query);
};

// Query to get a specific music by ID
export const getMusic = async (music_id) => {
  const query = `
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
  
  return await graphqlRequest(query, { music_id });
};

// Mutation to create music and get upload URL
export const createMusic = async (title, artist, album, duration) => {
  const mutation = `
    mutation CreateMusic($title: String!, $artist: String, $album: String, $duration: Int) {
      createMusic(title: $title, artist: $artist, album: $album, duration: $duration) {
        music_id
        upload_url
        message
      }
    }
  `;
  
  return await graphqlRequest(mutation, { title, artist, album, duration });
};

// Mutation to delete music
export const deleteMusic = async (music_id) => {
  const mutation = `
    mutation DeleteMusic($music_id: ID!) {
      deleteMusic(music_id: $music_id) {
        music_id
        title
        artist
      }
    }
  `;
  
  return await graphqlRequest(mutation, { music_id });
};
