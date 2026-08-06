"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { tokens } from '@/lib/token-store';
import {
  setupMfa,
  verifyMfa,
  disableMfa,
  listSessions,
  revokeSession,
  revokeOtherSessions,
  socialAuthUrl,
  getSocialStatus,
  getProfile,
  updateProfile,
  updatePreferences,
  changePassword,
  resendVerification,
  disconnectProvider,
  deleteAccount,
  type UserProfile,
} from '@/lib/auth-backend-client';
import { RefreshCcw, Monitor, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";

interface UserProfileState extends UserProfile {
  phoneNumber: string | null;
}

interface Session {
  id: string;
  device: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

interface SettingCardProps {
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
  footerText?: React.ReactNode;
  onSave?: () => void;
  isSaving?: boolean;
  messageKey?: string;
  messages?: Record<string, { type: 'error' | 'success'; text: string }>;
  deleteConfirm?: string;
  profileEmail?: string;
  isDestructive?: boolean;
}

const SettingCard = ({ 
  title, 
  description, 
  children, 
  footerText, 
  onSave, 
  isSaving, 
  messageKey,
  messages,
  deleteConfirm,
  profileEmail,
  isDestructive = false
}: SettingCardProps) => {
  const msg = messageKey && messages ? messages[messageKey] : null;
  return (
    <div className={cn("border bg-white dark:bg-[#000] rounded-xl shadow-sm overflow-hidden", isDestructive ? "border-red-500/30" : "border-zinc-200 dark:border-[#333]")}>
      <div className="p-6">
        <h3 className="text-[16px] font-semibold text-black dark:text-white">{title}</h3>
        <p className="text-[14px] text-[#666] mt-1 mb-6">{description}</p>
        {children}
      </div>
      <div className={cn("flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-3 border-t", 
        isDestructive ? "bg-red-50/50 dark:bg-red-950/10 border-red-500/20" : "bg-zinc-50/50 dark:bg-[#0a0a0a] border-zinc-200 dark:border-[#333]"
      )}>
        <div className="text-[13px] font-medium">
          {msg ? (
            <span className={msg.type === 'error' ? 'text-rose-600 dark:text-rose-500' : 'text-emerald-600 dark:text-emerald-500'}>
              {msg.text}
            </span>
          ) : (
            <span className={isDestructive ? "text-red-600 dark:text-red-500" : "text-[#888]"}>{footerText}</span>
          )}
        </div>
        {onSave && (
          <button 
            onClick={onSave} 
            disabled={isSaving || (isDestructive && deleteConfirm !== profileEmail)} 
            className={cn("mt-4 sm:mt-0 px-4 py-2 text-[13px] font-medium rounded-md transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[80px]", 
              isDestructive 
                ? "bg-red-600 hover:bg-red-700 text-white" 
                : "bg-black dark:bg-white text-white dark:text-black hover:bg-[#333] dark:hover:bg-[#e0e0e0]"
            )}
          >
            {isSaving ? <RefreshCcw className="w-3.5 h-3.5 mr-2 animate-spin" /> : null}
            Save
          </button>
        )}
      </div>
    </div>
  );
};

export default function SettingsPage() {
  const router = useRouter();
  const { getAccessToken } = useAuth();
  useAuthGuard();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfileState | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsPage, setSessionsPage] = useState(1);
  const sessionsLimit = 3;
  const sessionsTotalPages = Math.max(1, Math.ceil(sessions.length / sessionsLimit));

  const [activeTab, setActiveTab] = useState('profile');

  // Individual Form States
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editTheme, setEditTheme] = useState('default');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editSocials, setEditSocials] = useState({ github: '', twitter: '', linkedin: '' });
  const [customLinks, setCustomLinks] = useState<{title: string, url: string}[]>([]);

  // Loading States
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  
  const [isUpdatingBio, setIsUpdatingBio] = useState(false);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [isUpdatingTheme, setIsUpdatingTheme] = useState(false);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [isUpdatingSocials, setIsUpdatingSocials] = useState(false);
  const [isUpdatingCustomLinks, setIsUpdatingCustomLinks] = useState(false);
  
  const [isResending, setIsResending] = useState(false);
  
  // Messaging state (field specific)
  const [messages, setMessages] = useState<Record<string, { type: 'error' | 'success', text: string }>>({});

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  // Security & Privacy Toggles
  const [isTogglingMfa, setIsTogglingMfa] = useState(false);
  const [isTogglingNotifications, setIsTogglingNotifications] = useState(false);
  const [isTogglingProfilePublic, setIsTogglingProfilePublic] = useState(false);
  
  // MFA Setup State
  const [mfaSetupData, setMfaSetupData] = useState<{qrCodeUrl: string, secret: string} | null>(null);
  const [mfaVerifyCode, setMfaVerifyCode] = useState('');
  const [isVerifyingMfa, setIsVerifyingMfa] = useState(false);
  const [mfaDisableCode, setMfaDisableCode] = useState('');
  const [mfaDisablePassword, setMfaDisablePassword] = useState('');
  const [showMfaDisable, setShowMfaDisable] = useState(false);
  const [socialProviders, setSocialProviders] = useState({ google: false, github: false });
  const [disconnectingProvider, setDisconnectingProvider] = useState<string | null>(null);

  // Sessions
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [isRevokingAll, setIsRevokingAll] = useState(false);

  // Danger Zone
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const showMessage = useCallback((field: string, type: 'error' | 'success', text: string) => {
    setMessages(prev => ({ ...prev, [field]: { type, text } }));
    setTimeout(() => {
      setMessages(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }, 4000);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const linked = params.get('linked');
    if (linked === 'google' || linked === 'github') {
      setTimeout(() => showMessage('social', 'success', `${linked === 'google' ? 'Google' : 'GitHub'} account linked successfully.`), 0);
      router.replace(window.location.pathname, { scroll: false });
    }
  }, [showMessage, router]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const accessToken = getAccessToken();
        if (!accessToken) return;

        const [userProfile, sessionData] = await Promise.all([
          getProfile(accessToken).catch(() => null),
          listSessions(accessToken).catch(() => ({ sessions: [] })),
        ]);

        if (!userProfile) {
          router.push('/login?error=session_expired');
          return;
        }

        setProfile({ ...userProfile, phoneNumber: userProfile.phoneNumber ?? null });
        setEditName(userProfile.name || '');
        setEditUsername(userProfile.username || '');
        setEditEmail(userProfile.email || '');
        setEditBio(userProfile.bio || '');
        setEditLocation(userProfile.location || '');
        setEditWebsite(userProfile.website || '');
        setEditTheme(userProfile.theme || 'default');
        setEditAvatarUrl(userProfile.avatarUrl || '');
        setEditSocials({
          github: userProfile.socialLinks?.github || '',
          twitter: userProfile.socialLinks?.twitter || '',
          linkedin: userProfile.socialLinks?.linkedin || '',
        });
        setCustomLinks(userProfile.customLinks || []);
        setSessions(sessionData.sessions);

        getSocialStatus().then(setSocialProviders).catch(() => {});
      } catch (err) {
        console.error('Failed to load settings data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, getAccessToken]);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await resendVerification(getAccessToken() || undefined);
      showMessage('email', 'success', 'Verification email sent! Check your inbox.');
    } catch {
      showMessage('email', 'error', 'Failed to send verification email.');
    } finally {
      setIsResending(false);
    }
  };

  const handleUpdateField = async (field: string, value: unknown, setLoadingState: (state: boolean) => void) => {
    setLoadingState(true);
    try {
      const data = await updateProfile({ [field]: value } as Parameters<typeof updateProfile>[0]);
      setProfile((prev) => (prev ? { ...prev, ...(data.user || {}) } : data.user));
      showMessage(field, 'success', 'Successfully updated.');
    } catch (err: unknown) {
      showMessage(field, 'error', err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoadingState(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return showMessage('password', 'error', 'New passwords do not match');
    }
    setIsChangingPwd(true);
    try {
      await changePassword(currentPassword, newPassword, getAccessToken() || undefined);
      showMessage('password', 'success', 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      showMessage('password', 'error', err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsChangingPwd(false);
    }
  };

  const handleToggleMfa = async (enable: boolean) => {
    const token = getAccessToken();
    if (!token) return;

    if (enable) {
      setIsTogglingMfa(true);
      try {
        const data = await setupMfa(token);
        setMfaSetupData({ qrCodeUrl: data.qrCodeUrl, secret: data.secret });
      } catch (err: unknown) {
        showMessage('mfa', 'error', err instanceof Error ? err.message : 'Failed to initiate MFA setup');
      } finally {
        setIsTogglingMfa(false);
      }
    } else {
      setShowMfaDisable(true);
    }
  };

  const handleConfirmDisableMfa = async () => {
    const token = getAccessToken();
    if (!token) return;
    setIsTogglingMfa(true);
    try {
      await disableMfa(token, mfaDisableCode);
      setProfile((prev) => (prev ? { ...prev, mfaEnabled: false } : null));
      setShowMfaDisable(false);
      setMfaDisableCode('');
      setMfaDisablePassword('');
      showMessage('mfa', 'success', 'Two-factor authentication disabled.');
    } catch (err: unknown) {
      showMessage('mfa', 'error', err instanceof Error ? err.message : 'Failed to disable MFA');
    } finally {
      setIsTogglingMfa(false);
    }
  };

  const handleVerifyMfa = async () => {
    const token = getAccessToken();
    if (!token) return;
    setIsVerifyingMfa(true);
    try {
      await verifyMfa(token, mfaVerifyCode);
      setProfile((prev) => (prev ? { ...prev, mfaEnabled: true } : null));
      setMfaSetupData(null);
      setMfaVerifyCode('');
      showMessage('mfa', 'success', 'Two-factor authentication enabled successfully.');
    } catch (err: unknown) {
      showMessage('mfa', 'error', err instanceof Error ? err.message : 'Failed to verify MFA');
    } finally {
      setIsVerifyingMfa(false);
    }
  };

  const handleToggleNotifications = async (enable: boolean) => {
    setIsTogglingNotifications(true);
    try {
      await updatePreferences({ emailNotifications: enable }, getAccessToken() || undefined);
      setProfile((prev) => (prev ? { ...prev, emailNotifications: enable } : null));
      showMessage('notifications', 'success', 'Preferences updated.');
    } catch (err: unknown) {
      showMessage('notifications', 'error', err instanceof Error ? err.message : 'Failed to update preferences');
    } finally {
      setIsTogglingNotifications(false);
    }
  };

  const handleToggleProfilePublic = async (enable: boolean) => {
    setIsTogglingProfilePublic(true);
    try {
      await updatePreferences({ isProfilePublic: enable }, getAccessToken() || undefined);
      setProfile((prev) => (prev ? { ...prev, isProfilePublic: enable } : null));
      showMessage('profilePublic', 'success', 'Profile visibility updated.');
    } catch (err: unknown) {
      showMessage('profilePublic', 'error', err instanceof Error ? err.message : 'Failed to update visibility');
    } finally {
      setIsTogglingProfilePublic(false);
    }
  };

  const handleDisconnectProvider = async (provider: 'google' | 'github') => {
    setDisconnectingProvider(provider);
    try {
      await disconnectProvider(provider, getAccessToken() || undefined);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              googleConnected: provider === 'google' ? false : prev.googleConnected,
              githubConnected: provider === 'github' ? false : prev.githubConnected,
            }
          : null
      );
      showMessage('social', 'success', `${provider === 'google' ? 'Google' : 'GitHub'} disconnected.`);
    } catch (err: unknown) {
      showMessage('social', 'error', err instanceof Error ? err.message : 'Failed to disconnect account');
    } finally {
      setDisconnectingProvider(null);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSessionId(sessionId);
    try {
      const token = getAccessToken();
      if (!token) return;
      await revokeSession(token, sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      console.error(err);
    } finally {
      setRevokingSessionId(null);
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    setIsRevokingAll(true);
    try {
      const token = getAccessToken();
      if (!token) return;
      await revokeOtherSessions(token);
      setSessions((prev) => prev.filter((s) => s.isCurrent));
    } catch (err) {
      console.error(err);
    } finally {
      setIsRevokingAll(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== profile?.email) {
      return showMessage('delete', 'error', 'Email does not match');
    }
    setIsDeleting(true);
    try {
      await deleteAccount(getAccessToken() || undefined);
      tokens.clear();
      router.push('/login?deleted=true');
    } catch (err: unknown) {
      showMessage('delete', 'error', err instanceof Error ? err.message : 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  const parseUA = (uaString: string) => {
    if (!uaString) return 'Unknown Device';
    if (uaString.includes('Windows')) return 'Windows PC';
    if (uaString.includes('Macintosh')) return 'Mac';
    if (uaString.includes('iPhone')) return 'iPhone';
    if (uaString.includes('iPad')) return 'iPad';
    if (uaString.includes('Android')) return 'Android Device';
    return uaString.split(' ')[0] || 'Unknown Device';
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-200 dark:border-[#333] border-t-black dark:border-t-white rounded-full animate-spin mb-4" />
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'security', label: 'Security' },
    { id: 'sessions', label: 'Sessions' },
    { id: 'danger', label: 'Danger Zone' },
  ];

  return (
    <div className="flex flex-col w-full pb-16">
      
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-[#333] pb-6 mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-white">Settings</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-12 w-full items-start">
        {/* Vertical Tabs */}
        <nav className="w-full md:w-48 flex flex-col gap-1 shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "text-left px-3 py-2 text-[14px] rounded-md transition-colors font-medium",
                activeTab === tab.id 
                  ? "bg-zinc-100 dark:bg-[#111] text-black dark:text-white" 
                  : "text-[#666] hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-[#111]/50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <div className="flex-1 w-full max-w-[640px] space-y-8">
          
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              <SettingCard
                messages={messages}
                deleteConfirm={deleteConfirm}
                profileEmail={profile?.email}
                title="Avatar & User ID"
                description="Set a profile image URL or use the generated initial."
                footerText="Paste a direct image URL (https://...)."
                onSave={() => handleUpdateField('avatarUrl', editAvatarUrl, setIsUpdatingAvatar)}
                isSaving={isUpdatingAvatar}
                messageKey="avatarUrl"
              >
                <div className="flex items-center gap-6">
                  {editAvatarUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={editAvatarUrl}
                      alt="Avatar"
                      className="h-16 w-16 rounded-full object-cover border border-zinc-300 dark:border-zinc-600 shadow-sm"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-zinc-200 to-zinc-50 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center text-black dark:text-white text-xl font-bold border border-zinc-300 dark:border-zinc-600 shadow-sm">
                      {profile?.name ? profile.name.charAt(0).toUpperCase() : profile?.email.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col gap-3 flex-1 max-w-[360px]">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[12px] font-medium text-[#888] uppercase tracking-wider">User ID</span>
                      <span className="font-mono text-[13px] bg-zinc-100 dark:bg-[#111] py-1 px-2.5 rounded-md text-black dark:text-white border border-zinc-200 dark:border-[#333]">{profile?.id || 'Unknown'}</span>
                    </div>
                    <input
                      type="url"
                      className="w-full px-3 py-2 bg-white dark:bg-[#000] border border-zinc-300 dark:border-[#333] rounded-md text-[14px] text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all shadow-sm"
                      value={editAvatarUrl}
                      onChange={(e) => setEditAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>
              </SettingCard>

              <SettingCard
                messages={messages}
                deleteConfirm={deleteConfirm}
                profileEmail={profile?.email}
                title="Display Name"
                description="Please enter your full name, or a display name you are comfortable with."
                footerText="Please use 32 characters at maximum."
                onSave={() => handleUpdateField('name', editName, setIsUpdatingName)}
                isSaving={isUpdatingName}
                messageKey="name"
              >
                <input 
                  type="text"
                  className="w-full max-w-[320px] px-3 py-2 bg-white dark:bg-[#000] border border-zinc-300 dark:border-[#333] rounded-md text-[14px] text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all shadow-sm"
                  value={editName} 
                  onChange={e => setEditName(e.target.value)} 
                  maxLength={32}
                />
              </SettingCard>

              <SettingCard
                messages={messages}
                deleteConfirm={deleteConfirm}
                profileEmail={profile?.email}
                title="Username"
                description="Your URL namespace within the application."
                footerText="Must be unique across the platform."
                onSave={() => handleUpdateField('username', editUsername, setIsUpdatingUsername)}
                isSaving={isUpdatingUsername}
                messageKey="username"
              >
                <div className="flex items-center w-full max-w-[360px] bg-white dark:bg-[#000] border border-zinc-300 dark:border-[#333] rounded-md overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-black dark:focus-within:ring-white transition-all">
                  <span className="pl-3 pr-2 py-2 text-[14px] text-zinc-500 bg-zinc-50 dark:bg-[#0a0a0a] border-r border-zinc-200 dark:border-[#333] font-mono select-none">
                    acme.com/@
                  </span>
                  <input 
                    type="text"
                    className="flex-1 px-3 py-2 bg-transparent text-[14px] text-black dark:text-white focus:outline-none"
                    value={editUsername} 
                    onChange={e => setEditUsername(e.target.value)} 
                    placeholder="username"
                  />
                </div>
              </SettingCard>

              <SettingCard
                messages={messages}
                deleteConfirm={deleteConfirm}
                profileEmail={profile?.email}
                title="Bio"
                description="A short description about yourself."
                footerText="Markdown is not supported."
                onSave={() => handleUpdateField('bio', editBio, setIsUpdatingBio)}
                isSaving={isUpdatingBio}
                messageKey="bio"
              >
                <textarea 
                  className="w-full px-3 py-2 bg-white dark:bg-[#000] border border-zinc-300 dark:border-[#333] rounded-md text-[14px] text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all shadow-sm min-h-[100px] resize-y"
                  value={editBio} 
                  onChange={e => setEditBio(e.target.value)} 
                  maxLength={160}
                  placeholder="🚀 Full-stack developer passionate about building tools..."
                />
              </SettingCard>

              <SettingCard
                messages={messages}
                deleteConfirm={deleteConfirm}
                profileEmail={profile?.email}
                title="Location & Website"
                description="Where are you based, and where can people find more of your work?"
                footerText="These will be displayed on your public profile."
                onSave={() => {
                  setIsUpdatingLocation(true);
                  handleUpdateField('location', editLocation, setIsUpdatingLocation).then(() => {
                    handleUpdateField('website', editWebsite, () => {});
                  });
                }}
                isSaving={isUpdatingLocation}
                messageKey="location"
              >
                <div className="flex flex-col gap-4 max-w-[360px]">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-black dark:text-white">Location</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 bg-white dark:bg-[#000] border border-zinc-300 dark:border-[#333] rounded-md text-[14px] text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all shadow-sm"
                      value={editLocation} 
                      onChange={e => setEditLocation(e.target.value)} 
                      placeholder="San Francisco, CA"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-black dark:text-white">Website</label>
                    <input 
                      type="url"
                      className="w-full px-3 py-2 bg-white dark:bg-[#000] border border-zinc-300 dark:border-[#333] rounded-md text-[14px] text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all shadow-sm"
                      value={editWebsite} 
                      onChange={e => setEditWebsite(e.target.value)} 
                      placeholder="https://myportfolio.dev"
                    />
                  </div>
                </div>
              </SettingCard>

            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] rounded-xl shadow-sm overflow-hidden flex flex-col p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-[16px] font-semibold text-black dark:text-white">Profile Visibility</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                        {profile?.publishedBlogCount || 0} published blog{(profile?.publishedBlogCount || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-[14px] text-[#666] mt-1">Make your public profile page visible to the internet.</p>
                  </div>
                  <button 
                    onClick={() => handleToggleProfilePublic(profile?.isProfilePublic === false ? true : false)}
                    disabled={isTogglingProfilePublic}
                    className={cn("relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
                      profile?.isProfilePublic !== false ? 'bg-black dark:bg-white' : 'bg-zinc-200 dark:bg-[#333]'
                    )}
                  >
                    <span className={cn("pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white dark:bg-black shadow ring-0 transition duration-200 ease-in-out",
                      profile?.isProfilePublic !== false ? 'translate-x-[20px]' : 'translate-x-0'
                    )} />
                  </button>
                </div>
                {messages['profilePublic'] && (
                  <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-[#333]">
                    <span className={messages['profilePublic'].type === 'error' ? 'text-[13px] text-rose-600 dark:text-rose-500 font-medium' : 'text-[13px] text-emerald-600 dark:text-emerald-500 font-medium'}>
                      {messages['profilePublic'].text}
                    </span>
                  </div>
                )}
              </div>



              <SettingCard
                messages={messages}
                deleteConfirm={deleteConfirm}
                profileEmail={profile?.email}
                title="Profile Theme"
                description="Choose the primary color gradient for your public profile banner."
                footerText="Pick a color that fits your brand."
                onSave={() => handleUpdateField('theme', editTheme, setIsUpdatingTheme)}
                isSaving={isUpdatingTheme}
                messageKey="theme"
              >
                <div className="flex gap-4 items-center">
                  {[
                    { id: 'default', bg: 'bg-zinc-500' },
                    { id: 'emerald', bg: 'bg-emerald-500' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setEditTheme(t.id)}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                        t.bg,
                        editTheme === t.id ? "ring-2 ring-offset-2 ring-black dark:ring-white dark:ring-offset-[#000] scale-110" : "opacity-70 hover:opacity-100"
                      )}
                    />
                  ))}
                  
                  <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-800 mx-2" />
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={editTheme.startsWith('#') ? editTheme : '#71717a'}
                      onChange={(e) => setEditTheme(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                      title="Custom Color"
                    />
                    <div className="flex flex-col">
                      <span className="text-[12px] font-medium text-black dark:text-white leading-tight">Custom</span>
                      <span className="text-[11px] text-[#666] font-mono leading-tight uppercase">{editTheme.startsWith('#') ? editTheme : 'Hex'}</span>
                    </div>
                  </div>
                </div>
              </SettingCard>

              <SettingCard
                messages={messages}
                deleteConfirm={deleteConfirm}
                profileEmail={profile?.email}
                title="Social Links"
                description="Connect your social media accounts."
                footerText="Links will appear as icons on your profile."
                onSave={() => handleUpdateField('socialLinks', editSocials, setIsUpdatingSocials)}
                isSaving={isUpdatingSocials}
                messageKey="socialLinks"
              >
                <div className="flex flex-col gap-4 max-w-[360px]">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-black dark:text-white">GitHub Username</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 bg-white dark:bg-[#000] border border-zinc-300 dark:border-[#333] rounded-md text-[14px] text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all shadow-sm"
                      value={editSocials.github} 
                      onChange={e => setEditSocials({...editSocials, github: e.target.value})} 
                      placeholder="octocat"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-black dark:text-white">Twitter / X Username</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 bg-white dark:bg-[#000] border border-zinc-300 dark:border-[#333] rounded-md text-[14px] text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all shadow-sm"
                      value={editSocials.twitter} 
                      onChange={e => setEditSocials({...editSocials, twitter: e.target.value})} 
                      placeholder="jack"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-black dark:text-white">LinkedIn Profile URL</label>
                    <input 
                      type="url"
                      className="w-full px-3 py-2 bg-white dark:bg-[#000] border border-zinc-300 dark:border-[#333] rounded-md text-[14px] text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all shadow-sm"
                      value={editSocials.linkedin} 
                      onChange={e => setEditSocials({...editSocials, linkedin: e.target.value})} 
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>
              </SettingCard>

              <SettingCard
                messages={messages}
                deleteConfirm={deleteConfirm}
                profileEmail={profile?.email}
                title="Custom Links (Link in Bio)"
                description="Add custom links to highlight your portfolio, videos, or projects."
                footerText="Add up to 5 custom links."
                onSave={() => handleUpdateField('customLinks', customLinks, setIsUpdatingCustomLinks)}
                isSaving={isUpdatingCustomLinks}
                messageKey="customLinks"
              >
                <div className="space-y-4">
                  {customLinks.map((link, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3 p-4 bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-[#333] rounded-lg">
                      <div className="flex-1 space-y-3">
                        <input 
                          type="text"
                          className="w-full px-3 py-2 bg-white dark:bg-[#000] border border-zinc-300 dark:border-[#333] rounded-md text-[14px] text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all shadow-sm"
                          value={link.title} 
                          onChange={e => {
                            const newLinks = [...customLinks];
                            newLinks[idx].title = e.target.value;
                            setCustomLinks(newLinks);
                          }} 
                          placeholder="Link Title (e.g. My Latest Video)"
                        />
                        <input 
                          type="url"
                          className="w-full px-3 py-2 bg-white dark:bg-[#000] border border-zinc-300 dark:border-[#333] rounded-md text-[14px] text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all shadow-sm"
                          value={link.url} 
                          onChange={e => {
                            const newLinks = [...customLinks];
                            newLinks[idx].url = e.target.value;
                            setCustomLinks(newLinks);
                          }} 
                          placeholder="https://youtube.com/..."
                        />
                      </div>
                      <button 
                        onClick={() => {
                          const newLinks = [...customLinks];
                          newLinks.splice(idx, 1);
                          setCustomLinks(newLinks);
                        }}
                        className="text-rose-600 dark:text-rose-500 text-[13px] font-medium self-end sm:self-center h-fit px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-md transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  
                  {customLinks.length < 5 && (
                    <button 
                      onClick={() => setCustomLinks([...customLinks, { title: '', url: '' }])}
                      className="text-[13px] font-medium text-black dark:text-white border border-zinc-200 dark:border-[#333] px-4 py-2 rounded-md hover:bg-zinc-50 dark:hover:bg-[#111] transition-colors"
                    >
                      + Add Link
                    </button>
                  )}
                </div>
              </SettingCard>

              <SettingCard
                messages={messages}
                deleteConfirm={deleteConfirm}
                profileEmail={profile?.email}
                title="Email Address"
                description="The email address associated with your account."
                footerText="We will send a verification email if you change this."
                onSave={() => handleUpdateField('email', editEmail, setIsUpdatingEmail)}
                isSaving={isUpdatingEmail}
                messageKey="email"
              >
                <div className="flex flex-col gap-4">
                  <input 
                    type="email"
                    className="w-full max-w-[320px] px-3 py-2 bg-white dark:bg-[#000] border border-zinc-300 dark:border-[#333] rounded-md text-[14px] text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all shadow-sm"
                    value={editEmail} 
                    onChange={e => setEditEmail(e.target.value)} 
                  />
                  
                  {profile?.isVerified ? (
                    <div className="inline-flex items-center w-fit bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 font-medium text-[12px] gap-1.5 px-2.5 py-1 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Verified
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="inline-flex items-center w-fit bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 font-medium text-[12px] gap-1.5 px-2.5 py-1 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Unverified
                      </div>
                      <button 
                        onClick={handleResendVerification} 
                        disabled={isResending} 
                        className="text-[12px] font-medium text-black dark:text-white border border-zinc-200 dark:border-[#333] px-3 py-1 rounded-md hover:bg-zinc-50 dark:hover:bg-[#111] transition-colors disabled:opacity-50"
                      >
                        {isResending ? 'Sending...' : 'Resend Code'}
                      </button>
                    </div>
                  )}
                </div>
              </SettingCard>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] rounded-xl shadow-sm overflow-hidden">
                <form onSubmit={handleChangePassword}>
                  <div className="p-6">
                    <h3 className="text-[16px] font-semibold text-black dark:text-white">Change Password</h3>
                    <p className="text-[14px] text-[#666] mt-1 mb-6">Update the password associated with your account.</p>
                    <div className="flex flex-col gap-4 max-w-[320px]">
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-medium text-black dark:text-white">Current Password</label>
                        <input type="password" required className="w-full px-3 py-2 bg-white dark:bg-[#000] border border-zinc-300 dark:border-[#333] rounded-md text-[14px] text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all shadow-sm" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-medium text-black dark:text-white">New Password</label>
                        <input type="password" required className="w-full px-3 py-2 bg-white dark:bg-[#000] border border-zinc-300 dark:border-[#333] rounded-md text-[14px] text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all shadow-sm" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-medium text-black dark:text-white">Confirm New Password</label>
                        <input type="password" required className="w-full px-3 py-2 bg-white dark:bg-[#000] border border-zinc-300 dark:border-[#333] rounded-md text-[14px] text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all shadow-sm" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-3 bg-zinc-50/50 dark:bg-[#0a0a0a] border-t border-zinc-200 dark:border-[#333]">
                    <div className="text-[13px] font-medium">
                      {messages['password'] ? (
                        <span className={messages['password'].type === 'error' ? 'text-rose-600 dark:text-rose-500' : 'text-emerald-600 dark:text-emerald-500'}>
                          {messages['password'].text}
                        </span>
                      ) : (
                        <span className="text-[#888]">Ensure your new password is at least 8 characters long.</span>
                      )}
                    </div>
                    <button type="submit" disabled={isChangingPwd} className="mt-4 sm:mt-0 px-4 py-2 text-[13px] font-medium rounded-md transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[80px] bg-black dark:bg-white text-white dark:text-black hover:bg-[#333] dark:hover:bg-[#e0e0e0]">
                      {isChangingPwd ? <RefreshCcw className="w-3.5 h-3.5 mr-2 animate-spin" /> : null}
                      Save
                    </button>
                  </div>
                </form>
              </div>

              {(socialProviders.google || socialProviders.github) && (
                <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] rounded-xl shadow-sm overflow-hidden flex flex-col p-6">
                  <h3 className="text-[16px] font-semibold text-black dark:text-white">Connected accounts</h3>
                  <p className="text-[14px] text-[#666] mt-1 mb-4">Link Google or GitHub for one-click sign-in.</p>
                  {messages['social'] && (
                    <div className="mb-4">
                      <span className={messages['social'].type === 'error' ? 'text-[13px] text-rose-600 dark:text-rose-500 font-medium' : 'text-[13px] text-emerald-600 dark:text-emerald-500 font-medium'}>
                        {messages['social'].text}
                      </span>
                    </div>
                  )}
                  <div className="space-y-3 max-w-md">
                    {socialProviders.google && (
                      <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-[#222]">
                        <span className="text-sm">Google</span>
                        {profile?.googleConnected ? (
                          <button
                            type="button"
                            onClick={() => handleDisconnectProvider('google')}
                            disabled={disconnectingProvider === 'google'}
                            className="text-xs font-medium text-rose-600 hover:underline disabled:opacity-50"
                          >
                            {disconnectingProvider === 'google' ? 'Disconnecting...' : 'Disconnect'}
                          </button>
                        ) : (
                          <a href={socialAuthUrl('google', getAccessToken() || undefined)} className="text-xs font-medium underline">Connect</a>
                        )}
                      </div>
                    )}
                    {socialProviders.github && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm">GitHub</span>
                        {profile?.githubConnected ? (
                          <button
                            type="button"
                            onClick={() => handleDisconnectProvider('github')}
                            disabled={disconnectingProvider === 'github'}
                            className="text-xs font-medium text-rose-600 hover:underline disabled:opacity-50"
                          >
                            {disconnectingProvider === 'github' ? 'Disconnecting...' : 'Disconnect'}
                          </button>
                        ) : (
                          <a href={socialAuthUrl('github', getAccessToken() || undefined)} className="text-xs font-medium underline">Connect</a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] rounded-xl shadow-sm overflow-hidden flex flex-col p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[16px] font-semibold text-black dark:text-white">Two-Factor Authentication</h3>
                    <p className="text-[14px] text-[#666] mt-1">Add an extra layer of security to your account.</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (mfaSetupData) setMfaSetupData(null);
                      else handleToggleMfa(!profile?.mfaEnabled);
                    }}
                    disabled={isTogglingMfa}
                    className={cn("relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
                      profile?.mfaEnabled ? 'bg-black dark:bg-white' : 'bg-zinc-200 dark:bg-[#333]'
                    )}
                  >
                    <span className={cn("pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white dark:bg-black shadow ring-0 transition duration-200 ease-in-out",
                      profile?.mfaEnabled ? 'translate-x-[20px]' : 'translate-x-0'
                    )} />
                  </button>
                </div>
                
                {mfaSetupData && !profile?.mfaEnabled && (
                  <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-[#333] flex flex-col items-center">
                    <p className="text-[14px] text-[#666] mb-4 text-center">Scan this QR code with your authenticator app, then enter the 6-digit code below.</p>
                    <div className="bg-white p-2 rounded-lg border border-zinc-200 mb-4 inline-block shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mfaSetupData.qrCodeUrl} alt="MFA QR Code" className="w-[150px] h-[150px]" />
                    </div>
                    <div className="flex items-center gap-3 w-full max-w-[320px]">
                      <input 
                        type="text" 
                        maxLength={6}
                        placeholder="000000"
                        className="flex-1 px-3 py-2 bg-white dark:bg-[#000] border border-zinc-300 dark:border-[#333] rounded-md text-[14px] text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all shadow-sm text-center tracking-[0.5em]"
                        value={mfaVerifyCode} 
                        onChange={e => setMfaVerifyCode(e.target.value.replace(/\D/g, ''))} 
                      />
                      <button 
                        onClick={handleVerifyMfa}
                        disabled={isVerifyingMfa || mfaVerifyCode.length !== 6}
                        className="px-4 py-2 text-[13px] font-medium rounded-md transition-colors shadow-sm disabled:opacity-50 bg-black dark:bg-white text-white dark:text-black hover:bg-[#333] dark:hover:bg-[#e0e0e0] flex items-center justify-center min-w-[80px]"
                      >
                        {isVerifyingMfa ? <RefreshCcw className="w-3.5 h-3.5 mr-2 animate-spin" /> : null}
                        Verify
                      </button>
                    </div>
                  </div>
                )}
                
                {showMfaDisable && profile?.mfaEnabled && (
                  <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-[#333] space-y-3 max-w-[320px]">
                    <p className="text-[14px] text-[#666]">Enter your password and current MFA code to disable.</p>
                    <input type="password" placeholder="Password" className="w-full px-3 py-2 border border-zinc-300 dark:border-[#333] rounded-md text-sm bg-transparent" value={mfaDisablePassword} onChange={(e) => setMfaDisablePassword(e.target.value)} />
                    <input type="text" maxLength={6} placeholder="MFA code" className="w-full px-3 py-2 border border-zinc-300 dark:border-[#333] rounded-md text-sm font-mono bg-transparent" value={mfaDisableCode} onChange={(e) => setMfaDisableCode(e.target.value.replace(/\D/g, ''))} />
                    <div className="flex gap-2">
                      <button type="button" onClick={handleConfirmDisableMfa} disabled={isTogglingMfa} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm">Disable MFA</button>
                      <button type="button" onClick={() => setShowMfaDisable(false)} className="px-4 py-2 text-sm">Cancel</button>
                    </div>
                  </div>
                )}
                
                {messages['mfa'] && (
                  <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-[#333]">
                    <span className={messages['mfa'].type === 'error' ? 'text-[13px] text-rose-600 dark:text-rose-500 font-medium' : 'text-[13px] text-emerald-600 dark:text-emerald-500 font-medium'}>
                      {messages['mfa'].text}
                    </span>
                  </div>
                )}
              </div>

              <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] rounded-xl shadow-sm overflow-hidden flex flex-col p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[16px] font-semibold text-black dark:text-white">Security Alerts</h3>
                    <p className="text-[14px] text-[#666] mt-1">Receive email notifications for logins and account changes.</p>
                  </div>
                  <button 
                    onClick={() => handleToggleNotifications(!profile?.emailNotifications)}
                    disabled={isTogglingNotifications}
                    className={cn("relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
                      profile?.emailNotifications !== false ? 'bg-black dark:bg-white' : 'bg-zinc-200 dark:bg-[#333]'
                    )}
                  >
                    <span className={cn("pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white dark:bg-black shadow ring-0 transition duration-200 ease-in-out",
                      profile?.emailNotifications !== false ? 'translate-x-[20px]' : 'translate-x-0'
                    )} />
                  </button>
                </div>
                {messages['notifications'] && (
                  <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-[#333]">
                    <span className={messages['notifications'].type === 'error' ? 'text-[13px] text-rose-600 dark:text-rose-500 font-medium' : 'text-[13px] text-emerald-600 dark:text-emerald-500 font-medium'}>
                      {messages['notifications'].text}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              <SettingCard
                messages={messages}
                deleteConfirm={deleteConfirm}
                profileEmail={profile?.email}
                title="Active Devices"
                description="Manage devices currently logged into your account."
                footerText="Revoking all other sessions will log you out everywhere else."
                onSave={handleRevokeAllOtherSessions}
                isSaving={isRevokingAll}
                messageKey="sessions"
              >
                <div className="space-y-4">
                  {sessions.slice((sessionsPage - 1) * sessionsLimit, sessionsPage * sessionsLimit).map(session => (
                    <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-zinc-200 dark:border-[#333] rounded-lg bg-zinc-50/50 dark:bg-[#0a0a0a] gap-4">
                      <div className="flex items-center gap-4">
                        <Monitor className="w-6 h-6 text-[#888]" />
                        <div>
                          <p className="font-semibold text-[14px] text-black dark:text-white flex items-center gap-2">
                            {parseUA(session.device)}
                            {session.isCurrent && <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 px-1.5 py-0.5 rounded-sm">Current</span>}
                          </p>
                          <p className="text-[13px] text-[#888] mt-0.5">{session.ipAddress} • Active: {new Date(session.lastActive).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {!session.isCurrent && (
                        <button 
                          onClick={() => handleRevokeSession(session.id)} 
                          disabled={revokingSessionId === session.id}
                          className="text-[13px] font-medium text-rose-600 dark:text-rose-500 border border-zinc-200 dark:border-[#333] px-3 py-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors bg-white dark:bg-[#000] w-full sm:w-auto"
                        >
                          {revokingSessionId === session.id ? 'Revoking...' : 'Revoke'}
                        </button>
                      )}
                    </div>
                  ))}
                  {sessionsTotalPages > 1 && (
                    <div className="pt-2 flex items-center justify-between">
                      <p className="text-sm text-[#666]">
                        Page <span className="font-medium text-black dark:text-white">{sessionsPage}</span> of <span className="font-medium text-black dark:text-white">{sessionsTotalPages}</span>
                      </p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setSessionsPage(p => Math.max(1, p - 1))}
                          disabled={sessionsPage === 1}
                          className="p-1.5 rounded-md border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-[#111] transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setSessionsPage(p => Math.min(sessionsTotalPages, p + 1))}
                          disabled={sessionsPage === sessionsTotalPages}
                          className="p-1.5 rounded-md border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#000] text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-[#111] transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </SettingCard>

            </div>
          )}

          {activeTab === 'danger' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              <SettingCard
                messages={messages}
                deleteConfirm={deleteConfirm}
                profileEmail={profile?.email}
                title="Delete Account"
                description="Permanently remove your personal account and all of its contents from the platform. This action is not reversible."
                footerText="Proceed with extreme caution."
                onSave={handleDeleteAccount}
                isSaving={isDeleting}
                messageKey="delete"
                isDestructive={true}
              >
                <div className="space-y-4 max-w-[320px]">
                  <label className="text-[13px] text-black dark:text-white font-medium block">
                    To verify, type <span className="font-bold">{profile?.email}</span> below:
                  </label>
                  <input 
                    type="text"
                    className="w-full px-3 py-2 bg-white dark:bg-[#000] border border-zinc-300 dark:border-[#333] focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-md text-[14px] text-black dark:text-white transition-all shadow-sm"
                    value={deleteConfirm} 
                    onChange={e => setDeleteConfirm(e.target.value)} 
                  />
                </div>
              </SettingCard>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
