"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

type DataPoint = {
    axisKey: string;
    value: number;
    title: string;
    category: string;
    date: string;
    score: number;
    max_score: number;
};

type BarChartComponentProps = {
    data: DataPoint[];
    label: string;
    description: string;
    barColor?: string;
    height?: number;
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const d: DataPoint = payload[0].payload;
        return (
            <div className="bg-card border border-border rounded-lg shadow-md px-3 py-2.5 text-sm">
                <p className="font-semibold text-foreground">{d.title}</p>
                <p className="text-xs text-muted-foreground">{d.category} · {d.date}</p>
                <p className="font-bold text-primary mt-1">{d.score}/{d.max_score} correct ({d.value.toFixed(1)}%)</p>
            </div>
        );
    }
    return null;
};

function BarChartComponent({ data, label, description }: BarChartComponentProps) {
    return (
        <div className="w-full space-y-1">
            <p className="text-sm font-bold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground mb-3">{description}</p>
            {data.length === 0 ? (
                <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                    No attempts yet
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={data} barSize={18} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis
                            dataKey="axisKey"
                            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            domain={[0, 100]}
                            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={v => `${v}%`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--accent)" }} />
                        <Bar
                            dataKey="value"
                            fill="var(--primary)"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

export default BarChartComponent;
