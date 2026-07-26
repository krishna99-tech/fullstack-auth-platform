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
  Link as LinkIcon
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'sessions' | 'connected'>('general');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);

  // Profile update state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

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
      alert('2FA Enabled Successfully!');
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
      alert('2FA Disabled');
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
      alert(`${provider} unlinked successfully`);
    } catch (err) {
      console.error(err);
      alert(`Error unlinking ${provider}`);
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
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto w-full relative">
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          Account Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
          Manage your profile, security preferences, and active device sessions.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'general'
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <User className="w-5 h-5" />
              General Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'security'
                  ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Key className="w-5 h-5" />
              Security & Password
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'sessions'
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Monitor className="w-5 h-5" />
              Device Sessions
            </button>
            <button
              onClick={() => setActiveTab('connected')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'connected'
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <LinkIcon className="w-5 h-5" />
              Connected Accounts
            </button>
          </nav>
        </div>

        {/* Right Content Area */}
        <div className="flex-1">
          
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-surface-border">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5 text-blue-500" />
                    Profile Details
                  </h2>
                </div>
                <div className="p-6">
                  {profileError && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-start gap-3 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p>{profileError}</p>
                    </div>
                  )}
                  {profileMsg && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg flex items-start gap-3 text-green-600 dark:text-green-400 text-sm">
                      <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                      <p>{profileMsg}</p>
                    </div>
                  )}

                  <form onSubmit={handleUpdateProfile} className="space-y-5 max-w-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            className="input-field pl-10"
                            placeholder="John Doe"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            className="input-field pl-10"
                            placeholder="+1 (555) 000-0000"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          className="input-field pl-10"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          required
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        If you change your email, you will need to re-verify your account.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-surface-border">
                      <button 
                        type="submit" 
                        className="btn-primary py-2.5 px-6 rounded-lg text-sm font-medium disabled:opacity-50"
                        disabled={isUpdatingProfile || (editName === (profile?.name || '') && editPhone === (profile?.phoneNumber || '') && editEmail === profile?.email)}
                      >
                        {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Read Only Status Card */}
              <div className="glass-card overflow-hidden p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Account ID</label>
                  <div className="text-gray-900 dark:text-white font-mono text-sm truncate bg-black/5 dark:bg-white/5 p-1.5 rounded">
                    {profile?.id || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Verification Status</label>
                  <div className={`flex items-center gap-2 font-medium ${profile?.isVerified ? 'text-green-500' : 'text-orange-500'}`}>
                    {profile?.isVerified ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {profile?.isVerified ? 'Verified' : 'Unverified'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Member Since</label>
                  <div className="text-gray-900 dark:text-white font-medium">
                    {profile ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-surface-border">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Key className="w-5 h-5 text-purple-500" />
                    Change Password
                  </h2>
                </div>
                <div className="p-6">
                  {pwdError && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-start gap-3 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p>{pwdError}</p>
                    </div>
                  )}
                  {pwdMsg && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg flex items-start gap-3 text-green-600 dark:text-green-400 text-sm">
                      <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                      <p>{pwdMsg}</p>
                    </div>
                  )}
                  
                  <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                      <input
                        type="password"
                        className="input-field"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                      <input
                        type="password"
                        className="input-field"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        className="input-field"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="btn-primary py-2.5 px-6 rounded-lg text-sm font-medium disabled:opacity-50"
                      disabled={isChangingPwd}
                    >
                      {isChangingPwd ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              </div>

              {/* MFA Section */}
              <div className="glass-card overflow-hidden mt-6">
                <div className="p-6 border-b border-surface-border">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-purple-500" />
                    Two-Factor Authentication (2FA)
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Add an extra layer of security to your account using Google Authenticator.
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  {profile?.mfaEnabled ? (
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/20">
                      <div>
                        <h4 className="font-medium text-green-800 dark:text-green-400">2FA is currently enabled</h4>
                        <p className="text-sm text-green-600 dark:text-green-500 mt-1">Your account is highly secure.</p>
                      </div>
                      <button 
                        onClick={handleDisableMfa}
                        disabled={mfaLoading}
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-500/10 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Disable 2FA
                      </button>
                    </div>
                  ) : mfaSetupQr ? (
                    <div className="flex flex-col items-center space-y-4 p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-surface-border">
                      <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                        1. Scan this QR code with Google Authenticator or Authy
                      </p>
                      <img src={mfaSetupQr} alt="MFA QR Code" className="w-40 h-40 rounded bg-white p-2 shadow-sm" />
                      <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                        2. Enter the 6-digit code below
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="000000"
                          value={mfaCode}
                          onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                          className="input-field text-center tracking-widest font-mono w-32"
                        />
                        <button 
                          onClick={handleVerifyMfa}
                          disabled={mfaCode.length !== 6 || mfaLoading}
                          className="btn-primary"
                        >
                          Verify
                        </button>
                      </div>
                      <button onClick={() => setMfaSetupQr('')} className="text-xs text-gray-500 hover:underline">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-surface-border">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Authenticator App</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Use an app like Google Authenticator or Authy to generate secure codes.</p>
                      </div>
                      <button 
                        onClick={handleSetupMfa}
                        disabled={mfaLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Enable 2FA
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SESSIONS TAB */}
          {activeTab === 'sessions' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-surface-border">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-indigo-500" />
                    Active Device Sessions
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    If you see a device you don't recognize, revoke it immediately to sign it out.
                  </p>
                </div>
                <div className="divide-y divide-surface-border">
                  {sessions.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No active sessions found.</div>
                  ) : (
                    sessions.map((session) => {
                      const isMobile = session.device.toLowerCase().includes('iphone') || session.device.toLowerCase().includes('android');
                      
                      return (
                        <div key={session.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${session.isCurrent ? 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-500' : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400'}`}>
                              {isMobile ? <Smartphone className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
                            </div>
                            <div>
                              <h4 className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                                {parseUA(session.device)}
                                {session.isCurrent && (
                                  <span className="text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 px-2 py-0.5 rounded-full">
                                    This Device
                                  </span>
                                )}
                              </h4>
                              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Globe className="w-3 h-3" /> {session.ipAddress || 'Unknown IP'}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                                <span>Last active: {new Date(session.lastActive).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                          {!session.isCurrent && (
                            <button 
                              onClick={() => handleRevokeSession(session.id)}
                              className="self-start sm:self-center flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              Revoke
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CONNECTED ACCOUNTS TAB */}
          {activeTab === 'connected' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-surface-border">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-emerald-500" />
                    Connected Accounts
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Connect social accounts to easily log in without a password.
                  </p>
                </div>
                
                <div className="p-6 space-y-4">
                  {/* Google */}
                  <div className="flex items-center justify-between p-4 border border-surface-border rounded-xl bg-black/5 dark:bg-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Google</h4>
                        <p className="text-sm text-gray-500">{profile?.hasGoogle ? 'Connected' : 'Not connected'}</p>
                      </div>
                    </div>
                    {profile?.hasGoogle ? (
                      <button 
                        onClick={() => handleUnlinkProvider('google')}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 transition-colors shadow-sm"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <a 
                        href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google?state=${localStorage.getItem('token')}`}
                        className="px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                      >
                        Connect
                      </a>
                    )}
                  </div>

                  {/* GitHub */}
                  <div className="flex items-center justify-between p-4 border border-surface-border rounded-xl bg-black/5 dark:bg-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <svg className="w-5 h-5 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">GitHub</h4>
                        <p className="text-sm text-gray-500">{profile?.hasGithub ? 'Connected' : 'Not connected'}</p>
                      </div>
                    </div>
                    {profile?.hasGithub ? (
                      <button 
                        onClick={() => handleUnlinkProvider('github')}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 transition-colors shadow-sm"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <a 
                        href={`${process.env.NEXT_PUBLIC_API_URL}/auth/github?state=${localStorage.getItem('token')}`}
                        className="px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                      >
                        Connect
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
