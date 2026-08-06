"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { listAuditEvents, type AuditEvent } from '@/lib/authlog-client';
import { AuthlogError } from '@/lib/authlog-client';
import {
  Activity,
  ArrowUpRight,
  Key,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  MonitorSmartphone,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

function getIconForAction(action: string) {
  if (action.includes('login')) return action.includes('failure') ? ShieldAlert : ArrowUpRight;
  if (action.includes('token')) return Key;
  if (action.includes('mfa')) return ShieldCheck;
  if (action.includes('session')) return MonitorSmartphone;
  return Activity;
}

function getOutcomeType(outcome: string) {
  if (outcome === 'success') return 'success';
  if (outcome === 'failure') return 'danger';
  if (outcome === 'pending') return 'warning';
  return 'info';
}

function formatAction(action: string) {
  return action.replace(/\./g, ' · ').replace(/_/g, ' ');
}

function getTimeAgo(dateString: string) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

export default function AuditPage() {
  const { loading: authLoading, getAccessToken } = useAuth();
  useAuthGuard();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 5;
  const totalPages = Math.max(1, Math.ceil(events.length / limit));


  useEffect(() => {
    if (authLoading) return;
    const token = getAccessToken();
    if (!token) return;

    (async () => {
      try {
        const data = await listAuditEvents(token, { limit: 100, action: filter || undefined });
        setEvents(data.events);
      } catch (err) {
        console.error(err instanceof AuthlogError ? err.message : err);
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, getAccessToken, filter]);

  const stats = {
    logins: events.filter((e) => e.action.includes('login') && !e.action.includes('fail')).length,
    failures: events.filter((e) => e.action.includes('fail') && e.action.includes('login')).length,
    tokens: events.filter((e) => e.action.startsWith('token.')).length,
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-200 dark:border-[#333] border-t-black dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit Log</h1>
        <p className="text-[#666] mt-1 text-[14px]">Immutable security events from authlog.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-black rounded-xl p-5">
          <div className="text-[13px] text-[#666] mb-2">Successful logins</div>
          <div className="text-3xl font-semibold">{stats.logins}</div>
        </div>
        <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-black rounded-xl p-5">
          <div className="text-[13px] text-[#666] mb-2">Failed logins</div>
          <div className="text-3xl font-semibold text-rose-500">{stats.failures}</div>
        </div>
        <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-black rounded-xl p-5">
          <div className="text-[13px] text-[#666] mb-2">Token events</div>
          <div className="text-3xl font-semibold">{stats.tokens}</div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', 'auth.', 'token.', 'user.', 'role.'].map((f) => (
          <button
            key={f || 'all'}
            onClick={() => {
              setFilter(f);
              setCurrentPage(1);
            }}
            className={`text-[12px] px-3 py-1.5 rounded-full border transition-colors ${
              filter === f
                ? 'bg-black dark:bg-white text-white dark:text-black border-transparent'
                : 'border-zinc-200 dark:border-[#333] hover:bg-zinc-50 dark:hover:bg-[#111]'
            }`}
          >
            {f ? f.replace('.', '') : 'All'}
          </button>
        ))}
      </div>

      <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-black rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-[#333] bg-zinc-50/50 dark:bg-[#0a0a0a]">
              <th className="px-5 py-3 text-[12px] font-medium text-[#888] uppercase">Event</th>
              <th className="px-5 py-3 text-[12px] font-medium text-[#888] uppercase">Actor</th>
              <th className="px-5 py-3 text-[12px] font-medium text-[#888] uppercase text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-[#333]">
            {events.slice((currentPage - 1) * limit, currentPage * limit).map((event) => {
              const Icon = getIconForAction(event.action);
              const type = getOutcomeType(event.outcome);
              return (
                <tr key={event.eventId} className="hover:bg-zinc-50/50 dark:hover:bg-[#111]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-md border text-xs
                        ${type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/50' : ''}
                        ${type === 'danger' ? 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/50' : ''}
                        ${type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-950/20' : ''}
                        ${type === 'info' ? 'bg-zinc-100 border-zinc-200 dark:bg-[#222] dark:border-[#333]' : ''}
                      `}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-medium text-[14px] capitalize">{formatAction(event.action)}</div>
                        <div className="text-[11px] text-[#888] capitalize">{event.outcome}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-[13px]">{event.actor?.email || event.actor?.id}</div>
                    <div className="text-[11px] text-[#888] font-mono">{event.actor?.ip || '—'}</div>
                  </td>
                  <td className="px-5 py-4 text-right text-[13px] text-[#666]" title={new Date(event.timestamp).toLocaleString()}>
                    {getTimeAgo(event.timestamp)} ago
                  </td>
                </tr>
              );
            })}
            {events.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-12 text-center text-[#666] text-[13px]">
                  No audit events yet. Try logging in to generate activity.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
