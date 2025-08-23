"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
} from "@/components/ui/chart"

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
    height?: number;
};

import { YAxis } from "recharts";
import {formatScore} from "@/utils/score";

export function BarChartComponent({ label, description, data, barColor = "#f59e42", height }: BarChartComponentProps) {

    return (
        <Card>
            <CardHeader>
                <CardTitle>{label}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} height={height}>
                    <BarChart accessibilityLayer data={data} height={height}>
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
                                            <div>Score: {formatScore(d.score)} / {d.max_score}</div>
                                            <div>Percent: {formatScore(d.value)}%</div>
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