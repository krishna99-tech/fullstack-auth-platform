"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  MonitorSmartphone, 
  ShieldCheck, 
  ArrowUpRight,
  ChevronRight,
  Copy,
  ExternalLink,
  Eye,
  MousePointerClick,
  Percent,
  CheckCircle2,
  Circle,
  Link2,
  Plus,
  LayoutDashboard
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
  phoneNumber: string | null;
  createdAt: string;
  isVerified: boolean;
  mfaEnabled?: boolean;
}

interface Session {
  id: string;
  device: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [profileStats, setProfileStats] = useState({
    totalViews: 0,
    totalClicks: 0,
    ctr: '0',
    topLinks: [] as any[]
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [profileRes, sessionsRes, statsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sessions`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/analytics/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (profileRes.status === 401 || sessionsRes.status === 401) {
          localStorage.removeItem('token');
          router.push('/login?error=session_expired');
          return;
        }

        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfile(data.user || data);
        }

        if (sessionsRes.ok) {
          const data = await sessionsRes.json();
          setSessions(Array.isArray(data) ? data : (data.sessions || []));
        }

        if (statsRes.ok) {
          const pStats = await statsRes.json();
          setProfileStats(pStats);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const parseUA = (ua: string) => {
    if (!ua) return 'Unknown Device';
    let os = 'Unknown OS';
    let browser = 'Unknown Browser';
    
    if (ua.includes('Win')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('iPhone')) os = 'iPhone';
    else if (ua.includes('iPad')) os = 'iPad';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('Linux')) os = 'Linux';

    if (ua.includes('Edge') || ua.includes('Edg/')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Firefox')) browser = 'Firefox';

    return `${os} - ${browser}`;
  };

  const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/@${profile?.username || 'username'}` : `http://localhost:3000/@${profile?.username || 'username'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-200 dark:border-[#333] border-t-black dark:border-t-white rounded-full animate-spin mb-4" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-[#333] pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-white capitalize">
            Overview
          </h1>
          <p className="text-[#666] mt-1 text-[14px]">
            Welcome back! Here is how your profile is performing today.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/dashboard/settings" className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black hover:bg-[#333] dark:hover:bg-[#e0e0e0] text-sm font-medium rounded-md transition-colors shadow-sm flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" /> Edit Profile
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column - Main Content */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Share Profile Widget */}
          <div className="border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
            
            <h3 className="text-[16px] font-semibold text-black dark:text-white mb-2 relative z-10 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Share your link
            </h3>
            <p className="text-[14px] text-[#666] mb-5 relative z-10">
              Put this link in your Instagram, TikTok, or Twitter bio to direct followers to your content.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 relative z-10">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-[#333] rounded-lg shadow-sm">
                <span className="text-[14px] text-zinc-900 dark:text-zinc-100 font-medium truncate">
                  {profileUrl}
                </span>
              </div>
              <button 
                onClick={handleCopy}
                className="px-5 py-3 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-[#333] text-black dark:text-white hover:bg-zinc-50 dark:hover:bg-[#111] text-[14px] font-medium rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-[#888]" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <a 
                href={`/@${profile?.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-black dark:bg-white text-white dark:text-black hover:bg-[#333] dark:hover:bg-[#e0e0e0] text-[14px] font-medium rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                View Live <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Mini Analytics Snapshot (Mock Data) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] rounded-xl p-5 shadow-sm hover:-translate-y-0.5 transition-all">
              <div className="flex flex-row items-center justify-between pb-3 mb-2">
                <span className="text-[13px] font-medium text-[#666] tracking-tight">Total Views (7d)</span>
                <Eye className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <div className="text-3xl font-semibold tracking-tighter text-black dark:text-white">{profileStats.totalViews}</div>
                <p className="text-[12px] text-zinc-500 mt-1.5 font-medium">
                  Recorded visits
                </p>
              </div>
            </div>
            
            <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] rounded-xl p-5 shadow-sm hover:-translate-y-0.5 transition-all">
              <div className="flex flex-row items-center justify-between pb-3 mb-2">
                <span className="text-[13px] font-medium text-[#666] tracking-tight">Total Clicks (7d)</span>
                <MousePointerClick className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <div className="text-3xl font-semibold tracking-tighter text-black dark:text-white">{profileStats.totalClicks}</div>
                <p className="text-[12px] text-zinc-500 mt-1.5 font-medium">
                  Link interactions
                </p>
              </div>
            </div>
            
            <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] rounded-xl p-5 shadow-sm hover:-translate-y-0.5 transition-all">
              <div className="flex flex-row items-center justify-between pb-3 mb-2">
                <span className="text-[13px] font-medium text-[#666] tracking-tight">Avg. CTR</span>
                <Percent className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <div className="text-3xl font-semibold tracking-tighter text-black dark:text-white">{profileStats.ctr}%</div>
                <p className="text-[12px] text-zinc-500 mt-1.5 font-medium">
                  Average conversion
                </p>
              </div>
            </div>
          </div>

          {/* Quick Edit Links */}
          <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] rounded-xl shadow-sm">
            <div className="p-5 border-b border-zinc-200 dark:border-[#333] flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-black dark:text-white">Recent Links</h3>
                <p className="text-[13px] text-[#666] mt-0.5">Your most recently added custom links.</p>
              </div>
              <Link href="/dashboard/settings" className="text-[13px] font-medium text-black dark:text-white border border-zinc-200 dark:border-[#333] px-3 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-[#111] transition-colors shadow-sm flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add Link
              </Link>
            </div>
            <div className="flex flex-col">
              {profileStats.topLinks.slice(0, 3).map((link, idx) => (
                <div key={idx} className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-[#111] hover:bg-[#fafafa] dark:hover:bg-[#0a0a0a] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-[#111] flex items-center justify-center text-[#666]">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[14px] text-black dark:text-white">{link.title}</h4>
                      <p className="text-[12px] text-[#888] mt-0.5">{link.url.replace(/^https?:\/\//, '')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-[14px] font-semibold text-black dark:text-white">{link.clicks} clicks</span>
                  </div>
                </div>
              ))}
              {profileStats.topLinks.length === 0 && (
                <div className="p-8 text-center text-[#666] text-[13px]">
                  No link clicks yet.
                </div>
              )}
              
              <Link href="/dashboard/analytics" className="p-3 text-center text-[13px] text-[#666] hover:text-black dark:hover:text-white transition-colors bg-zinc-50/50 dark:bg-[#0a0a0a]/50">
                View detailed analytics
              </Link>
            </div>
          </div>

        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Profile Setup Checklist */}
          <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] rounded-xl shadow-sm">
            <div className="p-5 border-b border-zinc-200 dark:border-[#333]">
              <h3 className="text-[15px] font-semibold text-black dark:text-white">Setup Guide</h3>
              <p className="text-[13px] text-[#666] mt-0.5">Complete your profile to get the most out of the platform.</p>
              
              {/* Progress Bar */}
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex justify-between text-[12px] font-medium">
                  <span className="text-black dark:text-white">Profile Strength</span>
                  <span className="text-emerald-600 dark:text-emerald-500">75%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-100 dark:bg-[#111] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[75%]" />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col p-2">
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#fafafa] dark:hover:bg-[#0a0a0a] transition-colors">
                {profile?.isVerified ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-700" />}
                <div className="flex flex-col">
                  <span className={`text-[13px] font-medium ${profile?.isVerified ? 'text-[#888] line-through' : 'text-black dark:text-white'}`}>Verify Email Address</span>
                </div>
              </div>
              
              <Link href="/dashboard/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#fafafa] dark:hover:bg-[#0a0a0a] transition-colors group">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium text-[#888] line-through">Pick a custom theme</span>
                </div>
              </Link>
              
              <Link href="/dashboard/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#fafafa] dark:hover:bg-[#0a0a0a] transition-colors group">
                <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-700 group-hover:text-black dark:group-hover:text-white transition-colors" />
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium text-black dark:text-white">Add a short bio</span>
                </div>
              </Link>
              
              <Link href="/dashboard/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#fafafa] dark:hover:bg-[#0a0a0a] transition-colors group">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium text-[#888] line-through">Add your first custom link</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Security Status (Moved from left column) */}
          <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] rounded-xl shadow-sm p-5">
            <div className="flex flex-row items-center justify-between pb-3 border-b border-zinc-100 dark:border-[#111] mb-4">
              <span className="text-[13px] font-medium text-[#666] tracking-tight">Account Security</span>
              <ShieldCheck className={`w-4 h-4 ${profile?.isVerified ? 'text-emerald-500' : 'text-amber-500'}`} />
            </div>
            <div>
              <div className="text-xl font-semibold tracking-tight mb-2 text-black dark:text-white">
                {profile?.isVerified ? 'Protected' : 'Action Needed'}
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#666] mt-1">
                <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-[#111] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${profile?.isVerified ? 'bg-emerald-500 w-[90%]' : 'bg-amber-500 w-[40%]'}`} />
                </div>
                <span className="font-medium">{profile?.isVerified ? 'Good' : 'Weak'}</span>
              </div>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] rounded-xl shadow-sm flex flex-col">
            <div className="p-5 border-b border-zinc-200 dark:border-[#333] flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-black dark:text-white">Active Sessions</h3>
              </div>
              <Link href="/dashboard/settings" className="p-1.5 text-[#888] hover:text-black dark:hover:text-white rounded-md hover:bg-zinc-100 dark:hover:bg-[#111] transition-colors">
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-zinc-100 dark:divide-[#111]">
                {sessions.slice(0, 3).map((session) => (
                  <div key={session.id} className="p-4 flex items-center justify-between hover:bg-[#fafafa] dark:hover:bg-[#0a0a0a] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded border border-zinc-200 dark:border-[#333] flex items-center justify-center bg-white dark:bg-[#000] text-[#666]">
                        <MonitorSmartphone className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-[13px] text-black dark:text-white truncate max-w-[120px]">{parseUA(session.device)}</span>
                        <span className="text-[11px] text-[#888]">{session.ipAddress}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.isCurrent && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title="Current session"></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
