import { createContext, useContext, useState, useRef, useEffect } from 'react';

const MusicPlayerContext = createContext();

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within MusicPlayerProvider');
  }
  return context;
};

export const MusicPlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState([]);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      playNext();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (currentTrack) {
      // Use stream_url (presigned) if available, fallback to file_url
      const audioUrl = currentTrack.stream_url || currentTrack.file_url;
      audioRef.current.src = audioUrl;
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('Playback error:', err);
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    if (isPlaying && currentTrack) {
      audioRef.current.play().catch(err => {
        console.error('Playback error:', err);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const playTrack = (track, trackList = []) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    if (trackList.length > 0) {
      setPlaylist(trackList);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    if (playlist.length === 0 || !currentTrack) return;
    
    const currentIndex = playlist.findIndex(t => t.music_id === currentTrack.music_id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    playTrack(playlist[nextIndex], playlist);
  };

  const playPrevious = () => {
    if (playlist.length === 0 || !currentTrack) return;
    
    const currentIndex = playlist.findIndex(t => t.music_id === currentTrack.music_id);
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    playTrack(playlist[prevIndex], playlist);
  };

  const seek = (time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const value = {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    playlist,
    playTrack,
    togglePlayPause,
    playNext,
    playPrevious,
    setVolume,
    seek,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
};
