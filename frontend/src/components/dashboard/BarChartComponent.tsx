"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A bar chart"


const chartConfig = {
    value: {
        label: "% Score",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

type DataRecord = {
    axisKey: string;
    value: number;
    title?: string;
    date?: string;
    score?: number;
    max_score?: number;
};

type BarChartComponentProps = {
    label: string;
    description: string;
    data: DataRecord[];
    barColor?: string;
};

import { YAxis } from "recharts";

export function BarChartComponent({ label, description, data, barColor = "#f59e42" }: BarChartComponentProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{label}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart accessibilityLayer data={data}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="axisKey"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                        <ChartTooltip
                            cursor={false}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length > 0) {
                                    const d = payload[0].payload;
                                    return (
                                        <div className="bg-white p-2 rounded shadow text-xs">
                                            <div><b>{d.title}</b></div>
                                            <div>Date: {d.date}</div>
                                            <div>Score: {d.score.toFixed(2)} / {d.max_score}</div>
                                            <div>Percent: {d.value.toFixed(2)}%</div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="value" fill={barColor} radius={8} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export default BarChartComponent;