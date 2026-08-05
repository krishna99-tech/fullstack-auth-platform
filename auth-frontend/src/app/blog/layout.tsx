import Link from 'next/link';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white">
      <header className="border-b border-zinc-200 dark:border-[#333] bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Platform
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/blog" className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white">
              Blog
            </Link>
            <Link href="/login" className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white">
              Sign in
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-10">{children}</main>
    </div>
  );
}
