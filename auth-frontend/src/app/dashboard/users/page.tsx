"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { listUsers, assignRole, type AuthlogUser } from '@/lib/authlog-client';
import { AuthlogError } from '@/lib/authlog-client';
import { Shield, UserPlus } from 'lucide-react';

export default function UsersPage() {
  const { loading: authLoading, isAdmin, getAccessToken } = useAuth();
  useAuthGuard();
  const [users, setUsers] = useState<AuthlogUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assigning, setAssigning] = useState<string | null>(null);

  const loadUsers = async () => {
    const token = getAccessToken();
    if (!token) return;
    setLoading(true);
    try {
      const data = await listUsers(token);
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof AuthlogError ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAdmin) loadUsers();
    else if (!authLoading) setLoading(false);
  }, [authLoading, isAdmin]);

  const handleAssignAdmin = async (userId: string) => {
    const token = getAccessToken();
    if (!token) return;
    setAssigning(userId);
    try {
      await assignRole(token, userId, 'admin');
      await loadUsers();
    } catch (err) {
      setError(err instanceof AuthlogError ? err.message : 'Failed to assign role');
    } finally {
      setAssigning(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-200 dark:border-[#333] border-t-black dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="border border-zinc-200 dark:border-[#333] rounded-xl p-8 text-center bg-white dark:bg-black">
        <Shield className="w-10 h-10 mx-auto text-zinc-400 mb-4" />
        <h2 className="text-lg font-semibold">Admin access required</h2>
        <p className="text-sm text-zinc-500 mt-2">You need the admin role to manage users.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-[#666] mt-1 text-[14px]">Manage tenant members and roles.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded text-sm">{error}</div>
      )}

      <div className="border border-zinc-200 dark:border-[#333] bg-white dark:bg-black rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-[#333] bg-zinc-50/50 dark:bg-[#0a0a0a]">
              <th className="px-5 py-3 text-[12px] font-medium text-[#888] uppercase">User</th>
              <th className="px-5 py-3 text-[12px] font-medium text-[#888] uppercase">Roles</th>
              <th className="px-5 py-3 text-[12px] font-medium text-[#888] uppercase">Status</th>
              <th className="px-5 py-3 text-[12px] font-medium text-[#888] uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-[#333]">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-[#111]">
                <td className="px-5 py-4">
                  <div className="font-medium text-[14px]">{u.name || u.email}</div>
                  <div className="text-[12px] text-[#888]">{u.email}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-1 flex-wrap">
                    {(u.roles || []).map((r) => (
                      <span key={r} className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-[#222] text-zinc-700 dark:text-zinc-300 capitalize">
                        {r}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4 text-[13px] capitalize">{u.status || 'active'}</td>
                <td className="px-5 py-4 text-right">
                  {!u.roles?.includes('admin') && (
                    <button
                      onClick={() => handleAssignAdmin(u.id)}
                      disabled={assigning === u.id}
                      className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-md border border-zinc-200 dark:border-[#333] hover:bg-zinc-50 dark:hover:bg-[#111] disabled:opacity-50"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      {assigning === u.id ? 'Assigning...' : 'Make admin'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-[#666] text-[13px]">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
