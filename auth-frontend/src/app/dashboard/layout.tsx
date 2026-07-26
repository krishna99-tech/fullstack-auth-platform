import { SidebarNavigationDualTier } from '@/components/SidebarNavigationDualTier';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <SidebarNavigationDualTier />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
