'use client';

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

const chartData = [
  { season: '2025/2026', desktop: 184, mobile: 80 },
  { season: '2024/2025', desktop: 305, mobile: 200 },
  { season: '2023/2024', desktop: 237, mobile: 120 },
  { season: '2022/2023', desktop: 73, mobile: 190 },
  { season: '2021/2022', desktop: 209, mobile: 130 },
  { season: '2020/2021', desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: 'Richtig getippt',
    color: '#ffed00',
  },
  mobile: {
    label: 'Falsch getippt',
    color: '#d2e1e6',
  },
} satisfies ChartConfig;

export function TipChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-50 w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="season"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 9)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
