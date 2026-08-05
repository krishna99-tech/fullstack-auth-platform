import { MarketingLayout } from '@/components/marketing/marketing-layout';

export const metadata = {
  title: 'FAQ — Platform',
  description: 'Frequently asked questions about Platform.',
};

const faqs = [
  {
    q: 'How do I get started?',
    a: 'Create a free account, configure your environment variables, and deploy the auth-backend with SAM. The dashboard walks you through the rest.',
  },
  {
    q: 'Does Platform support social login?',
    a: 'Yes. Google and GitHub OAuth are built in. Configure your client IDs in the backend template parameters or .env file.',
  },
  {
    q: 'Can I use my own database?',
    a: 'The default stack uses DynamoDB via AWS SAM. The API layer is standard REST, so you can adapt the data layer if needed.',
  },
  {
    q: 'What is authlog?',
    a: 'Authlog is an optional audit and multi-tenant layer. When NEXT_PUBLIC_AUTHLOG_URL is set, the dashboard shows immutable audit events and advanced admin features.',
  },
  {
    q: 'How do I publish blog posts or projects?',
    a: 'Use the Blogs and Projects sections in your dashboard. Set status to "Published" and they appear on the public /blog and /projects pages.',
  },
];

export default function FaqPage() {
  return (
    <MarketingLayout>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight mb-2">FAQ</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-10">
          Common questions about Platform.
        </p>

        <div className="space-y-6">
          {faqs.map((faq) => (
            <div key={faq.q} className="border-b border-zinc-200 dark:border-[#333] pb-6 last:border-0">
              <h2 className="text-lg font-semibold mb-2">{faq.q}</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </MarketingLayout>
  );
}
