import { Music, Heart, Clock } from 'lucide-react';

function Library() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Library</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg p-6">
          <Music size={32} className="mb-3" />
          <h3 className="text-2xl font-bold">24</h3>
          <p className="text-gray-200">Tracks</p>
        </div>
        <div className="bg-gradient-to-br from-pink-600 to-red-600 rounded-lg p-6">
          <Heart size={32} className="mb-3" />
          <h3 className="text-2xl font-bold">12</h3>
          <p className="text-gray-200">Favorites</p>
        </div>
        <div className="bg-gradient-to-br from-orange-600 to-yellow-600 rounded-lg p-6">
          <Clock size={32} className="mb-3" />
          <h3 className="text-2xl font-bold">8</h3>
          <p className="text-gray-200">Playlists</p>
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-4">Recent Plays</h2>
      <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
        Your recently played tracks will appear here
      </div>
    </div>
  );
}

export default Library;
