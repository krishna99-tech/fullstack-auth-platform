import { MarketingLayout } from '@/components/marketing/marketing-layout';

export const metadata = {
  title: 'About — Platform',
  description: 'Learn about Platform and our mission.',
};

export default function AboutPage() {
  return (
    <MarketingLayout>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight mb-4">About Platform</h1>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
          Platform is a modern authentication and identity stack built for developers who need secure sign-in,
          session management, and user profiles without reinventing the wheel.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
          We combine a serverless auth backend, optional authlog audit trail, and a polished dashboard so your team
          can ship faster while keeping security front and center.
        </p>
        <h2 className="text-xl font-semibold mb-3">What we offer</h2>
        <ul className="list-disc list-inside space-y-2 text-zinc-600 dark:text-zinc-400">
          <li>Email/password and social OAuth sign-in</li>
          <li>Multi-factor authentication (MFA)</li>
          <li>Session management and security notifications</li>
          <li>Blog and project showcase for your community</li>
        </ul>
      </div>
    </MarketingLayout>
  );
}
