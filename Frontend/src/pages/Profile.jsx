import { User, Music, Users, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

function Profile() {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState({
    totalTracks: 0,
    totalPlays: 0,
    followers: 0,
    following: 0,
  });

  const userTracks = [
    { id: 1, title: 'My First Track', plays: '0', likes: 0 },
    { id: 2, title: 'Weekend Jam', plays: '0', likes: 0 },
    { id: 3, title: 'Experimental Beat', plays: '0', likes: 0 },
  ];

  
  useEffect(() => {

    setUserStats({
      totalTracks: 0,
      totalPlays: 0,
      followers: 0,
      following: 0,
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-orange-600 to-pink-600 rounded-lg p-8 mb-8">
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
            <User size={64} />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {user?.signInDetails?.loginId || user?.username || 'User'}
            </h1>
            <p className="text-white/80 mb-3">{user?.userId || ''}</p>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="font-semibold">{userStats.totalTracks}</span> Tracks
              </div>
              <div>
                <span className="font-semibold">{userStats.followers}</span> Followers
              </div>
              <div>
                <span className="font-semibold">{userStats.following}</span> Following
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <Music size={24} className="mb-2 text-orange-500" />
          <h3 className="text-2xl font-bold">{userStats.totalTracks}</h3>
          <p className="text-gray-400">Total Tracks</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <Play size={24} className="mb-2 text-orange-500" />
          <h3 className="text-2xl font-bold">{userStats.totalPlays.toLocaleString()}</h3>
          <p className="text-gray-400">Total Plays</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <Users size={24} className="mb-2 text-orange-500" />
          <h3 className="text-2xl font-bold">{userStats.followers}</h3>
          <p className="text-gray-400">Followers</p>
        </div>
      </div>
    </div>
  );
}

export default Profile;
