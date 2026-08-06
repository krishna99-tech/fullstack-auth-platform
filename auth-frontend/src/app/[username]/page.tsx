import { notFound } from 'next/navigation';
import { CalendarDays, MapPin, Link as LinkIcon, ShieldCheck, Lock, UserPlus, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import TrackView from './TrackView';
import TrackLink from './TrackLink';
import { legacyGetPublicProfile } from '@/lib/legacy-api';

interface UserProfile {
  id: string;
  username: string;
  name: string;
  createdAt: string;
  avatarInitial: string;
  avatarUrl?: string | null;
  bio?: string;
  location?: string;
  website?: string;
  theme?: string;
  socialLinks?: { github?: string; twitter?: string; linkedin?: string };
  customLinks?: { title: string; url: string }[];
  publishedBlogCount?: number;
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

  let user: UserProfile | null = null;
  let status = 200;

  try {
    user = await legacyGetPublicProfile(username);
    status = user ? 200 : 404;
  } catch (error) {
    status = 500;
  }

  if (status === 404) {
    return (
      <div className="min-h-screen flex w-full bg-zinc-50 dark:bg-[#000] text-black dark:text-white">
        
        {/* Left Side: Profile Card */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
          <div className="lg:hidden mb-8 w-full max-w-md flex items-center justify-center sm:justify-start animate-in fade-in slide-in-from-top-4 duration-500">
            <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 tracking-tight">
              Platform
            </Link>
          </div>

          <div className="max-w-md w-full bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-[#333] rounded-2xl shadow-sm overflow-hidden p-8 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
              <UserPlus className="w-8 h-8 text-zinc-400" />
            </div>
            <h1 className="text-xl font-bold tracking-tight mb-2">User not found</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8">
              The user @{username} does not exist.
            </p>
            <Link href="/" className="text-sm font-medium hover:underline text-black dark:text-white">
              Return to Home &rarr;
            </Link>
          </div>
        </div>

        {/* Right Side: Branding/Graphic (Hidden on Mobile) - Always Dark */}
        <div className="dark hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden bg-zinc-950 text-white border-l border-zinc-900">
          {/* Decorative Background Elements */}
          <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
          
          {/* Subtle dot pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPgo8L3N2Zz4=')] opacity-50" />

          {/* Content */}
          <div className="relative z-10 max-w-lg text-center">
            <div className="inline-block p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 mb-8 shadow-2xl">
              <UserPlus className="w-16 h-16 text-zinc-400" />
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-white mb-6">
              Claim this Profile
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed mb-8">
              The username @{username} is currently available. Grab it before someone else does!
            </p>
            <div className="pt-8 border-t border-white/10">
              <Link href="/signup" className="inline-flex items-center justify-center h-12 px-8 font-medium tracking-wide text-white transition duration-200 bg-blue-600 rounded-full hover:bg-blue-500 focus:shadow-outline focus:outline-none">
                Claim @{username}
              </Link>
            </div>
          </div>
        </div>

      </div>
    );
  }

  if (status === 403) {
    // Return a sleek "Private Profile" card instead of crashing
    return (
      <div className="min-h-screen flex w-full bg-zinc-50 dark:bg-[#000] text-black dark:text-white">
        
        {/* Left Side: Profile Card */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
          <div className="lg:hidden mb-8 w-full max-w-md flex items-center justify-center sm:justify-start animate-in fade-in slide-in-from-top-4 duration-500">
            <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 tracking-tight">
              Platform
            </Link>
          </div>

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

        {/* Right Side: Branding/Graphic (Hidden on Mobile) - Always Dark */}
        <div className="dark hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden bg-zinc-950 text-white border-l border-zinc-900">
          {/* Decorative Background Elements */}
          <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
          
          {/* Subtle dot pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPgo8L3N2Zz4=')] opacity-50" />

          {/* Content */}
          <div className="relative z-10 max-w-lg text-center">
            <div className="inline-block p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 mb-8 shadow-2xl">
              <Lock className="w-16 h-16 text-zinc-400" />
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-white mb-6">
              Private Profile
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed mb-8">
              This user has chosen to keep their profile information private.
            </p>
            <div className="pt-8 border-t border-white/10">
              <h3 className="text-xl font-semibold text-white mb-3">Want your own profile?</h3>
              <p className="text-zinc-400 mb-6 text-sm">Join thousands of creators building their digital identity.</p>
              <Link href="/signup" className="inline-flex items-center justify-center h-12 px-8 font-medium tracking-wide text-white transition duration-200 bg-blue-600 rounded-full hover:bg-blue-500 focus:shadow-outline focus:outline-none">
                Create your profile
              </Link>
            </div>
          </div>
        </div>

      </div>
    );
  }

  if (!user) {
    notFound();
  }
    // Safely parse the date
    let joinedDate = 'Unknown date';
    if (user.createdAt) {
      const dateObj = new Date(user.createdAt);
      if (!isNaN(dateObj.getTime())) {
        joinedDate = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
    }

    let bannerClass = "bg-gradient-to-r from-zinc-200 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 border-b border-zinc-200 dark:border-[#333]";
    let avatarBorderClass = "from-zinc-200 to-zinc-50 dark:from-zinc-800 dark:to-zinc-700 border border-zinc-200 dark:border-[#333]";
    let accentHoverClass = "hover:border-zinc-500 dark:hover:border-zinc-500 group-hover:text-zinc-500";
    
    let bannerStyle: React.CSSProperties = {};
    let avatarStyle: React.CSSProperties = {};

    if (user.theme?.startsWith('#')) {
      bannerClass = "border-b border-zinc-200 dark:border-[#333]";
      bannerStyle = { backgroundColor: user.theme };
      avatarBorderClass = "border-4 border-white dark:border-[#0a0a0a]";
      avatarStyle = { borderColor: user.theme, backgroundColor: user.theme + '20' };
    } else if (user.theme === 'emerald') {
      bannerClass = "bg-gradient-to-r from-emerald-400 to-teal-600 dark:from-emerald-500 dark:to-teal-700";
      avatarBorderClass = "from-emerald-100 to-teal-50 dark:from-emerald-900 dark:to-teal-900 border border-zinc-200 dark:border-[#333]";
      accentHoverClass = "hover:border-emerald-500 dark:hover:border-emerald-500 group-hover:text-emerald-500";
    } else if (user.theme === 'blue') {
      bannerClass = "bg-gradient-to-r from-blue-400 to-indigo-600 dark:from-blue-500 dark:to-indigo-700";
      avatarBorderClass = "from-blue-100 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 border border-zinc-200 dark:border-[#333]";
      accentHoverClass = "hover:border-blue-500 dark:hover:border-blue-500 group-hover:text-blue-500";
    } else if (user.theme === 'purple') {
      bannerClass = "bg-gradient-to-r from-purple-400 to-fuchsia-600 dark:from-purple-500 dark:to-fuchsia-700";
      avatarBorderClass = "from-purple-100 to-fuchsia-50 dark:from-purple-900 dark:to-fuchsia-900 border border-zinc-200 dark:border-[#333]";
      accentHoverClass = "hover:border-purple-500 dark:hover:border-purple-500 group-hover:text-purple-500";
    } else if (user.theme === 'rose') {
      bannerClass = "bg-gradient-to-r from-rose-400 to-orange-600 dark:from-rose-500 dark:to-orange-700";
      avatarBorderClass = "from-rose-100 to-orange-50 dark:from-rose-900 dark:to-orange-900 border border-zinc-200 dark:border-[#333]";
      accentHoverClass = "hover:border-rose-500 dark:hover:border-rose-500 group-hover:text-rose-500";
    }

    return (
      <div className="min-h-screen flex w-full bg-zinc-50 dark:bg-[#000] text-black dark:text-white">
        
        {/* Left Side: Profile Card */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
          {/* Mobile App Branding / Logo */}
          <div className="lg:hidden mb-8 w-full max-w-2xl flex items-center justify-center sm:justify-start animate-in fade-in slide-in-from-top-4 duration-500">
            <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 tracking-tight">
              Platform
            </Link>
          </div>

          <div className="max-w-2xl w-full bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-[#333] rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <TrackView username={user.username} />
          {/* Banner */}
          <div className={`h-32 w-full ${bannerClass}`} style={bannerStyle} />
          
          <div className="px-8 pb-8 relative">
            {/* Avatar */}
            <div 
              className={`absolute -top-12 h-24 w-24 rounded-full overflow-hidden bg-gradient-to-tr ${avatarBorderClass} flex items-center justify-center text-3xl font-bold text-black dark:text-white shadow-md`}
              style={avatarStyle}
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name || user.username} className="h-full w-full object-cover" />
              ) : (
                user.avatarInitial || (user.username ? user.username.charAt(0).toUpperCase() : '?')
              )}
            </div>

            {/* Profile Info */}
            <div className="pt-16">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{user.name || user.username}</h1>
                  <p className="text-zinc-500 dark:text-zinc-400 font-medium">@{user.username}</p>
                </div>
              </div>
              
              {user.bio && (
                <p className="mt-4 text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {user.bio}
                </p>
              )}
              
              <div className="mt-6 flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-zinc-600 dark:text-zinc-400">
                {user.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                {user.website && (
                  <div className="flex items-center gap-1.5">
                    <LinkIcon className="w-4 h-4" />
                    <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-500 dark:text-blue-400 font-medium">
                      {user.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4" />
                  <span>Joined {joinedDate}</span>
                </div>
                {user.publishedBlogCount !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>{user.publishedBlogCount} published blog{user.publishedBlogCount !== 1 ? 's' : ''}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-zinc-900 dark:text-zinc-300 font-medium">Verified</span>
                </div>
              </div>
            </div>
            
            {/* Social Links */}
            {user.socialLinks && (user.socialLinks.github || user.socialLinks.twitter || user.socialLinks.linkedin) && (
              <div className="mt-8 flex items-center gap-4">
                {user.socialLinks.github && (
                  <TrackLink username={user.username} url={`https://github.com/${user.socialLinks.github}`} title="GitHub" className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/></svg>
                  </TrackLink>
                )}
                {user.socialLinks.twitter && (
                  <TrackLink username={user.username} url={`https://twitter.com/${user.socialLinks.twitter}`} title="Twitter" className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-[#1DA1F2] dark:hover:text-[#1DA1F2] transition-colors">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z"/></svg>
                  </TrackLink>
                )}
                {user.socialLinks.linkedin && (
                  <TrackLink username={user.username} url={user.socialLinks.linkedin} title="LinkedIn" className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-[#0A66C2] dark:hover:text-[#0A66C2] transition-colors">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </TrackLink>
                )}
              </div>
            )}

            {/* Custom Links */}
            {user.customLinks && user.customLinks.length > 0 && (
              <div className="mt-8 flex flex-col gap-3">
                {user.customLinks.map((link, idx) => {
                  if (!link.title || !link.url) return null;
                  return (
                    <TrackLink key={idx} username={user.username} url={link.url} title={link.title} className={`group flex items-center justify-between p-4 bg-zinc-50 dark:bg-[#111] border border-zinc-200 dark:border-[#333] rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md ${accentHoverClass}`}>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{link.title}</span>
                      </div>
                      <ExternalLink className={`w-4 h-4 text-zinc-400 transition-colors ${accentHoverClass}`} />
                    </TrackLink>
                  );
                })}
              </div>
            )}
            
            <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-[#333] flex justify-between items-center">
              <p className="text-sm text-zinc-500">This is a public profile namespace.</p>
              <Link href="/dashboard" className="text-sm font-medium hover:underline">
                Go to my Dashboard &rarr;
              </Link>
            </div>
          </div>
        </div>
        </div>

        {/* Right Side: Branding/Graphic (Hidden on Mobile) - Always Dark */}
        <div className="dark hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden bg-zinc-950 text-white border-l border-zinc-900">
          {/* Decorative Background Elements */}
          <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
          
          {/* Subtle dot pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPgo8L3N2Zz4=')] opacity-50" />

          {/* Content */}
          <div className="relative z-10 max-w-lg text-center">
            <div className="inline-block p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 mb-8 shadow-2xl">
              <svg className="w-16 h-16 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-white mb-6">
              Create your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                Digital Identity
              </span>
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed mb-8">
              Join Platform today to claim your custom URL, showcase your work, and connect with a global community of creators.
            </p>
            <Link href="/signup" className="inline-flex items-center justify-center h-12 px-8 font-medium tracking-wide text-white transition duration-200 bg-blue-600 rounded-full hover:bg-blue-500 shadow-lg shadow-blue-500/30">
              Get Started for Free
            </Link>
          </div>
        </div>

      </div>
    );
}
