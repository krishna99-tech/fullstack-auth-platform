"use client";

import { Legend, PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

interface ActivityGaugeProps {
  title?: string;
  subtitle?: string;
  data?: any[];
}

const radialData = [
    {
        name: "Inactive Users",
        value: 120,
        fill: "#94a3b8", // slate-400
    },
    {
        name: "New Signups",
        value: 340,
        fill: "#8b5cf6", // purple-500
    },
    {
        name: "Active Sessions",
        value: 540,
        fill: "#3b82f6", // blue-500
    },
];

export const ActivityGaugeMd = ({ title = "1,000", subtitle = "Total Users", data = radialData }: ActivityGaugeProps) => {
    return (
        <ResponsiveContainer width="100%" height={312}>
            <RadialBarChart
                data={data}
                innerRadius={74}
                outerRadius={132}
                startAngle={90}
                endAngle={360 + 90}
                className="font-medium text-foreground"
                margin={{
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                }}
            >
                <PolarAngleAxis tick={false} domain={[0, 1000]} type="number" reversed />

                <Legend verticalAlign="bottom" align="center" layout="horizontal" />

                <Tooltip 
                  cursor={{ fill: 'transparent' }} 
                  contentStyle={{ borderRadius: '12px', border: '1px solid rgba(150,150,150,0.2)', backgroundColor: 'var(--background)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />

                <RadialBar
                    isAnimationActive={false}
                    dataKey="value"
                    cornerRadius={99}
                    background={{ fill: 'rgba(150,150,150,0.1)' }}
                />

                {(title || subtitle) && (
                    <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle">
                        {title && (
                            <tspan x="50%" dy="0" className="fill-foreground text-3xl font-extrabold tracking-tight">
                                {title}
                            </tspan>
                        )}
                        {subtitle && (
                            <tspan x="50%" dy="1.5em" className="fill-muted-foreground text-sm font-medium">
                                {subtitle}
                            </tspan>
                        )}
                    </text>
                )}
            </RadialBarChart>
        </ResponsiveContainer>
    );
};
