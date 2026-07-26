import NavigationDock from '@/components/NavigationDock';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col pb-24">
      <div className="flex flex-1 flex-col">
        {children}
      </div>
      <NavigationDock />
    </div>
  );
}
