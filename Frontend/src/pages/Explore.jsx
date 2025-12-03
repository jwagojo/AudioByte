import { useState, useEffect } from 'react';
import { Music, Globe, Play, Loader, User } from 'lucide-react';
import { graphqlRequest, listAllMusicQuery } from '../utils/graphql';
import { useMusicPlayer } from '../context/MusicPlayerContext';

function Explore() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { playTrack, currentTrack } = useMusicPlayer();

  useEffect(() => {
    fetchAllSongs();
  }, []);

  const fetchAllSongs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await graphqlRequest(listAllMusicQuery);
      setSongs(data.listAllMusic || []);
    } catch (err) {
      console.error('Error fetching songs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (err) {
      return '-';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Globe size={40} className="text-orange-500" />
          <div>
            <h1 className="text-3xl font-bold">Explore All Music</h1>
            <p className="text-gray-400">Discover tracks from the entire community</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-orange-600/20 to-purple-600/20 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">{songs.length}</h3>
            <p className="text-gray-300">Total Community Tracks</p>
          </div>
          <Globe size={48} className="text-orange-500 opacity-50" />
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">All Tracks</h2>
        <button 
          onClick={fetchAllSongs}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading && (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <Loader className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-400">Loading community tracks...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-4">
          <p className="text-red-400">Error: {error}</p>
        </div>
      )}

      {!loading && !error && songs.length === 0 && (
        <div className="bg-gray-800 rounded-lg p-12 text-center text-gray-400">
          <Music size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No tracks available yet</p>
          <p className="text-sm">Be the first to upload a track!</p>
        </div>
      )}

      {!loading && !error && songs.length > 0 && (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Artist
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Album
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Uploader
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {songs.map((song, index) => (
                  <tr key={song.music_id} className="hover:bg-gray-700/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Music size={16} className="mr-2 text-orange-500" />
                        <span className="font-medium">{song.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {song.artist || 'Unknown Artist'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {song.album || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center text-gray-300">
                        <User size={14} className="mr-1" />
                        {song.username || 'Anonymous'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDuration(song.duration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(song.uploaded_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => playTrack(song, songs)}
                        className={`p-2 rounded-lg transition ${
                          currentTrack?.music_id === song.music_id
                            ? 'bg-orange-600'
                            : 'bg-orange-500 hover:bg-orange-600'
                        }`}
                        title="Play"
                      >
                        <Play size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Explore;
