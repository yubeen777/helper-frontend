"use client"

import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts"

const volumeByBodyPart = [
  { name: "가슴", volume: 12400, fill: "hsl(var(--chart-1))" },
  { name: "등", volume: 14200, fill: "hsl(var(--chart-2))" },
  { name: "하체", volume: 18600, fill: "hsl(var(--chart-1))" },
  { name: "어깨", volume: 6800, fill: "hsl(var(--chart-3))" },
  { name: "팔", volume: 4200, fill: "hsl(var(--chart-4))" },
]

const oneRMTrend = [
  { week: "4주 전", bench: 85, squat: 120, deadlift: 140 },
  { week: "3주 전", bench: 87.5, squat: 125, deadlift: 145 },
  { week: "2주 전", bench: 90, squat: 127.5, deadlift: 147.5 },
  { week: "1주 전", bench: 90, squat: 130, deadlift: 150 },
  { week: "이번 주", bench: 92.5, squat: 132.5, deadlift: 155 },
]

const workoutHeatmapData = [
  { day: "월", week1: 1, week2: 1, week3: 0, week4: 1 },
  { day: "화", week1: 0, week2: 1, week3: 1, week4: 0 },
  { day: "수", week1: 1, week2: 0, week3: 1, week4: 1 },
  { day: "목", week1: 0, week2: 1, week3: 0, week4: 1 },
  { day: "금", week1: 1, week2: 1, week3: 1, week4: 1 },
  { day: "토", week1: 1, week2: 0, week3: 1, week4: 0 },
  { day: "일", week1: 0, week2: 0, week3: 0, week4: 0 },
]

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-xl">
        <p className="text-sm font-medium text-foreground mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs text-muted-foreground">
            {entry.name}: <span className="text-primary font-medium">{entry.value}kg</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 pt-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">분석</h1>
          <p className="text-sm text-muted-foreground">
            운동 데이터를 분석하고 성장을 확인하세요
          </p>
        </div>

        {/* Volume by Body Part */}
        <Card className="mb-6 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">
              부위별 볼륨
            </CardTitle>
            <p className="text-xs text-muted-foreground">이번 주 총 볼륨 (kg)</p>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeByBodyPart} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    width={40}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border border-border bg-card p-2 shadow-xl">
                            <p className="text-xs text-muted-foreground">
                              {payload[0].payload.name}:{" "}
                              <span className="text-primary font-medium">
                                {payload[0].value?.toLocaleString()}kg
                              </span>
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="volume" radius={[0, 4, 4, 0]}>
                    {volumeByBodyPart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#22c55e" fillOpacity={0.5 + (index * 0.1)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 1RM Trend */}
        <Card className="mb-6 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">
              1RM 추이
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              주요 운동 예상 1RM 변화
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">벤치프레스</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary/70" />
                <span className="text-xs text-muted-foreground">스쿼트</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary/40" />
                <span className="text-xs text-muted-foreground">데드리프트</span>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={oneRMTrend}>
                  <XAxis
                    dataKey="week"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    domain={[80, 160]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="bench"
                    name="벤치프레스"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="squat"
                    name="스쿼트"
                    stroke="#22c55e"
                    strokeOpacity={0.7}
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", fillOpacity: 0.7, strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="deadlift"
                    name="데드리프트"
                    stroke="#22c55e"
                    strokeOpacity={0.4}
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", fillOpacity: 0.4, strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Workout Consistency Heatmap */}
        <Card className="mb-6 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">
              운동 일관성
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              최근 4주간 운동 기록
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-muted-foreground">4주 전</span>
              <span className="text-xs text-muted-foreground">이번 주</span>
            </div>
            <div className="space-y-2">
              {workoutHeatmapData.map((row, dayIndex) => (
                <div key={dayIndex} className="flex items-center gap-2">
                  <span className="w-6 text-xs text-muted-foreground">
                    {row.day}
                  </span>
                  <div className="flex flex-1 gap-1">
                    {[row.week1, row.week2, row.week3, row.week4].map(
                      (value, weekIndex) => (
                        <div
                          key={weekIndex}
                          className={`flex-1 h-8 rounded-md transition-colors ${
                            value === 1
                              ? "bg-primary"
                              : "bg-muted"
                          }`}
                        />
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-muted" />
                <span className="text-xs text-muted-foreground">휴식</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-primary" />
                <span className="text-xs text-muted-foreground">운동</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-primary">85%</p>
              <p className="text-xs text-muted-foreground">목표 달성률</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-foreground">+12%</p>
              <p className="text-xs text-muted-foreground">월간 볼륨 증가</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
