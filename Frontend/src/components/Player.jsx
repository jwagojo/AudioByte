import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Music } from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';

function Player() {
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    togglePlayPause,
    playNext,
    playPrevious,
    setVolume,
    seek,
  } = useMusicPlayer();

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seek(percent * duration);
  };

  const handleVolumeClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setVolume(Math.max(0, Math.min(1, percent)));
  };

  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Music size={20} />
            <span>No track playing</span>
          </div>
        </div>
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = volume * 100;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-1/4">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-pink-500 rounded flex items-center justify-center">
              <Music size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold truncate">{currentTrack.title}</div>
              <div className="text-sm text-gray-400 truncate">{currentTrack.artist || 'Unknown Artist'}</div>
            </div>
            <button className="text-gray-400 hover:text-white ml-2">
              <Heart size={20} />
            </button>
          </div>
          <div className="flex flex-col items-center gap-2 w-1/2">
            <div className="flex items-center gap-4">
              <button 
                onClick={playPrevious}
                className="text-gray-400 hover:text-white transition"
              >
                <SkipBack size={20} />
              </button>
              <button 
                onClick={togglePlayPause}
                className="bg-orange-500 hover:bg-orange-600 rounded-full p-3 transition"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button 
                onClick={playNext}
                className="text-gray-400 hover:text-white transition"
              >
                <SkipForward size={20} />
              </button>
            </div>
            
            <div className="w-full flex items-center gap-2">
              <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
              <div 
                className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden cursor-pointer"
                onClick={handleProgressClick}
              >
                <div 
                  className="h-full bg-orange-500 transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-400">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-1/4 justify-end">
            <button onClick={() => setVolume(volume > 0 ? 0 : 0.7)}>
              {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <div 
              className="w-24 h-1 bg-gray-700 rounded-full overflow-hidden cursor-pointer"
              onClick={handleVolumeClick}
            >
              <div 
                className="h-full bg-white transition-all"
                style={{ width: `${volumePercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Player;
