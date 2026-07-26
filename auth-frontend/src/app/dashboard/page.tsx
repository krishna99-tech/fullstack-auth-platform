"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, ArrowUpRight, MonitorSmartphone, KeySquare, Clock } from 'lucide-react';
import Link from 'next/link';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Illustration } from "@/components/shared-assets/illustrations";
import { MagicBento, MagicBentoCard } from "@/components/foundations/MagicBento";

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [profile, setProfile] = useState<{ email: string, isVerified?: boolean } | null>(null);

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
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading your workspace...</p>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto w-full relative animate-fade-in-up">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight capitalize">
            Welcome back, {profile?.email ? profile.email.split('@')[0] : '...'}
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Here's what's happening with your account today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl shadow-sm">
            Export Report
          </Button>
          <Link href="/dashboard/settings" className={cn(buttonVariants({ variant: "default" }), "rounded-xl shadow-md bg-blue-600 hover:bg-blue-700 text-white")}>
            Manage Security
          </Link>
        </div>
      </div>

      {/* Magic Bento Section replacing the old layout */}
      <div>
        <div className="w-full flex justify-center">
          <MagicBento 
            enableSpotlight={true}
            spotlightRadius={300}
            glowColor="59, 130, 246"
            className="w-full gap-6"
          >
            {/* Active Sessions Stat */}
            <MagicBentoCard className="col-span-1 p-6" enableStars={true} particleCount={8} glowColor="59, 130, 246">
              <div className="flex flex-col h-full justify-between z-10 relative">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <span className="text-sm font-medium text-muted-foreground">Active Sessions</span>
                  <Illustration type="monitor" size="sm" variant="primary" />
                </div>
                <div>
                  <div className="text-4xl font-extrabold mb-2 text-foreground">{sessions.length || 1}</div>
                  <div className="flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                    <ArrowUpRight className="w-4 h-4" /> 
                    <span>Securely connected</span>
                  </div>
                </div>
              </div>
            </MagicBentoCard>

            {/* Account Security Stat */}
            <MagicBentoCard className="col-span-1 p-6" enableBorderGlow={true} glowColor="16, 185, 129">
              <div className="flex flex-col h-full justify-between z-10 relative">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <span className="text-sm font-medium text-muted-foreground">Security Status</span>
                  <Illustration type="shield-check" size="sm" variant="success" />
                </div>
                <div>
                  <div className="text-2xl font-bold mb-3 mt-2 text-foreground">
                    {profile?.isVerified ? 'Protected' : 'Action Required'}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${profile?.isVerified ? 'bg-emerald-500 w-[90%]' : 'bg-amber-500 w-[40%]'}`} />
                    </div>
                    <span>{profile?.isVerified ? 'Good' : 'Weak'}</span>
                  </div>
                </div>
              </div>
            </MagicBentoCard>

            {/* Recent Activity Stat */}
            <MagicBentoCard className="col-span-1 p-6 lg:col-span-2" enableMagnetism={true} enableTilt={true} glowColor="245, 158, 11">
              <div className="flex flex-col h-full justify-between z-10 relative pointer-events-none">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <span className="text-sm font-medium text-muted-foreground">Authentication Events</span>
                  <Illustration type="key" size="sm" variant="warning" />
                </div>
                <div>
                  <div className="text-4xl font-extrabold mb-2 text-foreground">12</div>
                  <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                    <Clock className="w-4 h-4" /> 
                    <span>Logins in last 30 days</span>
                  </div>
                </div>
              </div>
            </MagicBentoCard>

            {/* Main Content Area (Recent Activity Table) */}
            <MagicBentoCard className="col-span-1 md:col-span-2 lg:col-span-4 p-0 overflow-visible" enableBorderGlow={true} glowColor="59, 130, 246">
              <div className="h-full z-10 relative flex flex-col">
                <div className="p-6 md:p-8 border-b border-border flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Active Sessions</h2>
                    <p className="text-sm text-muted-foreground mt-1">Review where your account is currently logged in.</p>
                  </div>
                  <Link href="/dashboard/settings" className={cn(buttonVariants({ variant: "secondary" }), "rounded-xl font-bold border-0")}>
                    Manage
                  </Link>
                </div>
                <div className="overflow-x-auto w-full">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="px-6 md:px-8 py-4 font-semibold uppercase tracking-wider text-xs text-muted-foreground">Device & Browser</TableHead>
                        <TableHead className="px-6 md:px-8 py-4 font-semibold uppercase tracking-wider text-xs text-muted-foreground">IP Address</TableHead>
                        <TableHead className="px-6 md:px-8 py-4 font-semibold uppercase tracking-wider text-xs text-muted-foreground">Last Active</TableHead>
                        <TableHead className="px-6 md:px-8 py-4 font-semibold uppercase tracking-wider text-xs text-right text-muted-foreground">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.map((session) => (
                        <TableRow key={session.id} className="hover:bg-muted/50 transition-colors group border-border">
                          <TableCell className="px-6 md:px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-muted/50 rounded-lg text-muted-foreground group-hover:text-blue-500 group-hover:bg-blue-500/10 transition-colors">
                                <MonitorSmartphone className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col text-foreground">
                                <span className="font-bold">{parseUA(session.device)}</span>
                                {session.isCurrent && (
                                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Current Session</span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 md:px-8 py-5 font-medium text-foreground">{session.ipAddress || 'Unknown IP'}</TableCell>
                          <TableCell className="px-6 md:px-8 py-5 text-muted-foreground font-medium">
                            {new Date(session.lastActive).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </TableCell>
                          <TableCell className="px-6 md:px-8 py-5 text-right">
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold gap-1.5 py-1 px-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {sessions.length === 0 && (
                        <TableRow className="border-border hover:bg-transparent">
                          <TableCell colSpan={4} className="px-6 py-12 text-center text-muted-foreground font-medium">
                            No session data available.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </MagicBentoCard>
          </MagicBento>
        </div>
      </div>
      
    </div>
  );
}
