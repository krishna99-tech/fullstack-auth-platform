"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  ChevronRight
} from 'lucide-react';

interface AuditLog {
  timestamp: string;
  userId: string;
  event: string;
  ipAddress: string;
  location: string;
  type: string;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalLogins: 0, failedLogins: 0, passwordChanges: 0 });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/analytics?page=${currentPage}&limit=${limit}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
          if (data.stats) {
            setStats(data.stats);
          }
          if (data.pagination) {
            setTotalPages(data.pagination.totalPages || 1);
          }
        }
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [router, currentPage]);

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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-200 dark:border-[#333] border-t-black dark:border-t-white rounded-full animate-spin mb-4" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-[#333] pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-white capitalize">
            Analytics
          </h1>
          <p className="text-[#666] mt-1 text-[14px]">
            Monitor your authentication events and security logs.
          </p>
        </div>
      </div>

      {/* Top Stats */}
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
  );
}
