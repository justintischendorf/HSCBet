"use client";

import { useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { toast } from "sonner";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useSeasonStats } from "@/hooks/use-season-stats";

const chartConfig = {
  correct: {
    label: "Richtig getippt",
    color: "#ffed00",
  },
  incorrect: {
    label: "Falsch getippt",
    color: "#d2e1e6",
  },
} satisfies ChartConfig;

export function TipChart() {
  const { data: statsResponse, isPending } = useSeasonStats();

  useEffect(() => {
    if (statsResponse?.error) {
      toast.error(
        `${statsResponse.error.status}: ${statsResponse.error.value}`,
      );
    }
  }, [statsResponse?.error]);

  const NEWEST_SEASONS_TO_SHOW = 4;
  const chartData = (statsResponse?.data?.stats ?? []).slice(
    0,
    NEWEST_SEASONS_TO_SHOW,
  );

  if (isPending) {
    return <Skeleton className="h-150 w-full" />;
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-50 w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="title"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(7, 16)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="correct" fill="var(--color-correct)" radius={4} />
        <Bar dataKey="incorrect" fill="var(--color-incorrect)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
