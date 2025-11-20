import { User, Music, Users, Play } from 'lucide-react';

function Profile() {
  const userTracks = [
    { id: 1, title: 'My First Track', plays: '234', likes: 45 },
    { id: 2, title: 'Weekend Jam', plays: '567', likes: 89 },
    { id: 3, title: 'Experimental Beat', plays: '123', likes: 23 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-orange-600 to-pink-600 rounded-lg p-8 mb-8">
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
            <User size={64} />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Name</h1>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="font-semibold">24</span> Tracks
              </div>
              <div>
                <span className="font-semibold">156</span> Followers
              </div>
              <div>
                <span className="font-semibold">89</span> Following
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <Music size={24} className="mb-2 text-orange-500" />
          <h3 className="text-2xl font-bold">24</h3>
          <p className="text-gray-400">Total Tracks</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <Play size={24} className="mb-2 text-orange-500" />
          <h3 className="text-2xl font-bold">3.4K</h3>
          <p className="text-gray-400">Total Plays</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <Users size={24} className="mb-2 text-orange-500" />
          <h3 className="text-2xl font-bold">156</h3>
          <p className="text-gray-400">Followers</p>
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-4">Your Tracks</h2>
      <div className="space-y-3">
        {userTracks.map((track) => (
          <div 
            key={track.id}
            className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded"></div>
            <div className="flex-1">
              <h3 className="font-semibold">{track.title}</h3>
              <p className="text-sm text-gray-400">{track.plays} plays · {track.likes} likes</p>
            </div>
            <button className="text-gray-400 hover:text-white">Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Profile;
