"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { getProfile, listSessions } from '@/lib/auth-backend-client';
import { listAuditEvents, type AuditEvent } from '@/lib/authlog-client';
import { legacyGetSecurityLogs } from '@/lib/legacy-api';
import { hasAuthlog } from '@/lib/config';
import {
  Bell,
  Key,
  MonitorSmartphone,
  ShieldAlert,
  ShieldCheck,
  ArrowUpRight,
  Activity,
} from 'lucide-react';

interface SecurityLog {
  timestamp: string;
  event: string;
  ipAddress?: string;
  type?: string;
}

interface Session {
  id: string;
  device: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

function getIconForEvent(event: string) {
  const lower = event.toLowerCase();
  if (lower.includes('login') && lower.includes('fail')) return ShieldAlert;
  if (lower.includes('login')) return ArrowUpRight;
  if (lower.includes('password')) return Key;
  if (lower.includes('mfa')) return ShieldCheck;
  if (lower.includes('session')) return MonitorSmartphone;
  return Activity;
}

function getTimeAgo(dateString: string) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function mapAuditEvent(e: AuditEvent): SecurityLog {
  return {
    timestamp: e.timestamp,
    event: e.action.replace(/\./g, ' · ').replace(/_/g, ' '),
    ipAddress: e.actor?.ip,
    type: e.outcome,
  };
}

function isSecurityEvent(event: string) {
  const lower = event.toLowerCase();
  return (
    lower.includes('login') ||
    lower.includes('password') ||
    lower.includes('session') ||
    lower.includes('mfa') ||
    lower.includes('token')
  );
}

export default function NotificationsPage() {
  useAuthGuard();
  const { getAccessToken, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [events, setEvents] = useState<SecurityLog[]>([]);

  useEffect(() => {
    if (authLoading) return;
    const token = getAccessToken();
    if (!token) return;

    (async () => {
      try {
        const [profile, sessionData] = await Promise.all([
          getProfile(token),
          listSessions(token),
        ]);
        setEmailNotifications(profile.emailNotifications !== false);
        setSessions(sessionData.sessions || []);

        let securityEvents: SecurityLog[] = [];

        if (hasAuthlog()) {
          try {
            const audit = await listAuditEvents(token, { limit: 30 });
            securityEvents = audit.events
              .filter((e) => isSecurityEvent(e.action))
              .map(mapAuditEvent);
          } catch {
            // authlog unavailable — fall through to legacy
          }
        }

        if (securityEvents.length === 0) {
          const legacy = await legacyGetSecurityLogs(1, 30);
          if (legacy?.logs) {
            securityEvents = legacy.logs
              .filter((l: SecurityLog) => isSecurityEvent(l.event))
              .map((l: SecurityLog) => ({
                timestamp: l.timestamp,
                event: l.event,
                ipAddress: l.ipAddress,
                type: l.type,
              }));
          }
        }

        setEvents(securityEvents);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, getAccessToken]);

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
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Bell className="w-6 h-6" />
          Notifications
        </h1>
        <p className="text-sm text-zinc-500 mt-1">Recent security activity and session updates for your account.</p>
      </div>

      <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-black rounded-xl p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold">Email notifications</h2>
            <p className="text-xs text-zinc-500 mt-1">
              {emailNotifications
                ? 'You will receive security alerts by email.'
                : 'Email security alerts are turned off.'}
            </p>
          </div>
          <Link
            href="/dashboard/settings"
            className="text-sm text-purple-600 dark:text-purple-400 hover:underline shrink-0"
          >
            Manage in Settings →
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-3">Active sessions</h2>
        <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-black rounded-xl overflow-hidden divide-y divide-zinc-200 dark:divide-[#333]">
          {sessions.length === 0 ? (
            <p className="px-5 py-8 text-sm text-zinc-500 text-center">No active sessions found.</p>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="px-5 py-4 flex items-center gap-3">
                <div className="p-2 rounded-md bg-zinc-100 dark:bg-[#111]">
                  <MonitorSmartphone className="w-4 h-4 text-zinc-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {session.device}
                    {session.isCurrent && (
                      <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">Current</span>
                    )}
                  </p>
                  <p className="text-xs text-zinc-500">{session.ipAddress} · Last active {getTimeAgo(session.lastActive)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-3">Security activity</h2>
        <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-black rounded-xl overflow-hidden divide-y divide-zinc-200 dark:divide-[#333]">
          {events.length === 0 ? (
            <p className="px-5 py-8 text-sm text-zinc-500 text-center">
              No recent security events. Activity from logins, password changes, and session revokes will appear here.
            </p>
          ) : (
            events.map((event, i) => {
              const Icon = getIconForEvent(event.event);
              return (
                <div key={`${event.timestamp}-${i}`} className="px-5 py-4 flex items-center gap-3">
                  <div className="p-2 rounded-md bg-zinc-100 dark:bg-[#111]">
                    <Icon className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize">{event.event}</p>
                    {event.ipAddress && (
                      <p className="text-xs text-zinc-500 font-mono">{event.ipAddress}</p>
                    )}
                  </div>
                  <span className="text-xs text-zinc-500 shrink-0" title={new Date(event.timestamp).toLocaleString()}>
                    {getTimeAgo(event.timestamp)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
