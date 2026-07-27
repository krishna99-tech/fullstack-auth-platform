import { 
  TrendingUp, 
  Users, 
  ArrowRight,
  Activity,
  DollarSign,
  MousePointerClick
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";

import { ActivityGaugeMd } from "@/components/application/charts/activity-gauge";

export default function Page() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Monitor your key performance metrics and dive deeper into the data.
        </p>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm rounded-2xl border-border/50">
          <div className="p-6 border-b border-border/50">
            <h3 className="text-lg font-bold">User Activity Breakdown</h3>
            <p className="text-sm text-muted-foreground">Distribution of active users across segments.</p>
          </div>
          <CardContent className="p-6 flex items-center justify-center">
            <ActivityGaugeMd />
          </CardContent>
        </Card>
      </div>
      
    </div>
  );
}
