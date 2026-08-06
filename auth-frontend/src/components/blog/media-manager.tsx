import React, { useMemo } from 'react';
import { X, Image as ImageIcon, Video } from 'lucide-react';

interface MediaManagerProps {
  content: string;
  setContent: (content: string) => void;
}

export function MediaManager({ content, setContent }: MediaManagerProps) {
  // Find all MEDIA_START tags in the content
  const mediaItems = useMemo(() => {
    const items: string[] = [];
    const regex = /<!-- MEDIA_START:(.*?) -->/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      items.push(match[1]);
    }
    // Filter out duplicates (if user pasted the same tag)
    return Array.from(new Set(items));
  }, [content]);

  const handleRemove = (url: string) => {
    // We dynamically build a regex to delete the entire block from START to END
    // We use [\s\S]*? to match across multiple lines non-greedily
    // We need to escape special characters in the URL if there are any
    const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\s*<!-- MEDIA_START:${escapedUrl} -->[\\s\\S]*?<!-- MEDIA_END:${escapedUrl} -->\\s*`, 'g');
    
    setContent(content.replace(regex, '\n\n'));
  };

  if (mediaItems.length === 0) return null;

  return (
    <div className="mt-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-black/50">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Media in this Post</h4>
      <div className="flex flex-wrap gap-3">
        {mediaItems.map(url => {
          const isVideo = url.endsWith('.mp4') || url.endsWith('.webm');
          return (
            <div key={url} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-center">
              {isVideo ? (
                <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                  <Video className="w-6 h-6 text-zinc-400" />
                </div>
              ) : (
                <img src={url} alt="Media thumbnail" className="w-full h-full object-cover" />
              )}
              
              {/* Overlay with Remove button */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm transform scale-90 group-hover:scale-100"
                  title="Remove from post"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-zinc-400 mt-3 flex items-center">
        Click the <X className="w-3 h-3 mx-1 text-red-500" /> to instantly remove a media item from your text.
      </p>
    </div>
  );
}
