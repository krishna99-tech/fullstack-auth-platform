import { notFound } from 'next/navigation';
import { CalendarDays, MapPin, Link as LinkIcon, ShieldCheck, Lock } from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
  id: string;
  username: string;
  name: string;
  createdAt: string;
  avatarInitial: string;
}

// Add metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = await params;
  return {
    title: `${resolvedParams.username} - Public Profile`,
    description: `View the public profile of ${resolvedParams.username}.`
  };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = await params;
  let username = decodeURIComponent(resolvedParams.username);
  
  // Enforce that the URL MUST start with an @ symbol
  if (!username.startsWith('@')) {
    notFound();
  }
  
  // Strip the @ symbol for backend fetching and logic
  username = username.slice(1);
  
  // Prevent matching existing reserved routes
  const reservedRoutes = ['dashboard', 'login', 'signup', 'forgot-password', 'reset-password', 'api', '_next'];
  if (reservedRoutes.includes(username.toLowerCase())) {
    notFound();
  }

  try {
    // Fetch data from the public endpoint (no caching for instant privacy updates)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user/${username}`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      if (res.status === 404) notFound();
      if (res.status === 403) {
        // Return a sleek "Private Profile" card instead of crashing
        return (
          <div className="min-h-screen bg-zinc-50 dark:bg-[#000] text-black dark:text-white flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-[#333] rounded-2xl shadow-sm overflow-hidden p-8 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-zinc-400" />
              </div>
              <h1 className="text-xl font-bold tracking-tight mb-2">This profile is private</h1>
              <p className="text-zinc-500 dark:text-zinc-400 mb-8">
                @{username} has chosen not to share their profile publicly.
              </p>
              <Link href="/dashboard" className="text-sm font-medium hover:underline text-black dark:text-white">
                Go to my Dashboard &rarr;
              </Link>
            </div>
          </div>
        );
      }
      throw new Error('Failed to fetch user');
    }

    const user: UserProfile = await res.json();
    
    // Safely parse the date
    let joinedDate = 'Unknown date';
    if (user.createdAt) {
      const dateObj = new Date(user.createdAt);
      if (!isNaN(dateObj.getTime())) {
        joinedDate = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
    }

    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#000] text-black dark:text-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-[#333] rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Banner */}
          <div className="h-32 w-full bg-gradient-to-r from-zinc-200 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 border-b border-zinc-200 dark:border-[#333]" />
          
          <div className="px-8 pb-8 relative">
            {/* Avatar */}
            <div className="absolute -top-12 border-4 border-white dark:border-[#0a0a0a] h-24 w-24 rounded-full bg-gradient-to-tr from-zinc-200 to-zinc-50 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center text-3xl font-bold text-black dark:text-white shadow-md">
              {user.avatarInitial || (user.username ? user.username.charAt(0).toUpperCase() : '?')}
            </div>

            {/* Profile Info */}
            <div className="pt-16">
              <h1 className="text-2xl font-bold tracking-tight">{user.name || user.username}</h1>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">@{user.username}</p>
              
              <div className="mt-6 flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4" />
                  <span>Joined {joinedDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-zinc-900 dark:text-zinc-300 font-medium">Verified User</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-[#333] flex justify-between items-center">
              <p className="text-sm text-zinc-500">This is a public profile namespace.</p>
              <Link href="/dashboard" className="text-sm font-medium hover:underline">
                Go to my Dashboard &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
