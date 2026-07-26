import { 
  TrendingUp, 
  Users, 
  ArrowRight,
  Activity,
  CreditCard,
  LineChart
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Illustration } from "@/components/shared-assets/illustrations";

export default function Page() {
  const cards = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      change: "+20.1% from last month",
      isPositive: true,
      illustrationType: "card" as const,
      illustrationVariant: "success" as const,
      href: "/dashboard/analytics/revenue",
    },
    {
      title: "Active Users",
      value: "2,350",
      change: "+15.2% from last month",
      isPositive: true,
      illustrationType: "users" as const,
      illustrationVariant: "primary" as const,
      href: "/dashboard/analytics/users",
    },
    {
      title: "System Activity",
      value: "12,234",
      change: "-5.4% from last month",
      isPositive: false,
      illustrationType: "activity" as const,
      illustrationVariant: "warning" as const,
      href: "/dashboard/analytics/activity",
    },
    {
      title: "Conversion Rate",
      value: "4.3%",
      change: "+1.2% from last month",
      isPositive: true,
      illustrationType: "chart" as const,
      illustrationVariant: "danger" as const,
      href: "/dashboard/analytics/conversion",
    }
  ];

  return (
    <div className="p-8 animate-fade-in-up max-w-7xl mx-auto">
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Monitor your key performance metrics and dive deeper into the data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          return (
            <Link 
              key={idx} 
              href={card.href}
              className="group block"
            >
              <Card className="relative h-full shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl border-border/50">
                <CardContent className="p-6">
                  {/* Top Row: Icon & Title */}
                  <div className="flex items-start justify-between mb-4">
                    <Illustration type={card.illustrationType} variant={card.illustrationVariant} size="sm" className="transition-transform duration-300 group-hover:scale-110" />
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>

                  {/* Main Metric */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                      {card.title}
                    </h3>
                    <p className="text-2xl font-bold tracking-tight mb-2">
                      {card.value}
                    </p>
                  </div>

                  {/* Trend line */}
                  <div className="flex items-center gap-1.5 mt-4">
                    {card.isPositive ? (
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
                    )}
                    <span className={`text-xs font-semibold ${card.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {card.change}
                    </span>
                  </div>

                  {/* Hover effect gradient overlay */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-500/20 dark:group-hover:border-blue-400/20 pointer-events-none transition-colors duration-300" />
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
      
    </div>
  );
}
