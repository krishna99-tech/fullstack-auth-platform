import Link from 'next/link';
import { MarketingLayout } from '@/components/marketing/marketing-layout';

export const metadata = {
  title: 'Pricing — Platform',
  description: 'Simple, transparent pricing for Platform.',
};

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'For side projects and early experiments.',
    features: ['Up to 1,000 MAU', 'Email/password auth', 'Basic session management', 'Community support'],
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/mo',
    description: 'For growing apps that need more control.',
    features: ['Up to 10,000 MAU', 'Social OAuth + MFA', 'Audit log & analytics', 'Email support'],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For teams with advanced security requirements.',
    features: ['Unlimited MAU', 'SAML / OIDC federation', 'Dedicated support', 'SLA & compliance'],
  },
];

export default function PricingPage() {
  return (
    <MarketingLayout>
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Pricing</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-10">
          Start free and scale as you grow. No hidden fees.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-6 ${
                plan.highlighted
                  ? 'border-purple-500 bg-purple-500/5 dark:bg-purple-500/10'
                  : 'border-zinc-200 dark:border-[#333] bg-white dark:bg-[#0a0a0a]'
              }`}
            >
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <p className="mt-2 text-3xl font-bold">
                {plan.price}
                {plan.period && <span className="text-base font-normal text-zinc-500">{plan.period}</span>}
              </p>
              <p className="mt-2 text-sm text-zinc-500">{plan.description}</p>
              <ul className="mt-6 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                {plan.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`mt-6 inline-flex w-full items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-opacity ${
                  plan.highlighted
                    ? 'bg-purple-600 text-white hover:opacity-90'
                    : 'border border-zinc-200 dark:border-[#333] hover:bg-zinc-50 dark:hover:bg-[#111]'
                }`}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </MarketingLayout>
  );
}
