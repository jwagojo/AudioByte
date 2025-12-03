import { Music, Upload, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-8rem)] overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        >
          <source src="/src/assets/vid/audiowave.mp4" type="video/mp4" />
          {/*source of video: https://youtu.be/puPYeUO4BAM?si=-Qg9FT6rklVv9cfQ */}
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-900/70 to-gray-900"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <h1 className="font-ghrathe text-6xl md:text-8xl font-bold text-orange-500 mb-6">
          AudioByte.
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-12">
          Discover, upload, and share your music with the world
        </p>
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <Link 
            to="/upload" 
            className="flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 rounded-full font-semibold transition"
          >
            <Upload size={20} />
            Start Uploading
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
          <div className="p-6">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music size={32} className="text-orange-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Upload Your Tracks</h3>
            <p className="text-gray-400">Share your music with millions of listeners around the world</p>
          </div>
          
          <div className="p-6">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music size={32} className="text-orange-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Build Your Library</h3>
            <p className="text-gray-400">Create playlists and organize your favorite music</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
