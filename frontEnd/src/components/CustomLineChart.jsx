"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, LabelList, Line, LineChart as RechartsLineChart, YAxis, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.jsx"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart.jsx"

export const description = "A line chart with a custom label"

// 4월부터 10월까지의 데이터 추가
const chartData = [
  { month: "4월", rank: 3, fill: "var(--color-4월)" },
  { month: "5월", rank: 5, fill: "var(--color-5월)" },
  { month: "6월", rank: 2, fill: "var(--color-6월)" },
  { month: "7월", rank: 4, fill: "var(--color-7월)" },
  { month: "8월", rank: 1, fill: "var(--color-8월)" },
  { month: "9월", rank: 6, fill: "var(--color-9월)" },
  { month: "10월", rank: 3, fill: "var(--color-10월)" },
]

const chartConfig = {
  rank: {
    label: "Rank",
    color: "hsl(var(--chart-2))",
  },
  "4월": {
    label: "4월",
    color: "hsl(var(--chart-1))",
  },
  "5월": {
    label: "5월",
    color: "hsl(var(--chart-2))",
  },
  "6월": {
    label: "6월",
    color: "hsl(var(--chart-3))",
  },
  "7월": {
    label: "7월",
    color: "hsl(var(--chart-4))",
  },
  "8월": {
    label: "8월",
    color: "hsl(var(--chart-5))",
  },
  "9월": {
    label: "9월",
    color: "hsl(var(--chart-1))",
  },
  "10월": {
    label: "10월",
    color: "hsl(var(--chart-2))",
  },
}

export function CustomLineChart() {
  return (
    <Card>
      <CardHeader className='text-center'>
        <CardTitle>월별 랭킹 차트</CardTitle>
        <CardDescription>April - October 2024</CardDescription>
      </CardHeader>
      <CardContent className='max-lg:flex max-lg:justify-center max-lg:items-center'>
        <ChartContainer config={chartConfig} style={{marginTop : '45px', marginBottom : '95px' , height : '150px'}}>
          <RechartsLineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 24,
              left: 24,
              right: 24,
            }}
          >
            <CartesianGrid vertical={false} />
            {/* Y축 숨기기 */}
            <YAxis hide={true} domain={[1, 10]} reversed={true} /> {/* 순위는 낮을수록 상단에 위치 */}
            <XAxis hide={true} dataKey="month" />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  nameKey="rank"
                  hideLabel
                />
              }
            />
            <Line
              dataKey="rank"
              type="monotone"
              stroke="var(--color-rank)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-rank)",
              }}
              activeDot={{
                r: 6,
              }}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
                dataKey="month"
                formatter={(value) => chartConfig[value]?.label}
              />
            </Line>
          </RechartsLineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm max-lg:flex max-lg:justify-center max-lg:items-center">
        <div className="flex gap-2 font-medium leading-none mb-4" style={{fontSize : '16px', fontWeight : 'bold'}}>
          랭킹이 50% 상승하였습니다! <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          2024년도 4월부터 10월까지의 랭킹을 나타내고 있습니다.
        </div>
      </CardFooter>
    </Card>
  )
}

export default CustomLineChart;
