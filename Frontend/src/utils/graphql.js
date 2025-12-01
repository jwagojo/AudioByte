const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT
const API_KEY = import.meta.env.VITE_GRAPHQL_API_KEY

export const graphqlRequest = async (query, variables = {}) => {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
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
