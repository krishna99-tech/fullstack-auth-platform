"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import {
  listOAuthClients,
  createOAuthClient,
  type OAuthClient,
  AuthlogError,
} from '@/lib/authlog-client';
import { Copy, Plus, Key } from 'lucide-react';

export default function ApisPage() {
  const { isAdmin, getAccessToken } = useAuth();
  useAuthGuard();
  const [clients, setClients] = useState<OAuthClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [redirectUris, setRedirectUris] = useState('http://localhost:3000/callback');
  const [creating, setCreating] = useState(false);
  const [newSecret, setNewSecret] = useState<{ clientId: string; clientSecret: string } | null>(null);

  const load = async () => {
    const token = getAccessToken();
    if (!token || !isAdmin) {
      setLoading(false);
      return;
    }
    try {
      const data = await listOAuthClients(token);
      setClients(data.clients);
    } catch (err) {
      setError(err instanceof AuthlogError ? err.message : 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [isAdmin]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAccessToken();
    if (!token) return;
    setCreating(true);
    setError('');
    try {
      const uris = redirectUris.split('\n').map((u) => u.trim()).filter(Boolean);
      const data = await createOAuthClient(token, { name, redirect_uris: uris, is_public: true });
      if (data.client.clientSecret) {
        setNewSecret({ clientId: data.client.clientId, clientSecret: data.client.clientSecret });
      }
      setShowCreate(false);
      setName('');
      await load();
    } catch (err) {
      setError(err instanceof AuthlogError ? err.message : 'Failed to create client');
    } finally {
      setCreating(false);
    }
  };

  const copy = (text: string) => navigator.clipboard.writeText(text);

  if (!isAdmin) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">OAuth Clients</h1>
        <p className="text-sm text-zinc-500 mt-2">Admin access required to manage OAuth applications.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">OAuth Clients</h1>
          <p className="text-[#666] mt-1 text-[14px]">
            Register apps for OIDC authorization code + PKCE flows.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> New client
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {newSecret && (
        <div className="border border-amber-500/40 bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 text-sm">
          <p className="font-medium text-amber-800 dark:text-amber-200 mb-2">Save your client secret — it won&apos;t be shown again.</p>
          <div className="space-y-2 font-mono text-[13px]">
            <div className="flex items-center gap-2">
              <span className="text-[#666]">Client ID:</span> {newSecret.clientId}
              <button type="button" onClick={() => copy(newSecret.clientId)} className="p-1 hover:bg-black/5 rounded"><Copy className="w-3.5 h-3.5" /></button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#666]">Secret:</span> {newSecret.clientSecret}
              <button type="button" onClick={() => copy(newSecret.clientSecret)} className="p-1 hover:bg-black/5 rounded"><Copy className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          <button type="button" onClick={() => setNewSecret(null)} className="mt-3 text-xs underline">Dismiss</button>
        </div>
      )}

      {showCreate && (
        <form onSubmit={handleCreate} className="border border-zinc-200 dark:border-[#333] rounded-xl p-6 space-y-4 bg-white dark:bg-black">
          <h2 className="font-semibold">Create OAuth client</h2>
          <div>
            <label className="text-sm text-[#666]">App name</label>
            <input className="w-full mt-1 px-3 py-2 border rounded-md bg-transparent" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm text-[#666]">Redirect URIs (one per line)</label>
            <textarea className="w-full mt-1 px-3 py-2 border rounded-md bg-transparent min-h-[80px] font-mono text-sm" value={redirectUris} onChange={(e) => setRedirectUris(e.target.value)} required />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={creating} className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md text-sm">
              {creating ? 'Creating...' : 'Create'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-12 flex justify-center"><div className="w-5 h-5 border-2 border-zinc-200 border-t-black rounded-full animate-spin" /></div>
      ) : clients.length === 0 ? (
        <div className="border border-dashed border-zinc-300 dark:border-[#333] rounded-xl p-12 text-center text-[#666]">
          <Key className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p>No OAuth clients yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map((c) => (
            <div key={c.id} className="border border-zinc-200 dark:border-[#333] rounded-xl p-4 bg-white dark:bg-black">
              <div className="font-medium">{c.name}</div>
              <div className="text-[13px] font-mono text-[#666] mt-1">{c.clientId}</div>
              <div className="text-[12px] text-[#888] mt-2">
                Redirects: {c.redirectUris.join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
