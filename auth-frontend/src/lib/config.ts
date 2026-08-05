export const AUTHLOG_API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');
export const LEGACY_API = (process.env.NEXT_PUBLIC_LEGACY_API_URL || '').replace(/\/$/, '');
export const TENANT_SLUG = process.env.NEXT_PUBLIC_TENANT_SLUG || 'default';

export function hasLegacyApi() {
  return LEGACY_API.length > 0;
}
