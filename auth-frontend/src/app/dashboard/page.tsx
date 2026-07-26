"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Activity, Users, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [profile, setProfile] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      localStorage.setItem('token', urlToken);
      router.replace('/dashboard');
      return;
    }

    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/login');
    } else {
      setToken(storedToken);
      
      // Fetch profile and sessions
      const headers = { Authorization: `Bearer ${storedToken}` };
      Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sessions`, { headers })
      ])
      .then(async ([profileRes, sessionsRes]) => {
        if (profileRes.status === 401 || sessionsRes.status === 401) {
          localStorage.removeItem('token');
          router.push('/login?error=session_expired');
          return;
        }

        if (profileRes.ok) setProfile(await profileRes.json());
        if (sessionsRes.ok) {
          const data = await sessionsRes.json();
          if (Array.isArray(data)) setSessions(data);
        }
      })
      .catch(err => console.error('Failed to fetch dashboard data:', err))
      .finally(() => setLoading(false));
    }
  }, [router, searchParams]);

  // Simple UA parser
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading your workspace...</div>;
  }

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto w-full relative">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white capitalize">
            Welcome back, {profile?.email ? profile.email.split('@')[0] : '...'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
            Here's what's happening with your account today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors shadow-sm">
            Export Report
          </button>
          <button className="btn-primary py-2 px-4 text-sm rounded-lg shadow-md">
            Manage Security
          </button>
        </div>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        
        {/* Active Sessions Stat (Real Data) */}
        <div className="glass-card p-6 flex flex-col hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Sessions</h3>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{sessions.length || 1}</div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            Active devices
          </div>
        </div>
      </div>

      {/* Main Content Area (Recent Activity Table) */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-surface-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Sessions</h2>
          <button onClick={() => router.push('/dashboard/settings')} className="text-sm font-medium text-primary hover:underline">Manage All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">Device</th>
                <th className="px-6 py-4 font-medium">IP Address</th>
                <th className="px-6 py-4 font-medium">Last Active</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-gray-700 dark:text-gray-300">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium flex items-center gap-2">
                    {parseUA(session.device)}
                    {session.isCurrent && (
                      <span className="text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">{session.ipAddress || 'Unknown IP'}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{new Date(session.lastActive).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No session data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
