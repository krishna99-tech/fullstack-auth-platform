"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Shield, 
  Monitor, 
  Smartphone, 
  Globe, 
  CheckCircle2, 
  AlertCircle,
  Mail,
  Camera,
  Trash2,
  Edit3,
  RefreshCcw,
  X
} from 'lucide-react';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlideoutMenu } from "@/components/application/slideout-menu";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button as AriaButton } from "react-aria-components";

interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
  phoneNumber: string | null;
  createdAt: string;
  isVerified: boolean;
  hasPassword?: boolean;
  hasGoogle?: boolean;
  hasGithub?: boolean;
  mfaEnabled?: boolean;
  emailNotifications?: boolean;
}

interface Session {
  id: string;
  device: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

export default function SettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);

  // Profile Edit State
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileMsg, setProfileMsg] = useState('');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');

  // MFA State
  const [mfaSetupQr, setMfaSetupQr] = useState('');
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);

  // Notification State
  const [isTogglingNotifications, setIsTogglingNotifications] = useState(false);
  const [isMasterSlideoutOpen, setIsMasterSlideoutOpen] = useState(false);

  // Session Revoke State
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [revokedSessionId, setRevokedSessionId] = useState<string | null>(null);
  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const [revokeAllSuccess, setRevokeAllSuccess] = useState(false);

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

        if (profileRes.ok) {
          const data = await profileRes.json();
          const userData = data.user || data;
          setProfile(userData);
          setEditName(userData?.name || '');
          setEditEmail(userData?.email || '');
          setEditPhone(userData?.phoneNumber || '');
          setEditUsername(userData?.username || '');
        }

        if (sessionsRes.ok) {
          const data = await sessionsRes.json();
          setSessions(Array.isArray(data) ? data : (data.sessions || []));
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileMsg('');
    setIsUpdatingProfile(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ name: editName, email: editEmail, phoneNumber: editPhone, username: editUsername })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Failed to update profile');

      setProfile(prev => prev ? { ...prev, ...(data.user || {}) } : data.user);
      if (data.user?.username !== undefined) setEditUsername(data.user.username || '');
      setProfileMsg('Profile updated successfully!');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err: any) {
      setProfileError(err.message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdMsg('');

    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match');
      return;
    }

    setIsChangingPwd(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Failed to change password');

      setPwdMsg('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdMsg(''), 3000);
    } catch (err: any) {
      setPwdError(err.message);
    } finally {
      setIsChangingPwd(false);
    }
  };

  const handleSetupMfa = async () => {
    setMfaLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/mfa/setup`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMfaSetupQr(data.qrCodeUrl);
        setMfaSecret(data.secret);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMfaLoading(false);
    }
  };

  const handleVerifyMfa = async () => {
    setMfaLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/mfa/verify`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ token: mfaCode, secret: mfaSecret })
      });
      
      if (res.ok) {
        setProfile(prev => prev ? { ...prev, mfaEnabled: true } : null);
        setMfaSetupQr('');
        setMfaSecret('');
        setMfaCode('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMfaLoading(false);
    }
  };

  const handleDisableMfa = async () => {
    setMfaLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/mfa/disable`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setProfile(prev => prev ? { ...prev, mfaEnabled: false } : null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMfaLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSessionId(sessionId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        // Flash success before removing
        setRevokedSessionId(sessionId);
        setTimeout(() => {
          setSessions(prev => prev.filter(s => s.id !== sessionId));
          setRevokedSessionId(null);
        }, 800);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRevokingSessionId(null);
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    setIsRevokingAll(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sessions/others`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setRevokeAllSuccess(true);
        setTimeout(() => {
          setSessions(prev => prev.filter(s => s.isCurrent));
          setRevokeAllSuccess(false);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRevokingAll(false);
    }
  };

  const handleUnlinkProvider = async (provider: 'google' | 'github') => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/providers/${provider}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(prev => prev ? { ...prev, [`has${provider.charAt(0).toUpperCase() + provider.slice(1)}`]: false } : null);
      } else {
        alert(data.error || 'Failed to unlink account');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleNotifications = async (val: boolean) => {
    setIsTogglingNotifications(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/preferences`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ emailNotifications: val })
      });
      if (res.ok) {
        setProfile(prev => prev ? { ...prev, emailNotifications: val } : null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTogglingNotifications(false);
    }
  };

  const parseUA = (uaString: string) => {
    if (!uaString) return 'Unknown Device';
    if (uaString.includes('Windows')) return 'Windows PC';
    if (uaString.includes('Macintosh')) return 'Mac';
    if (uaString.includes('iPhone')) return 'iPhone';
    if (uaString.includes('Android')) return 'Android Device';
    return uaString.split(' ')[0] || 'Unknown Device';
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <p className="text-muted-foreground animate-pulse">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and configurations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AriaButton className="w-full text-left outline-none" onPress={() => setIsMasterSlideoutOpen(true)}>
          <Card className="hover:border-primary/50 transition-colors h-full cursor-pointer bg-background/50 backdrop-blur-sm shadow-sm">
             <CardHeader>
               <CardTitle>Account Information</CardTitle>
               <CardDescription>Manage your profile, email, and personal details.</CardDescription>
             </CardHeader>
          </Card>
        </AriaButton>
        <AriaButton className="w-full text-left outline-none" onPress={() => setIsMasterSlideoutOpen(true)}>
          <Card className="hover:border-primary/50 transition-colors h-full cursor-pointer bg-background/50 backdrop-blur-sm shadow-sm">
             <CardHeader>
               <CardTitle>Security & Password</CardTitle>
               <CardDescription>Update your password and secure your account.</CardDescription>
             </CardHeader>
          </Card>
        </AriaButton>
        <AriaButton className="w-full text-left outline-none" onPress={() => setIsMasterSlideoutOpen(true)}>
          <Card className="hover:border-primary/50 transition-colors h-full cursor-pointer bg-background/50 backdrop-blur-sm shadow-sm">
             <CardHeader>
               <CardTitle>Two-Factor Authentication</CardTitle>
               <CardDescription>Enable 2FA for an extra layer of security.</CardDescription>
             </CardHeader>
          </Card>
        </AriaButton>
        <AriaButton className="w-full text-left outline-none" onPress={() => setIsMasterSlideoutOpen(true)}>
          <Card className="hover:border-primary/50 transition-colors h-full cursor-pointer bg-background/50 backdrop-blur-sm shadow-sm">
             <CardHeader>
               <CardTitle>Device Sessions</CardTitle>
               <CardDescription>Manage your active devices and sessions.</CardDescription>
             </CardHeader>
          </Card>
        </AriaButton>
        <AriaButton className="w-full text-left outline-none" onPress={() => setIsMasterSlideoutOpen(true)}>
          <Card className="hover:border-primary/50 transition-colors h-full cursor-pointer bg-background/50 backdrop-blur-sm shadow-sm">
             <CardHeader>
               <CardTitle>Connected Accounts</CardTitle>
               <CardDescription>Link your Google or GitHub accounts.</CardDescription>
             </CardHeader>
          </Card>
        </AriaButton>
        <AriaButton className="w-full text-left outline-none" onPress={() => setIsMasterSlideoutOpen(true)}>
          <Card className="hover:border-primary/50 transition-colors h-full cursor-pointer bg-background/50 backdrop-blur-sm shadow-sm">
             <CardHeader>
               <CardTitle>Notifications</CardTitle>
               <CardDescription>Configure your email alerts.</CardDescription>
             </CardHeader>
          </Card>
        </AriaButton>
      </div>

      <SlideoutMenu isOpen={isMasterSlideoutOpen} onOpenChange={setIsMasterSlideoutOpen}>
        {({ close }) => (
          <>
            {/* Banner — sits directly in Dialog, outside any scrollable container */}
            <div className="h-32 md:h-40 w-full bg-gradient-to-r from-[#d9b8f1] via-[#f3c5e8] to-[#f9d6cd] dark:from-[#2e1d45] dark:via-[#422247] dark:to-[#4e2f2e] relative flex-shrink-0">
              {/* Close button — top-left */}
              <button
                type="button"
                onClick={close}
                aria-label="Close settings"
                className="absolute top-3 left-3 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 dark:bg-black/30 dark:hover:bg-black/60 text-white backdrop-blur-sm transition-all duration-150 hover:scale-110"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <Button size="icon" variant="ghost" className="text-foreground/70 hover:text-foreground hover:bg-black/10 dark:hover:bg-black/40 h-8 w-8 rounded-full">
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-foreground/70 hover:text-foreground hover:bg-black/10 dark:hover:bg-black/40 h-8 w-8 rounded-full">
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Avatar — sits directly in Dialog, overlaps banner via negative margin, never clipped */}
            <div className="px-6 flex-shrink-0" style={{ marginTop: '-3.5rem' }}>
              <div className="flex items-end mb-4">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-zinc-900 border-4 border-background flex items-center justify-center text-white text-3xl font-bold relative group overflow-hidden" style={{ zIndex: 10 }}>
                  <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=256&h=256&q=80" alt="Avatar" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center cursor-pointer backdrop-blur-sm transition-all">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  {editName || profile?.name || 'Your Name'}
                  {profile?.isVerified && <span className="text-blue-500"><CheckCircle2 className="w-5 h-5 fill-current text-background" /></span>}
                </h2>
                <p className="text-muted-foreground">@{editUsername || profile?.username || 'username'}</p>
              </div>
            </div>

            {/* Scrollable content — everything below the avatar */}
            <SlideoutMenu.Content className="flex flex-col gap-0 !p-0 !gap-0">
              <div className="w-full pb-12 flex flex-col gap-0">

        {/* Profile form section */}
        <div className="px-6 pb-8">

            {profileError && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 text-destructive text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{profileError}</p>
              </div>
            )}
            {profileMsg && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 text-emerald-600 dark:text-emerald-400 text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{profileMsg}</p>
              </div>
            )}
            
            <form id="profile-form" onSubmit={handleUpdateProfile} className="space-y-6">
              
              {/* Name Row */}
              <div className="space-y-3 pb-6 border-b border-dashed border-border/60">
                <Label className="text-muted-foreground font-medium flex gap-1">Name <span className="text-amber-500">*</span></Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input 
                    type="text" 
                    className="bg-transparent border-border/50 focus-visible:ring-1 focus-visible:ring-border h-11" 
                    placeholder="First Name" 
                    value={editName.split(' ')[0] || ''} 
                    onChange={(e) => setEditName(e.target.value + ' ' + (editName.split(' ').slice(1).join(' ') || ''))} 
                  />
                  <Input 
                    type="text" 
                    className="bg-transparent border-border/50 focus-visible:ring-1 focus-visible:ring-border h-11" 
                    placeholder="Last Name" 
                    value={editName.split(' ').slice(1).join(' ') || ''} 
                    onChange={(e) => setEditName((editName.split(' ')[0] || '') + ' ' + e.target.value)} 
                  />
                </div>
              </div>

              {/* Email Row */}
              <div className="space-y-3 pb-6 border-b border-dashed border-border/60">
                <Label className="text-muted-foreground font-medium flex gap-1">Email <span className="text-amber-500">*</span></Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/70" />
                  <Input 
                    type="email" 
                    className="pl-11 bg-transparent border-border/50 focus-visible:ring-1 focus-visible:ring-border h-11" 
                    value={editEmail} 
                    onChange={(e) => setEditEmail(e.target.value)} 
                    required 
                  />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold mt-2">
                  {profile?.isVerified ? (
                    <span className="text-blue-500 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 fill-current text-background" /> Verified {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'recently'}</span>
                  ) : (
                    <span className="text-amber-500 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> Unverified</span>
                  )}
                </div>
              </div>

              {/* Username Row */}
              <div className="space-y-3 pb-6 border-b border-dashed border-border/60">
                <Label className="text-muted-foreground font-medium flex gap-1">Username <span className="text-amber-500">*</span></Label>
                <div className="flex items-center rounded-md border border-border/50 bg-transparent h-11 overflow-hidden focus-within:ring-1 focus-within:ring-border transition-shadow">
                  <div className="px-4 text-muted-foreground/70 bg-transparent border-r border-border/50 h-full flex items-center shrink-0">
                    @
                  </div>
                  <input 
                    type="text" 
                    className="flex-1 bg-transparent border-none outline-none px-3 text-sm h-full w-full text-foreground" 
                    placeholder="username" 
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    maxLength={20}
                  />
                  <div className="px-3 shrink-0">
                    {editUsername && editUsername === profile?.username
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      : editUsername.length >= 3
                        ? <CheckCircle2 className="w-4 h-4 text-muted-foreground/30" />
                        : null
                    }
                  </div>
                </div>
                <p className="text-xs text-muted-foreground/60">3–20 characters · letters, numbers, underscores only</p>
              </div>

              {/* Country Row */}
              <div className="space-y-3 pb-6 border-b border-dashed border-border/60">
                <Label className="text-muted-foreground font-medium">Country</Label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <span className="text-lg leading-none">🇦🇺</span>
                    <span className="font-bold text-sm hidden sm:inline">Australia</span>
                    <span className="text-muted-foreground/70 text-sm hidden sm:inline">UTC/GMT +10</span>
                  </div>
                  <Input 
                    type="text" 
                    className="pl-14 sm:pl-56 bg-transparent border-border/50 focus-visible:ring-1 focus-visible:ring-border h-11 cursor-pointer" 
                    readOnly
                    defaultValue="Australia (UTC/GMT +10)"
                  />
                  <svg className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
                <p className="text-sm text-muted-foreground/70 mt-1">Estimates based on recent IP address.</p>
              </div>

            </form>
            
            {/* Inline Footer */}
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" type="button" className="border-border/50 hover:bg-muted/50 rounded-lg">Cancel</Button>
              <Button 
                type="submit" 
                form="profile-form"
                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-[#7e56db] dark:hover:bg-[#6c48c4] text-white rounded-lg px-6 font-semibold shadow-md shadow-indigo-500/20"
                disabled={isUpdatingProfile || (
                editName === (profile?.name || '') &&
                editPhone === (profile?.phoneNumber || '') &&
                editEmail === profile?.email &&
                editUsername === (profile?.username || '')
              )}
              >
                {isUpdatingProfile ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>

        {/* ACCOUNT INFO CONTENT */}
        <div className="px-6 py-8 border-t border-dashed border-border/60">
          <h3 className="text-xl font-bold mb-6">Account Information</h3>
          <div className="space-y-4 bg-muted/30 p-6 rounded-2xl border border-border">
            <div>
              <Label className="text-muted-foreground">Account ID (UUID)</Label>
              <p className="font-mono text-sm mt-1 text-foreground bg-background p-2 rounded-md border border-border/50 break-all">
                {profile?.id || 'Unknown'}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Account Status</Label>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className={profile?.isVerified ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}>
                  {profile?.isVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Joined Date</Label>
              <p className="font-medium text-foreground mt-1">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        {/* SECURITY & PASSWORD CONTENT */}
        <div className="px-6 py-8 border-t border-dashed border-border/60">
          <h3 className="text-xl font-bold mb-6">Security & Password</h3>
          <div className="flex-1 w-full">
            {pwdError && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 text-destructive text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{pwdError}</p>
              </div>
            )}
            {pwdMsg && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 text-emerald-600 dark:text-emerald-400 text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{pwdMsg}</p>
              </div>
            )}
            <form id="password-form" onSubmit={handleChangePassword} className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Current Password</Label>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
                </div>
                <Input type="password" placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
              </div>
              <Button type="submit" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20" disabled={isChangingPwd || !currentPassword || !newPassword || !confirmPassword}>
                {isChangingPwd ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </div>
        </div>

        {/* 2FA CONTENT */}
        <div className="px-6 py-8 border-t border-dashed border-border/60">
          <h3 className="text-xl font-bold mb-6">Two-Factor Authentication</h3>
          <div className="w-full">
            {profile?.mfaEnabled ? (
              <div className="flex flex-col gap-6">
                <div className="p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-emerald-600 mb-2">2FA is currently enabled</h4>
                  <p className="text-sm text-emerald-600 opacity-80">Your account is protected by an additional security layer.</p>
                </div>
                <Button variant="destructive" onClick={handleDisableMfa} disabled={mfaLoading} className="w-full sm:w-auto self-start">Disable 2FA</Button>
              </div>
            ) : mfaSetupQr ? (
              <div className="mx-auto bg-muted rounded-2xl border flex flex-col items-center gap-6 p-6">
                <div className="text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold mb-3">1</span>
                  <p className="text-sm font-medium">Scan this QR code with your Authenticator App</p>
                </div>
                <div className="p-4 bg-white rounded-2xl shadow-sm border">
                  <img src={mfaSetupQr} alt="MFA QR Code" className="w-48 h-48" />
                </div>
                <div className="text-center w-full">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold mb-3">2</span>
                  <p className="text-sm font-medium mb-4">Enter the 6-digit code below</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
                    <Input type="text" maxLength={6} placeholder="000000" value={mfaCode} onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))} className="w-full sm:w-32 text-center tracking-[0.5em] font-mono font-bold text-lg" />
                    <Button onClick={handleVerifyMfa} disabled={mfaCode.length !== 6 || mfaLoading} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 w-full sm:w-auto">Verify</Button>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setMfaSetupQr('')} className="mt-2 w-full sm:w-auto">Cancel Setup</Button>
              </div>
            ) : (
              <div className="flex flex-col p-6 bg-muted/50 rounded-2xl border gap-4 text-center items-center">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                <div>
                  <h4 className="font-bold">Authenticator App</h4>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">Use an app like Google Authenticator or Authy to generate secure codes when you sign in.</p>
                </div>
                <Button onClick={handleSetupMfa} disabled={mfaLoading} className="mt-4">Enable 2FA</Button>
              </div>
            )}
          </div>
        </div>

        {/* DEVICES CONTENT */}
        <div className="px-6 py-8 border-t border-dashed border-border/60">
          <h3 className="text-xl font-bold mb-6">Device Sessions</h3>
          <div className="w-full">
            {sessions.length > 1 && (
              <div className="flex justify-between items-center mb-4">
                {revokeAllSuccess && (
                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium animate-pulse">
                    <CheckCircle2 className="w-4 h-4" />
                    All other sessions revoked!
                  </div>
                )}
                {!revokeAllSuccess && <span />}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRevokeAllOtherSessions}
                  disabled={isRevokingAll}
                  className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  {isRevokingAll ? (
                    <span className="flex items-center gap-1.5">
                      <RefreshCcw className="w-3 h-3 animate-spin" /> Revoking...
                    </span>
                  ) : 'Revoke All Others'}
                </Button>
              </div>
            )}
            {sessions.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center border rounded-xl bg-muted/20">
                <Monitor className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground font-medium">No active sessions found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-medium">Device</th>
                      <th className="px-4 py-3 font-medium">IP Address</th>
                      <th className="px-4 py-3 font-medium hidden sm:table-cell">Last Active</th>
                      <th className="px-4 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sessions.map((session) => {
                      const isMobile = session.device.toLowerCase().includes('iphone') || session.device.toLowerCase().includes('android');
                      const isRevoking = revokingSessionId === session.id;
                      const isRevoked = revokedSessionId === session.id;
                      return (
                        <tr key={session.id} className={`transition-all duration-300 ${isRevoked ? 'bg-emerald-500/10' : 'hover:bg-muted/30'}`}>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${isRevoked ? 'bg-emerald-500/20 text-emerald-600' : session.isCurrent ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                                {isRevoked ? <CheckCircle2 className="w-4 h-4" /> : isMobile ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="font-medium flex items-center gap-2">
                                  {parseUA(session.device)}
                                  {session.isCurrent && <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] h-4 px-1.5 uppercase tracking-wider">Current</Badge>}
                                  {isRevoked && <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] h-4 px-1.5 uppercase tracking-wider">Revoked ✓</Badge>}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">
                            <div className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 opacity-70" /> {session.ipAddress || 'Unknown IP'}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-muted-foreground hidden sm:table-cell">
                            {new Date(session.lastActive).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right">
                            {!session.isCurrent && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRevokeSession(session.id)}
                                disabled={isRevoking || isRevoked}
                                className={`h-8 px-2 ${isRevoked ? 'text-emerald-600 hover:text-emerald-600 hover:bg-emerald-500/10' : 'text-destructive hover:text-destructive hover:bg-destructive/10'}`}
                              >
                                {isRevoking ? (
                                  <span className="flex items-center gap-1.5">
                                    <RefreshCcw className="w-3 h-3 animate-spin" />
                                  </span>
                                ) : isRevoked ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : 'Revoke'}
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* CONNECTED ACCOUNTS CONTENT */}
        <div className="px-6 py-8 border-t border-dashed border-border/60">
          <h3 className="text-xl font-bold mb-6">Connected Accounts</h3>
          <div className="flex flex-col gap-4 w-full">
            {/* Google */}
            <div className="flex flex-col justify-between p-6 rounded-2xl border bg-muted/30">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-border">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </div>
                {profile?.hasGoogle ? (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 font-bold gap-1.5"><CheckCircle2 className="w-3 h-3" /> Connected</Badge>
                ) : (
                  <Badge variant="secondary" className="font-bold">Not Linked</Badge>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pt-4 border-t border-border/50">
                <div>
                  <h3 className="font-bold">Google</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Sign in with Google</p>
                </div>
                {profile?.hasGoogle ? (
                  <Button variant="ghost" size="sm" onClick={() => handleUnlinkProvider('google')} className="text-destructive hover:bg-destructive/10 w-full sm:w-auto">Unlink</Button>
                ) : (
                  <Button size="sm" onClick={() => { window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google?token=${localStorage.getItem('token')}`; }} className="w-full sm:w-auto">Connect</Button>
                )}
              </div>
            </div>

            {/* GitHub */}
            <div className="flex flex-col justify-between p-6 rounded-2xl border bg-muted/30">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#24292e] text-white rounded-xl flex items-center justify-center shadow-sm">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                </div>
                {profile?.hasGithub ? (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 font-bold gap-1.5"><CheckCircle2 className="w-3 h-3" /> Connected</Badge>
                ) : (
                  <Badge variant="secondary" className="font-bold">Not Linked</Badge>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pt-4 border-t border-border/50">
                <div>
                  <h3 className="font-bold">GitHub</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Sign in with GitHub</p>
                </div>
                {profile?.hasGithub ? (
                  <Button variant="ghost" size="sm" onClick={() => handleUnlinkProvider('github')} className="text-destructive hover:bg-destructive/10 w-full sm:w-auto">Unlink</Button>
                ) : (
                  <Button size="sm" onClick={() => { window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/github?token=${localStorage.getItem('token')}`; }} className="w-full sm:w-auto">Connect</Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* NOTIFICATIONS CONTENT */}
        <div className="px-6 py-8 border-t border-dashed border-border/60">
          <h3 className="text-xl font-bold mb-6">Notifications</h3>
          <div className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-xl border border-border bg-muted/20 gap-4">
              <div className="space-y-1">
                <h4 className="font-bold">Email Security Alerts</h4>
                <p className="text-sm text-muted-foreground">Receive notifications when critical updates are made to your account.</p>
              </div>
              <button type="button" onClick={() => !isTogglingNotifications && handleToggleNotifications(!profile?.emailNotifications)} disabled={isTogglingNotifications} className={`${profile?.emailNotifications ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70`}>
                {isTogglingNotifications ? <span className="pointer-events-none inline-flex items-center justify-center h-5 w-5 rounded-full bg-white shadow-md"><RefreshCcw className="h-3 w-3 text-amber-500 animate-spin" /></span> : <span className={`${profile?.emailNotifications ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out`} />}
              </button>
            </div>
          </div>
        </div>
              </div>
            </SlideoutMenu.Content>
          </>
        )}
      </SlideoutMenu>
    </div>
  );
}
