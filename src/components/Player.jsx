import { Play, Pause, SkipBack, SkipForward, Volume2, Heart } from 'lucide-react';
import { useState } from 'react';

function Player() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          {/* Track Info */}
          <div className="flex items-center gap-3 w-1/4">
            <div className="w-14 h-14 bg-gray-800 rounded"></div>
            <div>
              <div className="font-semibold">Track Title</div>
              <div className="text-sm text-gray-400">Artist Name</div>
            </div>
            <button className="text-gray-400 hover:text-white ml-2">
              <Heart size={20} />
            </button>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-2 w-1/2">
            <div className="flex items-center gap-4">
              <button className="text-gray-400 hover:text-white">
                <SkipBack size={20} />
              </button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-orange-500 hover:bg-orange-600 rounded-full p-3 transition"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button className="text-gray-400 hover:text-white">
                <SkipForward size={20} />
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full flex items-center gap-2">
              <span className="text-xs text-gray-400">0:00</span>
              <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 w-1/3"></div>
              </div>
              <span className="text-xs text-gray-400">3:45</span>
            </div>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 w-1/4 justify-end">
            <Volume2 size={20} />
            <div className="w-24 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-white w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Player;
