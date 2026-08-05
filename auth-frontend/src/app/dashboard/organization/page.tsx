"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { listTenants, createTenant, listIdPConnections, createIdPConnection, type Tenant, type IdPConnection } from '@/lib/authlog-client';
import { AuthlogError } from '@/lib/authlog-client';
import { Building2, Plus } from 'lucide-react';
import { TENANT_SLUG } from '@/lib/config';

export default function OrganizationPage() {
  const { loading: authLoading, isAdmin, getAccessToken } = useAuth();
  useAuthGuard();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [connections, setConnections] = useState<IdPConnection[]>([]);
  const [showSsoCreate, setShowSsoCreate] = useState(false);
  const [ssoName, setSsoName] = useState('');
  const [ssoType, setSsoType] = useState<'saml' | 'oidc'>('oidc');
  const [creatingSso, setCreatingSso] = useState(false);

  const loadTenants = async () => {
    const token = getAccessToken();
    if (!token) return;
    setLoading(true);
    try {
      const [tenantData, connData] = await Promise.all([
        listTenants(token),
        listIdPConnections(token).catch(() => ({ connections: [] as IdPConnection[] })),
      ]);
      setTenants(tenantData.tenants);
      setConnections(connData.connections);
    } catch (err) {
      setError(err instanceof AuthlogError ? err.message : 'Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAdmin) loadTenants();
    else if (!authLoading) setLoading(false);
  }, [authLoading, isAdmin]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAccessToken();
    if (!token) return;
    setCreating(true);
    setError('');
    try {
      await createTenant(token, slug.trim().toLowerCase(), name.trim());
      setShowCreate(false);
      setSlug('');
      setName('');
      await loadTenants();
    } catch (err) {
      setError(err instanceof AuthlogError ? err.message : 'Failed to create tenant');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateSso = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAccessToken();
    if (!token) return;
    setCreatingSso(true);
    setError('');
    try {
      await createIdPConnection(token, { name: ssoName.trim(), type: ssoType });
      setShowSsoCreate(false);
      setSsoName('');
      await loadTenants();
    } catch (err) {
      setError(err instanceof AuthlogError ? err.message : 'Failed to create SSO connection');
    } finally {
      setCreatingSso(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-200 dark:border-[#333] border-t-black dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Organization</h1>
          <p className="text-[#666] mt-1 text-[14px]">
            Manage tenants. Current tenant: <span className="font-medium capitalize">{TENANT_SLUG}</span>
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New tenant
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded text-sm">{error}</div>
      )}

      {!isAdmin && (
        <div className="border border-zinc-200 dark:border-[#333] rounded-xl p-8 text-center bg-white dark:bg-black">
          <Building2 className="w-10 h-10 mx-auto text-zinc-400 mb-4" />
          <p className="text-sm text-zinc-500">Admin role required to manage organizations.</p>
        </div>
      )}

      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tenants.map((t) => (
            <div
              key={t.id}
              className={`border rounded-xl p-5 bg-white dark:bg-black ${
                t.slug === TENANT_SLUG ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'border-zinc-200 dark:border-[#333]'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-[#111] flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{t.name}</h3>
                  <p className="text-[12px] text-[#888] font-mono">{t.slug}</p>
                </div>
              </div>
              <div className="flex gap-2 text-[12px]">
                <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-[#222] capitalize">{t.tier}</span>
                {t.slug === TENANT_SLUG && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">Current</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <div className="border border-zinc-200 dark:border-[#333] rounded-xl p-6 bg-white dark:bg-black">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold">Enterprise SSO</h2>
              <p className="text-[13px] text-[#666] mt-1">
                SAML/OIDC identity provider connections. Login initiation is configured server-side (Phase 2).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSsoCreate(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-zinc-200 dark:border-[#333] rounded-md text-sm"
            >
              <Plus className="w-4 h-4" /> Add connection
            </button>
          </div>
          {connections.length === 0 ? (
            <p className="text-sm text-zinc-500">No IdP connections yet.</p>
          ) : (
            <div className="space-y-2">
              {connections.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-[#222] last:border-0">
                  <div>
                    <div className="font-medium text-sm">{c.name}</div>
                    <div className="text-[12px] text-[#888] uppercase">{c.type}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-600'}`}>
                    {c.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-white dark:bg-black border border-zinc-200 dark:border-[#333] rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">Create tenant</h2>
            <div>
              <label className="text-sm font-medium">Slug</label>
              <input
                className="input-field mt-1"
                value={slug}
                onChange={(e) => setSlug(e.target.value.replace(/[^a-z0-9-]/g, ''))}
                placeholder="acme"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Name</label>
              <input
                className="input-field mt-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Inc"
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm border rounded-md border-zinc-200 dark:border-[#333]">
                Cancel
              </button>
              <button type="submit" disabled={creating} className="px-4 py-2 text-sm bg-black dark:bg-white text-white dark:text-black rounded-md disabled:opacity-50">
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {showSsoCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateSso} className="bg-white dark:bg-black border border-zinc-200 dark:border-[#333] rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">Add SSO connection</h2>
            <div>
              <label className="text-sm font-medium">Name</label>
              <input className="input-field mt-1" value={ssoName} onChange={(e) => setSsoName(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <select className="input-field mt-1" value={ssoType} onChange={(e) => setSsoType(e.target.value as 'saml' | 'oidc')}>
                <option value="oidc">OIDC</option>
                <option value="saml">SAML</option>
              </select>
            </div>
            <p className="text-xs text-zinc-500">Full SAML/OIDC RP login flows return 501 until provider credentials are configured on the server.</p>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowSsoCreate(false)} className="px-4 py-2 text-sm border rounded-md border-zinc-200 dark:border-[#333]">Cancel</button>
              <button type="submit" disabled={creatingSso} className="px-4 py-2 text-sm bg-black dark:bg-white text-white dark:text-black rounded-md disabled:opacity-50">
                {creatingSso ? 'Saving...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
