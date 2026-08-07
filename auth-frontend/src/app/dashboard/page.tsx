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
import { useAuth } from '@/context/AuthContext';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { legacyGetProfile, legacyGetSessions, legacyGetProfileStats } from '@/lib/legacy-api';
import { listAuditEvents } from '@/lib/authlog-client';
import * as authlog from '@/lib/authlog-client';

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

interface TopLink {
  title: string;
  url: string;
  clicks: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, getAccessToken } = useAuth();
  useAuthGuard();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [profileStats, setProfileStats] = useState({
    totalViews: 0,
    totalClicks: 0,
    ctr: '0',
    topLinks: [] as TopLink[]
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [legacyProfile, legacySessions, legacyStats, auditData] = await Promise.all([
          legacyGetProfile(),
          legacyGetSessions(),
          legacyGetProfileStats(),
          listAuditEvents(token, { limit: 5 }).catch(() => ({ events: [] })),
        ]);

        if (legacyProfile) {
          setProfile(legacyProfile);
        } else if (user) {
          setProfile({
            id: user.sub,
            email: user.email,
            username: user.username || null,
            name: user.name || null,
            phoneNumber: null,
            createdAt: new Date().toISOString(),
            isVerified: user.email_verified,
            mfaEnabled: user.mfa_enabled,
          });
        }

        if (legacySessions?.length) {
          setSessions(legacySessions);
        } else {
          try {
            const sessionData = await authlog.listSessions(token);
            if (sessionData.sessions?.length) {
              setSessions(sessionData.sessions);
            }
          } catch {
            if (auditData.events?.length) {
              setSessions(auditData.events.filter((e) => e.action.includes('login')).slice(0, 3).map((e, i) => ({
                id: e.eventId,
                device: e.actor?.user_agent || 'Unknown',
                ipAddress: e.actor?.ip || '—',
                lastActive: e.timestamp,
                isCurrent: i === 0,
              })));
            }
          }
        }

        if (legacyStats) setProfileStats(legacyStats);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, getAccessToken, user]);

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
    <div className="flex flex-col gap-8 w-full pb-12 animate-in fade-in slide-in-from-bottom-6 duration-700 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-1">
            Overview
          </h1>
          <p className="text-[15px] text-zinc-500 dark:text-zinc-400">
            Welcome back! Here&apos;s how your profile is performing today.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/dashboard/settings" className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-zinc-200 text-sm font-medium rounded-xl transition-all shadow-[0_2px_10px_-3px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_14px_-4px_rgba(0,0,0,0.3)] flex items-center justify-center gap-2">
            <LayoutDashboard className="w-4 h-4" /> Edit Profile
          </Link>
        </div>
      </div>

      {/* Share Link Banner - Stripe/Linear Style Glassmorphism */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/50 dark:border-white/10 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl shadow-sm p-6 sm:p-8 group">
        {/* Animated Gradient Meshes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none rounded-2xl z-0">
          <div className="absolute -right-[10%] -top-[40%] w-[50%] h-[150%] bg-gradient-to-b from-blue-400/20 to-purple-500/20 blur-[80px] rotate-12 transition-transform duration-1000 group-hover:rotate-45 group-hover:scale-110" />
          <div className="absolute -left-[10%] -bottom-[40%] w-[50%] h-[150%] bg-gradient-to-t from-emerald-400/10 to-teal-500/10 blur-[80px] -rotate-12 transition-transform duration-1000 group-hover:-rotate-45 group-hover:scale-110" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-[18px] font-semibold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[1px]">
                <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-full flex items-center justify-center">
                  <Link2 className="w-4 h-4 text-blue-500" />
                </div>
              </div>
              Your Live Profile
            </h3>
            <p className="text-[14px] text-zinc-600 dark:text-zinc-400 max-w-lg leading-relaxed">
              Share this link in your social bios to direct followers to your content seamlessly.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="flex items-center gap-3 px-4 py-3 bg-white/80 dark:bg-black/50 border border-zinc-200/80 dark:border-white/10 rounded-xl shadow-inner sm:w-72 backdrop-blur-md">
              <span className="text-[14px] text-zinc-700 dark:text-zinc-300 font-medium truncate block w-full">
                {profileUrl.replace(/^https?:\/\//, '')}
              </span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleCopy}
                className="flex-1 sm:flex-none px-5 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 text-[13px] font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-500" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <a 
                href={`/@${profile?.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-[46px] h-[46px] bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-zinc-200 rounded-xl transition-all shadow-sm flex items-center justify-center hover:scale-105 active:scale-95"
                title="View Live"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="relative group bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10 flex flex-row items-center justify-between pb-4">
            <span className="text-[13px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Views</span>
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shadow-inner">
              <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">{profileStats.totalViews}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center text-[12px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3 h-3 mr-1" /> 7d
              </span>
            </div>
          </div>
        </div>
        
        <div className="relative group bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10 flex flex-row items-center justify-between pb-4">
            <span className="text-[13px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Clicks</span>
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shadow-inner">
              <MousePointerClick className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">{profileStats.totalClicks}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center text-[12px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3 h-3 mr-1" /> 7d
              </span>
            </div>
          </div>
        </div>
        
        <div className="relative group bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10 flex flex-row items-center justify-between pb-4">
            <span className="text-[13px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Avg. CTR</span>
            <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center shadow-inner">
              <Percent className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">{profileStats.ctr}%</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center text-[12px] font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded-full">
                7d avg
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
        
        {/* Left Column */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          
          {/* Recent Links (Premium List) */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm flex flex-col relative overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
              <div>
                <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-white">Recent Links</h3>
                <p className="text-[13px] text-zinc-500 mt-0.5">Performance of your latest additions.</p>
              </div>
              <Link href="/dashboard/settings" className="w-8 h-8 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-all hover:scale-105 active:scale-95">
                <Plus className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="flex flex-col">
              {profileStats.topLinks.slice(0, 4).map((link, idx) => (
                <div key={idx} className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors group last:border-0 cursor-pointer">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900 border border-zinc-200/50 dark:border-zinc-700/50 flex items-center justify-center text-zinc-500 shadow-inner group-hover:scale-110 group-hover:text-zinc-900 dark:group-hover:text-white transition-all duration-300 shrink-0">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-[14px] text-zinc-900 dark:text-white truncate mb-0.5">{link.title}</h4>
                      <p className="text-[13px] text-zinc-500 dark:text-zinc-400 truncate">
                        {link.url.replace(/^https?:\/\//, '')}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 pl-4 flex flex-col items-end">
                    <span className="text-[14px] font-bold text-zinc-900 dark:text-white">
                      {link.clicks}
                    </span>
                    <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                      Clicks
                    </span>
                  </div>
                </div>
              ))}
              
              {profileStats.topLinks.length === 0 && (
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mb-4 text-zinc-400 shadow-inner">
                    <Link2 className="w-6 h-6" />
                  </div>
                  <p className="text-[15px] font-semibold text-zinc-900 dark:text-white">No links added yet</p>
                  <p className="text-[14px] text-zinc-500 mt-1 max-w-xs mx-auto">Create your first custom link in the settings to start tracking clicks.</p>
                </div>
              )}
            </div>
            
            <Link href="/dashboard/analytics" className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-[13px] font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors mt-auto hover:bg-zinc-100 dark:hover:bg-zinc-900">
              View detailed analytics <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
          
          {/* Setup Guide (Premium Card) */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden flex flex-col relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
            <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-start">
              <div>
                <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-white">Setup Guide</h3>
                <p className="text-[13px] text-zinc-500 mt-0.5">Complete your profile</p>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[12px] font-bold shadow-inner">
                75%
              </div>
            </div>
            
            <div className="p-2">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                {profile?.isVerified ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                ) : (
                  <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-600 shrink-0" />
                )}
                <span className={`text-[13px] font-medium ${profile?.isVerified ? 'text-zinc-400 dark:text-zinc-600 line-through' : 'text-zinc-900 dark:text-zinc-100'}`}>
                  Verify Email Address
                </span>
              </div>
              
              <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-[13px] font-medium text-zinc-400 dark:text-zinc-600 line-through">
                  Pick a custom theme
                </span>
              </Link>
              
              <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 shrink-0 transition-colors" />
                <span className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">
                  Add a short bio
                </span>
              </Link>
              
              <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-[13px] font-medium text-zinc-400 dark:text-zinc-600 line-through">
                  Add your first custom link
                </span>
              </Link>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm flex flex-col relative overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
              <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-zinc-500" /> Security
              </h3>
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${profile?.isVerified ? 'bg-emerald-50/50 border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' : 'bg-amber-50/50 border-amber-200 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400'}`}>
                {profile?.isVerified ? 'Protected' : 'Action Needed'}
              </span>
            </div>
            
            <div className="flex flex-col p-2">
              <span className="px-4 pt-3 pb-2 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">Recent Logins</span>
              {sessions.slice(0, 3).map((session) => (
                <div key={session.id} className="px-4 py-3 flex items-center justify-between rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-500 border border-zinc-200/50 dark:border-zinc-700/50">
                      <MonitorSmartphone className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[120px]">{parseUA(session.device)}</span>
                        {session.isCurrent && (
                          <span className="flex h-2 w-2 relative" title="Current session">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        )}
                      </div>
                      <span className="text-[12px] text-zinc-500 font-mono mt-0.5">{session.ipAddress}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
