"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  MonitorSmartphone, 
  ShieldCheck, 
  KeySquare, 
  Clock, 
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  Mail,
  Fingerprint,
  MoreVertical,
  Terminal,
  Activity,
  Key,
  Copy,
  ExternalLink
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [profileRes, sessionsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sessions`, {
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
            Manage your account security and active sessions.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/dashboard/settings" className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black hover:bg-[#333] dark:hover:bg-[#e0e0e0] text-sm font-medium rounded-md transition-colors shadow-sm">
            Security Settings
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Stat Box 1 */}
            <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex flex-row items-center justify-between pb-3 border-b border-zinc-100 dark:border-[#111] mb-4">
                <span className="text-[13px] font-medium text-[#666] tracking-tight">Active Sessions</span>
                <MonitorSmartphone className="w-4 h-4 text-[#888]" />
              </div>
              <div>
                <div className="text-4xl font-semibold tracking-tighter mb-2 text-black dark:text-white">{sessions.length || 1}</div>
                <div className="flex items-center gap-1.5 text-[13px] text-emerald-600 dark:text-emerald-500 font-medium">
                  <Activity className="w-3.5 h-3.5" /> 
                  <span>Securely connected</span>
                </div>
              </div>
            </div>

            {/* Stat Box 2 */}
            <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex flex-row items-center justify-between pb-3 border-b border-zinc-100 dark:border-[#111] mb-4">
                <span className="text-[13px] font-medium text-[#666] tracking-tight">Security Status</span>
                <ShieldCheck className={`w-4 h-4 ${profile?.isVerified ? 'text-emerald-500' : 'text-amber-500'}`} />
              </div>
              <div>
                <div className="text-3xl font-semibold tracking-tighter mb-2 text-black dark:text-white">
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
          </div>

          {/* Security Checklist */}
          <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] rounded-xl shadow-sm">
            <div className="p-5 border-b border-zinc-200 dark:border-[#333] flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-black dark:text-white">Security Checklist</h3>
                <p className="text-[13px] text-[#666] mt-0.5">Complete these steps to maximize your account security.</p>
              </div>
              <Terminal className="w-4 h-4 text-[#888]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-[#111] hover:bg-[#fafafa] dark:hover:bg-[#0a0a0a] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 border border-zinc-200 dark:border-[#333] rounded-md bg-white dark:bg-[#000]">
                    <Mail className="w-4 h-4 text-black dark:text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[14px] text-black dark:text-white">Verify Email Address</h4>
                    <p className="text-[13px] text-[#666] mt-0.5">Ensure you can recover your account.</p>
                  </div>
                </div>
                {profile?.isVerified ? (
                  <span className="text-[12px] px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded-full font-medium">Completed</span>
                ) : (
                  <Link href="/dashboard/settings" className="text-[13px] font-medium text-black dark:text-white border border-zinc-200 dark:border-[#333] px-3 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-[#111] transition-colors">Verify Now</Link>
                )}
              </div>
              
              <div className="flex items-center justify-between p-5 hover:bg-[#fafafa] dark:hover:bg-[#0a0a0a] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 border border-zinc-200 dark:border-[#333] rounded-md bg-white dark:bg-[#000]">
                    <Fingerprint className="w-4 h-4 text-black dark:text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[14px] text-black dark:text-white">Enable Two-Factor Auth</h4>
                    <p className="text-[13px] text-[#666] mt-0.5">Protect against unauthorized access.</p>
                  </div>
                </div>
                {profile?.mfaEnabled ? (
                  <span className="text-[12px] px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded-full font-medium">Completed</span>
                ) : (
                  <Link href="/dashboard/settings" className="text-[13px] font-medium text-black dark:text-white border border-zinc-200 dark:border-[#333] px-3 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-[#111] transition-colors">Enable MFA</Link>
                )}
              </div>
            </div>
          </div>

          {/* API Keys */}
          <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] rounded-xl shadow-sm">
            <div className="p-5 border-b border-zinc-200 dark:border-[#333] flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-black dark:text-white">API Keys</h3>
                <p className="text-[13px] text-[#666] mt-0.5">Manage your secret keys for external integrations.</p>
              </div>
              <button className="text-[13px] font-medium text-black dark:text-white border border-zinc-200 dark:border-[#333] px-3 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-[#111] transition-colors shadow-sm">
                Generate New Key
              </button>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-[#111] hover:bg-[#fafafa] dark:hover:bg-[#0a0a0a] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 border border-zinc-200 dark:border-[#333] rounded-md bg-white dark:bg-[#000]">
                    <Key className="w-4 h-4 text-black dark:text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[14px] text-black dark:text-white">Production Key</h4>
                    <p className="text-[12px] text-[#888] font-mono mt-0.5 tracking-wider">pk_live_********************</p>
                  </div>
                </div>
                <button className="text-[13px] font-medium text-[#666] hover:text-black dark:hover:text-white border border-transparent hover:border-zinc-200 dark:hover:border-[#333] px-2 py-1.5 rounded-md transition-colors flex items-center gap-1.5">
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
              </div>
              <div className="flex items-center justify-between p-5 hover:bg-[#fafafa] dark:hover:bg-[#0a0a0a] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 border border-zinc-200 dark:border-[#333] rounded-md bg-white dark:bg-[#000]">
                    <Key className="w-4 h-4 text-black dark:text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[14px] text-black dark:text-white">Test Key</h4>
                    <p className="text-[12px] text-[#888] font-mono mt-0.5 tracking-wider">pk_test_********************</p>
                  </div>
                </div>
                <button className="text-[13px] font-medium text-[#666] hover:text-black dark:hover:text-white border border-transparent hover:border-zinc-200 dark:hover:border-[#333] px-2 py-1.5 rounded-md transition-colors flex items-center gap-1.5">
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] rounded-xl shadow-sm flex flex-col h-full">
            <div className="p-5 border-b border-zinc-200 dark:border-[#333] flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-black dark:text-white">Recent Sessions</h3>
                <p className="text-[13px] text-[#666] mt-0.5">Where you are logged in.</p>
              </div>
              <Link href="/dashboard/settings" className="p-1.5 text-[#888] hover:text-black dark:hover:text-white rounded-md hover:bg-zinc-100 dark:hover:bg-[#111] transition-colors">
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-zinc-100 dark:divide-[#111]">
                {sessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="p-4 flex items-center justify-between hover:bg-[#fafafa] dark:hover:bg-[#0a0a0a] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded border border-zinc-200 dark:border-[#333] flex items-center justify-center bg-white dark:bg-[#000] text-[#666]">
                        <MonitorSmartphone className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-[13px] text-black dark:text-white">{parseUA(session.device)}</span>
                        <span className="text-[12px] text-[#888]">{session.ipAddress}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.isCurrent && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      )}
                    </div>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <div className="p-8 text-center text-[#666] text-[13px]">
                    No active sessions found.
                  </div>
                )}
              </div>
            </div>
            {sessions.length > 5 && (
              <div className="p-3 border-t border-zinc-100 dark:border-[#111] text-center">
                 <Link href="/dashboard/settings" className="text-[13px] text-[#666] hover:text-black dark:hover:text-white transition-colors">View all sessions</Link>
              </div>
            )}
          </div>

          {/* Support Widget */}
          <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] rounded-xl shadow-sm p-5 relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-zinc-100 to-transparent dark:from-[#111] rounded-full opacity-50 blur-xl"></div>
            
            <h3 className="text-[15px] font-semibold text-black dark:text-white mb-1.5 relative z-10">Need Help?</h3>
            <p className="text-[13px] text-[#666] mb-5 relative z-10">Contact our support team or explore the documentation if you encounter any security issues.</p>
            
            <div className="flex flex-col gap-2 relative z-10">
              <a href="mailto:support@acme.com" className="w-full text-center text-[13px] font-medium text-white bg-black dark:text-black dark:bg-white px-3 py-2 rounded-md hover:bg-[#333] dark:hover:bg-[#e0e0e0] transition-colors shadow-sm">
                Contact Support
              </a>
              <a href="#" className="w-full flex items-center justify-center gap-1.5 text-center text-[13px] font-medium text-black dark:text-white border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-[#111] transition-colors shadow-sm">
                View Documentation <ExternalLink className="w-3.5 h-3.5 text-[#888]" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
