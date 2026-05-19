"use client"

import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Dumbbell, Weight, Layers, ChevronRight, Flame } from "lucide-react"

const weeklyStats = [
  { label: "운동 횟수", value: "5회", icon: Dumbbell, change: "+2" },
  { label: "총 볼륨", value: "28,450kg", icon: Weight, change: "+12%" },
  { label: "총 세트", value: "87세트", icon: Layers, change: "+15" },
]

const recentWorkouts = [
  { id: 1, name: "가슴 & 삼두", date: "오늘", exercises: 6, duration: "58분", volume: "8,240kg" },
  { id: 2, name: "등 & 이두", date: "어제", exercises: 7, duration: "62분", volume: "9,150kg" },
  { id: 3, name: "하체", date: "2일 전", exercises: 5, duration: "55분", volume: "11,060kg" },
  { id: 4, name: "어깨", date: "3일 전", exercises: 5, duration: "45분", volume: "4,820kg" },
]

function getMonthlyMessage(count: number) {
  if (count >= 20) return { text: "헬창이 되어가는구만... 🏆", color: "text-yellow-400" }
  if (count >= 13) return { text: "이미 남들과 다른 레벨 💀", color: "text-purple-400" }
  if (count >= 8) return { text: "못 말리는 거 아님? ⚡", color: "text-blue-400" }
  if (count >= 4) return { text: "이제 좀 진심이네 🔥", color: "text-orange-400" }
  return { text: "일단 시작했으면 됐어 👊", color: "text-green-400" }
}

const monthlyCount = 12

export default function DashboardPage() {
  const message = getMonthlyMessage(monthlyCount)

  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 pt-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Helper</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            오늘도 화이팅하세요! 🔥
          </p>
        </div>

        {/* Weekly Stats */}
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            이번 주 통계
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {weeklyStats.map((stat) => (
              <Card key={stat.label} className="bg-card border-border">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-medium text-primary">{stat.change}</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Monthly Card */}
        <Card className="mb-6 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">이번 달 운동</p>
                <p className="text-3xl font-bold text-primary">{monthlyCount}회</p>
                <p className={`text-xs font-medium mt-1 ${message.color}`}>
                  {message.text}
                </p>
              </div>
              <div className="flex gap-1">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-8 w-2 rounded-full ${i < 5 ? "bg-primary" : "bg-muted"}`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Workouts */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              최근 운동
            </h2>
            <button className="text-xs text-primary hover:underline hover:text-primary/80 transition-colors">
              전체보기
            </button>
          </div>
          <div className="space-y-3">
            {recentWorkouts.map((workout) => (
              <Card
                key={workout.id}
                className="bg-card border-border hover:bg-card/80 hover:border-primary/30 transition-all cursor-pointer"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{workout.name}</h3>
                        <span className="text-xs text-muted-foreground">{workout.date}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{workout.exercises}개 운동</span>
                        <span>•</span>
                        <span>{workout.duration}</span>
                        <span>•</span>
                        <span className="text-primary font-medium">{workout.volume}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}