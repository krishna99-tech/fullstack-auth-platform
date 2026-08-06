'use client';

import React, { useState, useRef } from 'react';
import { Paperclip, Loader2, X, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { uploadImage } from '@/lib/upload-client';
import { useAuth } from '@/context/AuthContext';

interface MediaInserterProps {
  onInsert: (content: string) => void;
}

export function MediaInserter({ onInsert }: MediaInserterProps) {
  const { getAccessToken } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  
  // formatting state
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [size, setSize] = useState<'small' | 'medium' | 'full'>('medium');
  const [caption, setCaption] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const token = getAccessToken();
    if (!token) return;

    setUploading(true);
    try {
      const url = await uploadImage(file, token);
      setMediaUrl(url);
      setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
      setModalOpen(true);
    } catch (err) {
      console.error('Failed to upload media:', err);
      alert('Failed to upload media. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleInsert = () => {
    let styleMaxWidth = '800px';
    
    if (size === 'small') styleMaxWidth = '300px';
    if (size === 'medium') styleMaxWidth = '500px';
    if (size === 'full') styleMaxWidth = '100%';
    
    let justify = 'center';
    if (alignment === 'left') justify = 'flex-start';
    if (alignment === 'right') justify = 'flex-end';

    let mediaHtml = '';
    if (mediaType === 'video') {
      mediaHtml = `<video controls src="${mediaUrl}" style="width: 100%; max-width: ${styleMaxWidth}; border-radius: 8px;"></video>`;
    } else {
      mediaHtml = `<img src="${mediaUrl}" alt="${caption || 'image'}" style="width: 100%; max-width: ${styleMaxWidth}; border-radius: 8px;" />`;
    }

    const htmlSnippet = `
<!-- MEDIA_START:${mediaUrl} -->
<div style="display: flex; flex-direction: column; align-items: ${justify === 'flex-start' ? 'flex-start' : justify === 'flex-end' ? 'flex-end' : 'center'}; margin: 1.5rem 0; text-align: center;">
  ${mediaHtml}
  ${caption ? `<span style="font-size: 0.875rem; color: #71717a; margin-top: 0.5rem; display: block; max-width: ${styleMaxWidth}; text-align: center;">${caption}</span>` : ''}
</div>
<!-- MEDIA_END:${mediaUrl} -->
`;

    onInsert(htmlSnippet);
    setModalOpen(false);
    setCaption('');
  };

  return (
    <>
      <label className={`flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*,video/mp4,video/webm" 
          className="hidden" 
          onChange={handleFileSelect} 
          disabled={uploading} 
        />
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />}
        {uploading ? 'Uploading...' : 'Insert Media'}
      </label>

      {/* Formatting Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#111] rounded-2xl w-full max-w-lg border border-zinc-200 dark:border-[#222] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-zinc-200 dark:border-[#222]">
              <h3 className="font-semibold">Format Media</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-[#222] rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto max-h-[70vh] flex flex-col gap-6">
              {/* Preview */}
              <div className="bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-[#333] rounded-xl p-4 flex items-center justify-center min-h-[160px] overflow-hidden">
                {mediaType === 'video' ? (
                  <video src={mediaUrl} className="max-h-[160px] max-w-full rounded-lg object-contain" />
                ) : (
                  <img src={mediaUrl} className="max-h-[160px] max-w-full rounded-lg object-contain" />
                )}
              </div>
              
              {/* Controls */}
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Alignment</label>
                  <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-[#1a1a1a] rounded-lg">
                    <button 
                      type="button"
                      onClick={() => setAlignment('left')}
                      className={`flex-1 flex justify-center py-1.5 rounded-md text-sm transition-colors ${alignment === 'left' ? 'bg-white dark:bg-[#333] shadow-sm font-medium' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
                    >
                      <AlignLeft className="w-4 h-4 mr-1.5" /> Left
                    </button>
                    <button 
                      type="button"
                      onClick={() => setAlignment('center')}
                      className={`flex-1 flex justify-center py-1.5 rounded-md text-sm transition-colors ${alignment === 'center' ? 'bg-white dark:bg-[#333] shadow-sm font-medium' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
                    >
                      <AlignCenter className="w-4 h-4 mr-1.5" /> Center
                    </button>
                    <button 
                      type="button"
                      onClick={() => setAlignment('right')}
                      className={`flex-1 flex justify-center py-1.5 rounded-md text-sm transition-colors ${alignment === 'right' ? 'bg-white dark:bg-[#333] shadow-sm font-medium' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
                    >
                      <AlignRight className="w-4 h-4 mr-1.5" /> Right
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Size</label>
                  <div className="flex gap-2">
                    {(['small', 'medium', 'full'] as const).map(s => (
                      <button 
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        className={`flex-1 py-1.5 border rounded-lg text-sm transition-colors ${size === s ? 'border-zinc-800 dark:border-zinc-300 bg-zinc-50 dark:bg-[#222]' : 'border-zinc-200 dark:border-[#333] text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-600'}`}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Caption (Optional)</label>
                  <input 
                    type="text" 
                    value={caption} 
                    onChange={e => setCaption(e.target.value)} 
                    placeholder="Enter a description..."
                    className="w-full px-3 py-2 text-sm bg-transparent border border-zinc-200 dark:border-[#333] rounded-lg focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-200 dark:border-[#222] flex justify-end gap-3 bg-zinc-50 dark:bg-[#0a0a0a]">
              <button 
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-[#222] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleInsert}
                className="px-5 py-2 text-sm font-medium bg-black text-white dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition-opacity shadow-sm"
              >
                Insert Media
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
