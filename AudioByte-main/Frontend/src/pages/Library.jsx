import { useState, useEffect } from 'react';
import { Music, Heart, Clock, Play, Trash2, Loader } from 'lucide-react';
import { graphqlRequest, listMusicQuery, deleteMusicMutation } from '../utils/graphql';
import { useMusicPlayer } from '../context/MusicPlayerContext';

function Library() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const { playTrack, currentTrack } = useMusicPlayer();

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await graphqlRequest(listMusicQuery);
      setSongs(data.listMusic || []);
    } catch (err) {
      console.error('Error fetching songs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (musicId, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      setDeleting(musicId);
      await graphqlRequest(deleteMusicMutation, { music_id: musicId });
      setSongs(songs.filter(song => song.music_id !== musicId));
    } catch (err) {
      console.error('Error deleting song:', err);
      alert(`Failed to delete: ${err.message}`);
    } finally {
      setDeleting(null);
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
      if (isNaN(date.getTime())) return dateString; // Return raw string if invalid
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
      <h1 className="text-3xl font-bold mb-8">Your Library</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg p-6">
          <Music size={32} className="mb-3" />
          <h3 className="text-2xl font-bold">{songs.length}</h3>
          <p className="text-gray-200">Tracks</p>
        </div>
        <div className="bg-gradient-to-br from-pink-600 to-red-600 rounded-lg p-6">
          <Heart size={32} className="mb-3" />
          <h3 className="text-2xl font-bold">0</h3>
          <p className="text-gray-200">Favorites</p>
        </div>
        <div className="bg-gradient-to-br from-orange-600 to-yellow-600 rounded-lg p-6">
          <Clock size={32} className="mb-3" />
          <h3 className="text-2xl font-bold">0</h3>
          <p className="text-gray-200">Playlists</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">All Tracks</h2>
        <button 
          onClick={fetchSongs}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading && (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <Loader className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-400">Loading your tracks...</p>
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
          <p className="text-lg mb-2">No tracks yet</p>
          <p className="text-sm">Upload your first track to get started!</p>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDuration(song.duration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(song.uploaded_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
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
                        <button
                          onClick={() => handleDelete(song.music_id, song.title)}
                          disabled={deleting === song.music_id}
                          className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === song.music_id ? (
                            <Loader className="animate-spin" size={16} />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
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

export default Library;
