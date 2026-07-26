"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Key, 
  Monitor, 
  Smartphone, 
  Globe, 
  LogOut, 
  CheckCircle2, 
  AlertCircle,
  User,
  Settings as SettingsIcon,
  Phone,
  Mail,
  ShieldCheck,
  Link as LinkIcon,
  ArrowRight,
  RefreshCcw,
  Camera
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Illustration } from "@/components/shared-assets/illustrations";
import { MagicBento, MagicBentoCard } from "@/components/foundations/MagicBento";

import type { Key as AriaKey } from "react-aria-components";
import { Tabs as MinimalTabs } from "@/components/application/tabs/tabs";
import { NativeSelect } from "@/components/base/select/select-native";
import { SuccessCard } from "@/components/foundations/success-card";

const settingsTabs = [
  { id: "general", label: "General Profile" },
  { id: "security", label: "Security & Password" },
  { id: "sessions", label: "Device Sessions" },
  { id: "connected", label: "Connected Accounts" },
  { id: "notifications", label: "Notifications" },
];

interface UserProfile {
  id: string;
  email: string;
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
  ipAddress: string | null;
  lastActive: string;
  createdAt: string;
  isCurrent: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedTab, setSelectedTab] = useState<AriaKey>("general");

  // Profile update state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Deletion modal state
  const [deleteEmailConfirm, setDeleteEmailConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  // MFA State
  const [mfaSetupQr, setMfaSetupQr] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [isTogglingNotifications, setIsTogglingNotifications] = useState(false);
  const [successData, setSuccessData] = useState<{ title: string; description: string; continueText?: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [profileRes, sessionsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sessions`, { headers })
        ]);

        if (profileRes.status === 401 || sessionsRes.status === 401) {
          localStorage.removeItem('token');
          router.push('/login?error=session_expired');
          return;
        }

        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfile(data);
          setEditName(data.name || '');
          setEditPhone(data.phoneNumber || '');
          setEditEmail(data.email || '');
        }
        if (sessionsRes.ok) setSessions(await sessionsRes.json());
      } catch (err) {
        console.error('Failed to fetch settings data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');
    setIsUpdatingProfile(true);

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: editName, 
          phoneNumber: editPhone, 
          email: editEmail 
        })
      });
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login?error=session_expired');
        return;
      }
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      
      setProfile(data.user);
      setProfileMsg('Profile updated successfully.');
      
      if (editEmail !== profile?.email) {
        setProfileMsg('Profile updated. Please check your new email for a verification code.');
      }
    } catch (err: any) {
      setProfileError(err.message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg('');
    setPwdError('');

    if (newPassword !== confirmPassword) {
      return setPwdError('New passwords do not match.');
    }

    const token = localStorage.getItem('token');
    try {
      setIsChangingPwd(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login?error=session_expired');
        return;
      }
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      
      setPwdMsg('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdError(err.message);
    } finally {
      setIsChangingPwd(false);
    }
  };

  const handleSetupMfa = async () => {
    try {
      setMfaLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/mfa/setup`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login?error=session_expired');
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to setup MFA');
      setMfaSetupQr(data.qrCodeUrl);
    } catch (err) {
      alert('Error setting up MFA');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleVerifyMfa = async () => {
    try {
      setMfaLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/mfa/verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ token: mfaCode })
      });
      if (!res.ok) throw new Error('Invalid code');
      
      setMfaSetupQr('');
      setMfaCode('');
      setProfile(prev => prev ? { ...prev, mfaEnabled: true } : null);
      setSuccessData({
        title: "2FA Enabled Successfully!",
        description: "Your account is now protected with two-factor authentication. You will be required to enter a code from your authenticator app whenever you log in.",
        continueText: "Back to Settings"
      });
    } catch (err) {
      alert('Invalid code, please try again.');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleDisableMfa = async () => {
    if (!confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) return;
    try {
      setMfaLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/mfa/disable`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to disable MFA');
      
      setProfile(prev => prev ? { ...prev, mfaEnabled: false } : null);
      setSuccessData({
        title: "2FA Disabled Successfully",
        description: "Two-factor authentication has been turned off for your account.",
        continueText: "Back to Settings"
      });
    } catch (err) {
      alert('Error disabling 2FA');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login?error=session_expired');
        return;
      }
      
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to revoke session');
      }
    } catch (err) {
      console.error('Failed to revoke session:', err);
      alert('An error occurred');
    }
  };

  const handleUnlinkProvider = async (provider: string) => {
    if (!confirm(`Are you sure you want to unlink your ${provider} account?`)) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/providers/${provider}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login?error=session_expired');
        return;
      }
      
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || `Failed to unlink ${provider}`);
        return;
      }
      
      setProfile(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          hasGoogle: provider === 'google' ? false : prev.hasGoogle,
          hasGithub: provider === 'github' ? false : prev.hasGithub
        };
      });
      setSuccessData({
        title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Unlinked Successfully`,
        description: `Your ${provider} account has been unlinked from your profile.`,
        continueText: "Back to Settings"
      });
    } catch (err) {
      console.error(err);
      alert(`Error unlinking ${provider}`);
    }
  };

  const handleToggleNotifications = async (checked: boolean) => {
    setIsTogglingNotifications(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        localStorage.removeItem('token');
        router.push('/login?error=session_expired');
        return;
      }
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/preferences`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ emailNotifications: checked })
      });
      
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update preferences');
        return;
      }
      
      setProfile(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          emailNotifications: checked
        };
      });
      
      setSuccessData({
        title: checked ? "Security Alerts Enabled" : "Security Alerts Disabled",
        description: checked 
          ? "You will now receive email notifications for account and security changes." 
          : "You have opted out of email notification alerts.",
        continueText: "Dismiss"
      });
    } catch (err) {
      console.error(err);
      alert('Error updating notification preferences');
    } finally {
      setIsTogglingNotifications(false);
    }
  };

  const handleToggleAccentColor = async (color: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        localStorage.removeItem('token');
        router.push('/login?error=session_expired');
        return;
      }
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/preferences`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ accentColor: color })
      });
      
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update accent color');
        return;
      }
      
      setProfile(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          accentColor: color
        };
      });
    } catch (err) {
      console.error(err);
      alert('Error updating accent color preference');
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    if (!confirm('Are you sure you want to log out of all other devices?')) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sessions`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login?error=session_expired');
        return;
      }
      
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.isCurrent));
        setSuccessData({
          title: "Other Devices Revoked",
          description: "All other active device sessions have been successfully terminated.",
          continueText: "Dismiss"
        });
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to revoke other sessions');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteEmailConfirm !== profile?.email) {
      alert('Email confirmation does not match your account email.');
      return;
    }

    try {
      setIsDeletingAccount(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        localStorage.removeItem('token');
        setShowDeleteModal(false);
        setSuccessData({
          title: "Account Deleted",
          description: "Your account and all associated data have been permanently removed.",
          continueText: "Go to Sign Up"
        });
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete account');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting account');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleResendVerification = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessData({
          title: "Verification Email Sent",
          description: "A fresh verification code has been dispatched to your inbox. Please check your spam folder if it doesn't arrive shortly.",
          continueText: "Dismiss"
        });
      } else {
        alert(data.error || 'Failed to resend verification email');
      }
    } catch (err) {
      console.error(err);
      alert('Error sending verification code');
    }
  };

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading settings...</p>
      </div>
    );
  }

  if (successData) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <SuccessCard
          title={successData.title}
          description={successData.description}
          continueText={successData.continueText}
          onContinue={() => setSuccessData(null)}
        />
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto w-full relative min-h-[90vh] animate-fade-in-up">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Header Section */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Account Settings
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Manage your personal information, security preferences, and active devices.
        </p>
      </div>

      <Tabs value={selectedTab as string} onValueChange={(val) => setSelectedTab(val)} className="w-full">
        <div className="mb-8">
          <NativeSelect
            size="sm"
            aria-label="Tabs"
            value={selectedTab as string}
            onChange={(event) => setSelectedTab(event.target.value)}
            options={settingsTabs.map((tab) => ({ label: tab.label, value: tab.id }))}
            className="w-full md:hidden"
          />
          <MinimalTabs selectedKey={selectedTab} onSelectionChange={setSelectedTab} className="w-max max-md:hidden">
            <MinimalTabs.List type="button-minimal" items={settingsTabs}>
              {(tab) => <MinimalTabs.Item {...tab} />}
            </MinimalTabs.List>
          </MinimalTabs>
        </div>

        {/* GENERAL TAB */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <MagicBento enableSpotlight={true} spotlightRadius={300} glowColor="59, 130, 246" className="w-full gap-6 grid-cols-1 md:grid-cols-3">
            {/* Top Stat Row */}
            <MagicBentoCard className="col-span-1 p-6 flex flex-col justify-center h-40" enableStars={true} particleCount={4} glowColor="59, 130, 246">
              <div className="flex flex-col justify-center h-full z-10 relative">
                <div className="flex items-center justify-between mb-4">
                  <Illustration type="box" size="sm" variant="default" />
                </div>
                <span className="text-sm font-medium text-muted-foreground mb-1 block">Account ID</span>
                <span className="font-mono text-sm truncate block">{profile?.id || 'N/A'}</span>
              </div>
            </MagicBentoCard>
            <MagicBentoCard className="col-span-1 p-6 flex flex-col justify-center h-40" enableTilt={true} glowColor="16, 185, 129">
              <div className="flex flex-col justify-center h-full z-10 relative">
                <div className="flex items-center justify-between mb-4">
                  <Illustration type="shield" size="sm" variant={profile?.isVerified ? 'success' : 'warning'} />
                </div>
                <span className="text-sm font-medium text-muted-foreground mb-1 block">Verification Status</span>
                <div className={`flex items-center gap-2 font-bold ${profile?.isVerified ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {profile?.isVerified ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  {profile?.isVerified ? 'Verified Account' : 'Unverified Account'}
                </div>
              </div>
            </MagicBentoCard>
            <MagicBentoCard className="col-span-1 p-6 flex flex-col justify-center h-40" enableBorderGlow={true} glowColor="139, 92, 246">
              <div className="flex flex-col justify-center h-full z-10 relative">
                <div className="flex items-center justify-between mb-4">
                  <Illustration type="users" size="sm" variant="primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground mb-1 block">Member Since</span>
                <span className="font-bold block">
                  {profile ? new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </span>
              </div>
            </MagicBentoCard>

            {/* Profile Form Card */}
            <MagicBentoCard className="col-span-1 md:col-span-2 lg:col-span-4 p-0 overflow-visible" enableBorderGlow={true} glowColor="59, 130, 246">
              <div className="p-6 md:p-8 border-b border-border">
                <h3 className="text-xl font-bold">Personal Information</h3>
                <p className="text-sm text-muted-foreground mt-1">Update your photo and personal details here.</p>
              </div>
              <div className="p-6 md:p-8 z-10 relative">
              <div className="flex flex-col md:flex-row gap-10">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4 shrink-0">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-blue-500/20 relative group">
                    {profile?.email ? profile.email.charAt(0).toUpperCase() : 'U'}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <Button variant="link" className="font-semibold text-blue-600 dark:text-blue-400">Change Picture</Button>
                </div>

                {/* Form Section */}
                <div className="flex-1 w-full max-w-2xl">
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

                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="text"
                            className="pl-11"
                            placeholder="John Doe"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="tel"
                            className="pl-11"
                            placeholder="+1 (555) 000-0000"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          className="pl-11"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground pl-1">
                        If you change your email, you will need to re-verify your account.
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t flex flex-col sm:flex-row sm:justify-end">
                      <Button 
                        type="submit" 
                        disabled={isUpdatingProfile || (editName === (profile?.name || '') && editPhone === (profile?.phoneNumber || '') && editEmail === profile?.email)}
                        className="px-8 w-full sm:w-auto"
                      >
                        {isUpdatingProfile ? (
                          <><RefreshCcw className="w-4 h-4 animate-spin mr-2" /> Saving...</>
                        ) : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            </MagicBentoCard>
          </MagicBento>
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <MagicBento enableSpotlight={true} spotlightRadius={300} glowColor="16, 185, 129" className="w-full gap-6">
          {/* Password Card */}
          <MagicBentoCard className="col-span-1 md:col-span-2 lg:col-span-4 p-0 overflow-visible" enableBorderGlow={true} glowColor="147, 51, 234">
            <div className="p-6 md:p-8 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-500/20 rounded-xl text-purple-600 dark:text-purple-400">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Change Password</h3>
                  <p className="text-sm text-muted-foreground mt-1">Ensure your account is using a long, random password to stay secure.</p>
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8 z-10 relative">
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
              
              <form onSubmit={handleChangePassword} className="space-y-5 max-w-xl">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                 <div className="pt-4 flex flex-col sm:flex-row">
                  <Button 
                    type="submit" 
                    variant="default"
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20 w-full sm:w-auto"
                    disabled={isChangingPwd || !currentPassword || !newPassword || !confirmPassword}
                  >
                    {isChangingPwd ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </div>
          </MagicBentoCard>

          {/* MFA Section */}
          <MagicBentoCard className="col-span-1 md:col-span-2 lg:col-span-4 p-0 overflow-visible" enableBorderGlow={true} glowColor="59, 130, 246">
            <div className="p-6 md:p-8 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Two-Factor Authentication (2FA)</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add an extra layer of security to your account using Google Authenticator or Authy.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8 z-10 relative">
              {profile?.mfaEnabled ? (
                <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 gap-4">
                  <div>
                    <h4 className="text-lg font-bold text-emerald-600 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> 2FA is currently enabled
                    </h4>
                    <p className="text-sm text-emerald-600 mt-1 opacity-80">Your account is protected by an additional security layer.</p>
                  </div>
                  <Button 
                    variant="destructive"
                    onClick={handleDisableMfa}
                    disabled={mfaLoading}
                  >
                    Disable 2FA
                  </Button>
                </div>
              ) : mfaSetupQr ? (
                <div className="max-w-md mx-auto p-8 bg-muted rounded-2xl border flex flex-col items-center gap-6">
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
                    
                    <div className="flex gap-3 justify-center w-full">
                      <Input
                        type="text"
                        maxLength={6}
                        placeholder="000000"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                        className="w-32 text-center tracking-[0.5em] font-mono font-bold text-lg"
                      />
                      <Button 
                        onClick={handleVerifyMfa}
                        disabled={mfaCode.length !== 6 || mfaLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                      >
                        Verify
                      </Button>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => setMfaSetupQr('')} className="mt-2">
                    Cancel Setup
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-muted/50 rounded-2xl border gap-4">
                  <div>
                    <h4 className="font-bold">Authenticator App</h4>
                    <p className="text-sm text-muted-foreground mt-1">Use an app like Google Authenticator or Authy to generate secure codes.</p>
                  </div>
                  <Button 
                    onClick={handleSetupMfa}
                    disabled={mfaLoading}
                  >
                    Enable 2FA
                  </Button>
                </div>
              )}
            </div>
          </MagicBentoCard>
          </MagicBento>
        </TabsContent>

        {/* SESSIONS TAB */}
        <TabsContent value="sessions" className="space-y-6 mt-6">
          <MagicBento enableSpotlight={true} spotlightRadius={300} glowColor="16, 185, 129" className="w-full gap-6">
          <MagicBentoCard className="col-span-1 md:col-span-2 lg:col-span-4 p-0 overflow-visible" enableBorderGlow={true} glowColor="16, 185, 129">
            <div className="p-6 md:p-8 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <Monitor className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Active Device Sessions</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Review all devices currently logged into your account. Revoke access if you don't recognize them.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-0 z-10 relative">
              {sessions.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <Monitor className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                  <p className="text-muted-foreground font-medium">No active sessions found.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {sessions.map((session) => {
                    const isMobile = session.device.toLowerCase().includes('iphone') || session.device.toLowerCase().includes('android');
                    
                    return (
                      <div key={session.id} className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-muted/50 transition-colors group">
                        <div className="flex items-start gap-5">
                          <div className={`p-4 rounded-2xl ${session.isCurrent ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                            {isMobile ? <Smartphone className="w-7 h-7" /> : <Monitor className="w-7 h-7" />}
                          </div>
                          <div className="pt-1">
                            <h4 className="text-lg font-bold flex items-center gap-3">
                              {parseUA(session.device)}
                              {session.isCurrent && (
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold uppercase tracking-wider text-[10px]">
                                  Current Device
                                </Badge>
                              )}
                            </h4>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm font-medium text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <Globe className="w-4 h-4 opacity-70" /> {session.ipAddress || 'Unknown IP'}
                              </span>
                              <span className="w-1.5 h-1.5 rounded-full bg-border hidden sm:block"></span>
                              <span>Last active: {new Date(session.lastActive).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                        {!session.isCurrent && (
                          <Button 
                            variant="destructive"
                            onClick={() => handleRevokeSession(session.id)}
                            className="self-start sm:self-center flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                          >
                            <LogOut className="w-4 h-4" />
                            Revoke Access
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </MagicBentoCard>
          </MagicBento>
        </TabsContent>

        {/* CONNECTED ACCOUNTS TAB */}
        <TabsContent value="connected" className="space-y-6 mt-6">
          <MagicBento enableSpotlight={true} spotlightRadius={300} glowColor="16, 185, 129" className="w-full gap-6">
          <MagicBentoCard className="col-span-1 md:col-span-2 lg:col-span-4 p-0 overflow-visible" enableBorderGlow={true} glowColor="236, 72, 153">
            <div className="p-6 md:p-8 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-pink-100 dark:bg-pink-500/20 rounded-xl text-pink-600 dark:text-pink-400">
                  <LinkIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Connected Accounts</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Link your social accounts for seamless, password-less logins across all your devices.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 z-10 relative">
              {/* Google Card */}
              <div className="flex flex-col justify-between p-6 rounded-2xl border-2 border-border bg-muted/30 hover:border-border/80 transition-colors min-h-[12rem] h-auto">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-border">
                    <svg className="w-7 h-7" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  </div>
                  {profile?.hasGoogle ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="font-bold">Not Linked</Badge>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-4">
                  <div>
                    <h3 className="font-bold">Google</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">Sign in with Google</p>
                  </div>
                  {profile?.hasGoogle ? (
                    <Button variant="ghost" size="sm" onClick={() => handleUnlinkProvider('google')} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                      Unlink
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => {
                      const token = localStorage.getItem('token');
                      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google?token=${token}`;
                    }}>
                      Connect
                    </Button>
                  )}
                </div>
              </div>

              {/* GitHub Card */}
              <div className="flex flex-col justify-between p-6 rounded-2xl border-2 border-border bg-muted/30 hover:border-border/80 transition-colors min-h-[12rem] h-auto">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 bg-[#24292e] text-white rounded-2xl flex items-center justify-center shadow-sm">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                  </div>
                  {profile?.hasGithub ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="font-bold">Not Linked</Badge>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-4">
                  <div>
                    <h3 className="font-bold">GitHub</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">Sign in with GitHub</p>
                  </div>
                  {profile?.hasGithub ? (
                    <Button variant="ghost" size="sm" onClick={() => handleUnlinkProvider('github')} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                      Unlink
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => {
                      const token = localStorage.getItem('token');
                      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/github?token=${token}`;
                    }}>
                      Connect
                    </Button>
                  )}
                </div>
              </div>

            </div>
          </MagicBentoCard>
          </MagicBento>
        </TabsContent>

        {/* NOTIFICATIONS TAB */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <MagicBento enableSpotlight={true} spotlightRadius={300} glowColor="245, 158, 11" className="w-full gap-6">
            <MagicBentoCard className="col-span-1 md:col-span-2 lg:col-span-4 p-0 overflow-visible" enableBorderGlow={true} glowColor="245, 158, 11">
              <div className="p-6 md:p-8 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Email Notifications</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configure when you want to receive security alerts and updates in your inbox.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 md:p-8 space-y-6 z-10 relative">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
                  <div className="space-y-1">
                    <h4 className="font-bold">Email Security Alerts</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when critical updates are made to your account (e.g. password changes).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => !isTogglingNotifications && handleToggleNotifications(!profile?.emailNotifications)}
                    disabled={isTogglingNotifications}
                    className={`${
                      profile?.emailNotifications
                        ? 'bg-amber-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    } relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70`}
                  >
                    {isTogglingNotifications ? (
                      <span className="pointer-events-none inline-flex items-center justify-center h-5 w-5 rounded-full bg-white dark:bg-gray-100 shadow-md">
                        <svg className="animate-spin h-3 w-3 text-amber-500" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      </span>
                    ) : (
                      <span
                        className={`${
                          profile?.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-100 shadow-md ring-0 transition duration-200 ease-in-out`}
                      />
                    )}
                  </button>
                </div>
              </div>
            </MagicBentoCard>
          </MagicBento>
        </TabsContent>
      </Tabs>
    </div>
  );
}
