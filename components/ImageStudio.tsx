
import React, { useState, useRef } from 'react';
import { editImage } from '../services/geminiService';

const ImageStudio: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target?.result as string);
        setEditedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!originalImage || !prompt) return;
    setLoading(true);
    try {
      const mimeType = originalImage.split(',')[0].split(':')[1].split(';')[0];
      const base64Data = originalImage.split(',')[1];
      const result = await editImage(base64Data, mimeType, prompt);
      setEditedImage(result);
    } catch (error) {
      console.error("Image editing failed", error);
      alert("Failed to edit image. Please try a different prompt.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-white">
            <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Market Viz Studio (Beta)
          </h3>
          <p className="text-xs text-slate-500 mt-1">Upload a chart or stock photo and use AI to stylize or edit it.</p>
        </div>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-xl text-sm transition-all"
        >
          {originalImage ? 'Change Image' : 'Upload Image'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-video bg-slate-900/60 border-2 border-dashed border-slate-800 rounded-2xl flex items-center justify-center overflow-hidden">
            {originalImage ? (
              <img src={originalImage} alt="Original" className="w-full h-full object-contain" />
            ) : (
              <div className="text-center p-8">
                <svg className="w-12 h-12 text-slate-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-slate-600 font-bold uppercase text-[10px] tracking-widest">Awaiting Chart Upload</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <input 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. 'Add a retro glitch filter' or 'Make it look like a cyberpunk terminal'"
              className="flex-grow bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:border-indigo-500 outline-none transition-all"
            />
            <button 
              disabled={loading || !originalImage || !prompt}
              onClick={handleEdit}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20"
            >
              {loading ? 'AI Processing...' : 'Run Magic'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="aspect-video bg-slate-900/40 border border-slate-800 rounded-2xl flex items-center justify-center overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                 <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest animate-pulse">Re-imagining pixels...</p>
              </div>
            ) : editedImage ? (
              <img src={editedImage} alt="Edited" className="w-full h-full object-contain" />
            ) : (
              <p className="text-slate-700 font-bold uppercase text-[10px] tracking-widest">AI Result Preview</p>
            )}
          </div>
          {editedImage && (
            <a 
              href={editedImage} 
              download="bharatstock-viz.png" 
              className="block w-full text-center bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-sm transition-all border border-slate-700"
            >
              Download Masterpiece
            </a>
          )}
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
        <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Sample Prompts</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            "Add a clean minimalist dark theme overlay",
            "Highlight the main trend lines in neon cyan",
            "Give it a 1980s retro-wave aesthetic",
            "Remove the axis numbers for a cleaner look",
            "Add a subtle depth blur to the background",
            "Increase contrast and make colors pop"
          ].map((s, i) => (
            <button 
              key={i} 
              onClick={() => setPrompt(s)}
              className="text-left p-3 text-xs bg-slate-800/50 hover:bg-slate-800 text-slate-400 rounded-lg border border-slate-700/50 transition-colors"
            >
              "{s}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageStudio;
