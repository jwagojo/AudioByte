import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, Image, Music, CheckCircle, AlertCircle } from 'lucide-react';
import { graphqlRequest, createMusicMutation } from '../utils/graphql';
import { useAuth } from '../context/AuthContext';

function Upload() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [audioFile, setAudioFile] = useState(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('Electronic');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setMessage({ type: '', text: '' });
      
      if (!title) {
        const filename = file.name.replace(/\.[^/.]+$/, '');
        setTitle(filename);
      }
    } else {
      setMessage({ type: 'error', text: 'Please select a valid audio file' });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setMessage({ type: '', text: '' });
      
      if (!title) {
        const filename = file.name.replace(/\.[^/.]+$/, '');
        setTitle(filename);
      }
    } else {
      setMessage({ type: 'error', text: 'Please drop a valid audio file' });
    }
  };

  const handleUpload = async () => {
    if (!audioFile) {
      setMessage({ type: 'error', text: 'Please select an audio file' });
      return;
    }

    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Please enter a track title' });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setMessage({ type: '', text: '' });

    try {

      const audio = new Audio();
      const duration = await new Promise((resolve) => {
        audio.addEventListener('loadedmetadata', () => {
          resolve(Math.floor(audio.duration));
        });
        audio.src = URL.createObjectURL(audioFile);
      });

      setUploadProgress(10);
      const data = await graphqlRequest(createMusicMutation, {
        title: title.trim(),
        artist: artist.trim() || 'Unknown Artist',
        album: album.trim() || genre,
        duration: duration,
      });

      const { upload_url, music_id, message: successMessage } = data.createMusic;
      setUploadProgress(30);

      const uploadResponse = await fetch(upload_url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'audio/mpeg',
        },
        body: audioFile,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3');
      }

      setUploadProgress(100);
      setMessage({ 
        type: 'success', 
        text: `Track "${title}" uploaded successfully! Redirecting to library...` 
      });

      setTimeout(() => {
        navigate('/library');
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ 
        type: 'error', 
        text: `Upload failed: ${error.message}` 
      });
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <Music size={48} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-400 mb-6">Please log in to upload tracks</p>
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Upload Your Track</h1>
      <p className="text-gray-400 mb-6">Logged in as: {user?.username || user?.userId}</p>
      
      <div className="bg-gray-800 rounded-lg p-8">
        <div 
          className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center mb-6 hover:border-orange-500 transition cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <UploadIcon size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-lg mb-2">
            {audioFile ? audioFile.name : 'Drag and drop your audio file here'}
          </p>
          <p className="text-sm text-gray-400">or click to browse</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button className="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-full transition">
            Choose File
          </button>
        </div>

        {message.text && (
          <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{message.text}</span>
          </div>
        )}

        {uploading && (
          <div className="mb-4">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-400 mt-2 text-center">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Track Title *</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter track title"
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Artist</label>
            <input 
              type="text" 
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter artist name"
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Album</label>
            <input 
              type="text" 
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter album name"
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Genre</label>
            <select 
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={uploading}
            >
              <option>Electronic</option>
              <option>Hip Hop</option>
              <option>Rock</option>
              <option>Pop</option>
              <option>Jazz</option>
              <option>Classical</option>
            </select>
          </div>

          <button 
            onClick={handleUpload}
            disabled={uploading || !audioFile}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload Track'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Upload;
