"use client";

import { useEffect, useState } from 'react';
import { SocialButton } from '@/components/base/buttons/social-button';
import { socialAuthUrl, getSocialStatus } from '@/lib/authlog-client';

type SocialAuthSectionProps = {
  mode: 'login' | 'signup';
};

export function SocialAuthSection({ mode }: SocialAuthSectionProps) {
  const [configured, setConfigured] = useState({ google: false, github: false });

  useEffect(() => {
    getSocialStatus()
      .then(setConfigured)
      .catch(() => setConfigured({ google: false, github: false }));
  }, []);

  const googleLabel = mode === 'login' ? 'Continue with Google' : 'Sign up with Google';
  const githubLabel = mode === 'login' ? 'Continue with GitHub' : 'Sign up with GitHub';
  const anyConfigured = configured.google || configured.github;

  return (
    <div className="space-y-3 mb-6">
      <SocialButton
        social="google"
        href={socialAuthUrl('google')}
        aria-disabled={!configured.google}
        className={!configured.google ? 'opacity-60' : undefined}
        title={!configured.google ? 'Google OAuth not configured on server' : undefined}
      >
        {googleLabel}
      </SocialButton>
      <SocialButton
        social="github"
        href={socialAuthUrl('github')}
        aria-disabled={!configured.github}
        className={!configured.github ? 'opacity-60' : undefined}
        title={!configured.github ? 'GitHub OAuth not configured on server' : undefined}
      >
        {githubLabel}
      </SocialButton>
      {!anyConfigured && (
        <p className="text-xs text-center text-amber-600 dark:text-amber-500">
          Social login requires OAuth credentials in authlog <code className="text-[11px]">.env</code>
        </p>
      )}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-[#0a0a0a] text-gray-500">or</span>
        </div>
      </div>
    </div>
  );
}
