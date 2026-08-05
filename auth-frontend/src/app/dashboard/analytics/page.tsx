"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { listAuditEvents, type AuditEvent } from '@/lib/authlog-client';
import { legacyGetProfileStats, legacyGetSecurityLogs } from '@/lib/legacy-api';
import { 
  Users, 
  Activity,
  ShieldAlert,
  ArrowUpRight,
  MonitorSmartphone,
  Key,
  ShieldCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  MousePointerClick,
  Eye,
  Percent,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface AuditLog {
  timestamp: string;
  userId: string;
  event: string;
  ipAddress: string;
  location: string;
  type: string;
}

function mapAuditEvent(e: AuditEvent): AuditLog {
  const outcomeMap: Record<string, string> = {
    success: 'success',
    failure: 'danger',
    pending: 'warning',
  };
  return {
    timestamp: e.timestamp,
    userId: e.actor?.id || '',
    event: e.action.replace(/\./g, ' ').replace(/_/g, ' '),
    ipAddress: e.actor?.ip || '—',
    location: e.actor?.user_agent?.slice(0, 40) || '—',
    type: outcomeMap[e.outcome] || 'info',
  };
}

export default function AnalyticsPage() {
  const { getAccessToken } = useAuth();
  useAuthGuard();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalLogins: 0, failedLogins: 0, passwordChanges: 0 });
  const [profileStats, setProfileStats] = useState({
    totalViews: 0,
    totalClicks: 0,
    ctr: '0',
    chartData: [],
    topLinks: [] as any[],
    topLocations: [] as any[]
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const token = getAccessToken();
      if (!token) return;

      try {
        const [auditData, legacyLogs, legacyStats] = await Promise.all([
          listAuditEvents(token, { limit: 50 }),
          legacyGetSecurityLogs(currentPage, limit),
          legacyGetProfileStats(),
        ]);

        const mapped = auditData.events.map(mapAuditEvent);
        setLogs(mapped);
        setStats({
          totalLogins: mapped.filter((l) => l.event.includes('login success')).length,
          failedLogins: mapped.filter((l) => l.event.includes('login failure')).length,
          passwordChanges: mapped.filter((l) => l.event.includes('password')).length,
        });
        setTotalPages(Math.max(1, Math.ceil(mapped.length / limit)));

        if (legacyStats) setProfileStats(legacyStats);
        if (legacyLogs?.logs?.length && mapped.length === 0) {
          setLogs(legacyLogs.logs);
          if (legacyLogs.stats) setStats(legacyLogs.stats);
          if (legacyLogs.pagination) setTotalPages(legacyLogs.pagination.totalPages || 1);
        }
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [getAccessToken, currentPage]);

  const getIconForEvent = (event: string, type: string) => {
    if (event.toLowerCase().includes('login')) return type === 'success' ? ArrowUpRight : ShieldAlert;
    if (event.toLowerCase().includes('password')) return Key;
    if (event.toLowerCase().includes('mfa')) return type === 'success' ? ShieldCheck : AlertTriangle;
    if (event.toLowerCase().includes('session') || event.toLowerCase().includes('device')) return MonitorSmartphone;
    return Activity;
  };

  const getTimeAgo = (dateString: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
  };

  if (loading && logs.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-200 dark:border-[#333] border-t-black dark:border-t-white rounded-full animate-spin mb-4" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-10">
      
      {/* Header & Tabs */}
      <div className="flex flex-col gap-6 border-b border-zinc-200 dark:border-[#333]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-white capitalize">
            Analytics
          </h1>
          <p className="text-[#666] mt-1 text-[14px]">
            Monitor your profile performance and security logs.
          </p>
        </div>
        
        <div className="flex gap-6 relative">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`pb-3 text-sm font-medium transition-colors relative z-10 ${activeTab === 'profile' ? 'text-black dark:text-white' : 'text-[#888] hover:text-black dark:hover:text-white'}`}
          >
            Profile Analytics
            {activeTab === 'profile' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white rounded-t-full animate-in fade-in zoom-in duration-300" />}
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`pb-3 text-sm font-medium transition-colors relative z-10 ${activeTab === 'security' ? 'text-black dark:text-white' : 'text-[#888] hover:text-black dark:hover:text-white'}`}
          >
            Security Audit Logs
            {activeTab === 'security' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white rounded-t-full animate-in fade-in zoom-in duration-300" />}
          </button>
        </div>
      </div>

      {activeTab === 'profile' ? (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Top Stats for Profile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex flex-row items-center justify-between pb-3 border-b border-zinc-100 dark:border-[#111] mb-4">
                <span className="text-[13px] font-medium text-[#666] tracking-tight">Total Views (30d)</span>
                <Eye className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <div className="text-3xl font-semibold tracking-tighter text-black dark:text-white">{profileStats.totalViews}</div>
                <p className="text-[13px] text-zinc-500 mt-1 font-medium">
                  Last 7 days
                </p>
              </div>
            </div>
            
            <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex flex-row items-center justify-between pb-3 border-b border-zinc-100 dark:border-[#111] mb-4">
                <span className="text-[13px] font-medium text-[#666] tracking-tight">Total Clicks (7d)</span>
                <MousePointerClick className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <div className="text-3xl font-semibold tracking-tighter text-black dark:text-white">{profileStats.totalClicks}</div>
                <p className="text-[13px] text-zinc-500 mt-1 font-medium">
                  Last 7 days
                </p>
              </div>
            </div>
            
            <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex flex-row items-center justify-between pb-3 border-b border-zinc-100 dark:border-[#111] mb-4">
                <span className="text-[13px] font-medium text-[#666] tracking-tight">Click-Through Rate</span>
                <Percent className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <div className="text-3xl font-semibold tracking-tighter text-black dark:text-white">{profileStats.ctr}%</div>
                <p className="text-[13px] text-[#888] mt-1 font-medium">Average conversion</p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] rounded-xl shadow-sm p-6">
            <h3 className="text-[15px] font-semibold text-black dark:text-white mb-6">Views & Clicks Over Time</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={profileStats.chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                  <Area type="monotone" dataKey="clicks" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Links */}
            <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-zinc-200 dark:border-[#333]">
                <h3 className="text-[15px] font-semibold text-black dark:text-white">Top Performing Links</h3>
                <p className="text-[13px] text-[#666] mt-0.5">Most clicked links on your profile.</p>
              </div>
              <div className="flex-1 p-5 flex flex-col gap-5">
                {profileStats.topLinks.map((link, idx) => (
                  <div key={idx} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[14px] font-medium text-black dark:text-white flex items-center gap-1.5">
                          {link.title} <ExternalLink className="w-3 h-3 text-[#666]" />
                        </span>
                        <span className="text-[12px] text-[#888]">{link.url}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[14px] font-semibold text-black dark:text-white">{link.clicks}</span>
                        <span className="text-[12px] text-[#888]">clicks</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-zinc-100 dark:bg-[#222] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${link.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Locations */}
            <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-zinc-200 dark:border-[#333]">
                <h3 className="text-[15px] font-semibold text-black dark:text-white">Top Locations</h3>
                <p className="text-[13px] text-[#666] mt-0.5">Where your visitors are coming from.</p>
              </div>
              <div className="flex-1 p-5 flex flex-col gap-5">
                {profileStats.topLocations.map((loc, idx) => (
                  <div key={idx} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-zinc-100 dark:bg-[#222] rounded-full flex items-center justify-center text-[10px] font-semibold text-[#888]">
                          {loc.code}
                        </div>
                        <span className="text-[14px] font-medium text-black dark:text-white">{loc.country}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[14px] font-semibold text-black dark:text-white">{loc.views}</span>
                        <span className="text-[12px] text-[#888]">views</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-zinc-100 dark:bg-[#222] rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${loc.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Security Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex flex-row items-center justify-between pb-3 border-b border-zinc-100 dark:border-[#111] mb-4">
                <span className="text-[13px] font-medium text-[#666] tracking-tight">Total Logins</span>
                <Users className="w-4 h-4 text-[#888]" />
              </div>
              <div>
                <div className="text-3xl font-semibold tracking-tighter text-black dark:text-white">{stats.totalLogins}</div>
                <p className="text-[13px] text-[#888] mt-1 font-medium">Recorded events</p>
              </div>
            </div>
            
            <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex flex-row items-center justify-between pb-3 border-b border-zinc-100 dark:border-[#111] mb-4">
                <span className="text-[13px] font-medium text-[#666] tracking-tight">Security Changes</span>
                <Key className="w-4 h-4 text-[#888]" />
              </div>
              <div>
                <div className="text-3xl font-semibold tracking-tighter text-black dark:text-white">{stats.passwordChanges}</div>
                <p className="text-[13px] text-[#888] mt-1 font-medium">Password updates</p>
              </div>
            </div>
            
            <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex flex-row items-center justify-between pb-3 border-b border-zinc-100 dark:border-[#111] mb-4">
                <span className="text-[13px] font-medium text-[#666] tracking-tight">Failed Logins</span>
                <ShieldAlert className="w-4 h-4 text-rose-500" />
              </div>
              <div>
                <div className="text-3xl font-semibold tracking-tighter text-black dark:text-white">{stats.failedLogins}</div>
                <p className="text-[13px] text-rose-600 dark:text-rose-500 mt-1 font-medium">Requires attention</p>
              </div>
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-200 dark:border-[#333]">
              <h3 className="text-[15px] font-semibold text-black dark:text-white">Audit Log</h3>
              <p className="text-[13px] text-[#666] mt-0.5">A live timeline of recent security events.</p>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-[#333] bg-zinc-50/50 dark:bg-[#0a0a0a]">
                    <th className="px-5 py-3 text-[12px] font-medium text-[#888] uppercase tracking-wider">Event</th>
                    <th className="px-5 py-3 text-[12px] font-medium text-[#888] uppercase tracking-wider">Location & IP</th>
                    <th className="px-5 py-3 text-[12px] font-medium text-[#888] uppercase tracking-wider text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-[#333]">
                  {logs.map((log, idx) => {
                    const Icon = getIconForEvent(log.event, log.type);
                    return (
                      <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-[#111] transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-md border
                              ${log.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-500' : ''}
                              ${log.type === 'danger' ? 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-500' : ''}
                              ${log.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-500' : ''}
                              ${log.type === 'info' ? 'bg-zinc-100 border-zinc-200 text-zinc-600 dark:bg-[#222] dark:border-[#333] dark:text-zinc-300' : ''}
                            `}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-medium text-[14px] text-black dark:text-white">{log.event}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-[13px] text-black dark:text-white">{log.location}</span>
                            <span className="text-[12px] text-[#888] mt-0.5 font-mono">{log.ipAddress}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-[13px] text-[#666] group-hover:text-black dark:group-hover:text-white transition-colors" title={new Date(log.timestamp).toLocaleString()}>
                            {getTimeAgo(log.timestamp)} ago
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-5 py-12 text-center text-[#666] text-[13px]">
                        No security events recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-zinc-200 dark:border-[#333] flex items-center justify-between bg-zinc-50/30 dark:bg-[#0a0a0a]/50">
                <p className="text-sm text-[#666]">
                  Page <span className="font-medium text-black dark:text-white">{currentPage}</span> of <span className="font-medium text-black dark:text-white">{totalPages}</span>
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-[#111] transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-[#111] transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
    </div>
  );
}
