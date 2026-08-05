import { LEGACY_API } from '@/lib/config';

interface TrackLinkProps {
  username: string;
  url: string;
  title: string;
  className?: string;
  children: React.ReactNode;
}

export default function TrackLink({ username, url, title, className, children }: TrackLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Fire and forget tracking request
    if (LEGACY_API) {
      fetch(`${LEGACY_API}/analytics/track-click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, url, title })
      }).catch(console.error);
    }

    // Open link immediately for good UX
    window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
  };

  return (
    <a 
      href={url.startsWith('http') ? url : `https://${url}`} 
      target="_blank" 
      rel="noopener noreferrer" 
      onClick={handleClick} 
      className={className}
    >
      {children}
    </a>
  );
}
