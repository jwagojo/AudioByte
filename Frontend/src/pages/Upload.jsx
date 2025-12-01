import { Upload as UploadIcon, Image, Music } from 'lucide-react';

function Upload() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Upload Your Track</h1>
      
      <div className="bg-gray-800 rounded-lg p-8">
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center mb-6 hover:border-orange-500 transition cursor-pointer">
          <UploadIcon size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-lg mb-2">Drag and drop your audio file here</p>
          <p className="text-sm text-gray-400">or click to browse</p>
          <button className="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-full transition">
            Choose File
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Track Title</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter track title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea 
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-24"
              placeholder="Tell us about your track"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Genre</label>
            <select className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option>Electronic</option>
              <option>Hip Hop</option>
              <option>Rock</option>
              <option>Pop</option>
              <option>Jazz</option>
              <option>Classical</option>
            </select>
          </div>

          <button className="w-full py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold transition">
            Upload Track
          </button>
        </div>
      </div>
    </div>
  );
}

export default Upload;
