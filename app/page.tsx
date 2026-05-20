"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Weight, Layers, ChevronRight, Flame } from "lucide-react";
import { statsApi, workoutApi, getToken } from "@/lib/api";

function getMonthlyMessage(count: number) {
  if (count >= 20)
    return { text: "헬창이 되어가는구만... 🏆", color: "text-yellow-400" };
  if (count >= 13)
    return { text: "이미 남들과 다른 레벨 💀", color: "text-purple-400" };
  if (count >= 8)
    return { text: "못 말리는 거 아님? ⚡", color: "text-blue-400" };
  if (count >= 4)
    return { text: "이제 좀 진심이네 🔥", color: "text-orange-400" };
  return { text: "일단 시작했으면 됐어 👊", color: "text-green-400" };
}

export default function DashboardPage() {
  const router = useRouter();
  const [weekly, setWeekly] = useState<{
    workoutCount: number;
    totalVolume: number;
    totalSets: number;
  } | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<
    { id: number; memo: string; createdAt: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [weeklyData, workoutsData] = await Promise.all([
          statsApi.weekly(),
          workoutApi.getAll(),
        ]);
        setWeekly(weeklyData);
        setRecentWorkouts((workoutsData.content || []).slice(0, 4));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const monthlyCount = recentWorkouts.length;
  const message = getMonthlyMessage(monthlyCount);

  const weeklyStats = [
    {
      label: "운동 횟수",
      value: `${weekly?.workoutCount ?? 0}회`,
      icon: Dumbbell,
    },
    {
      label: "총 볼륨",
      value: `${weekly?.totalVolume?.toLocaleString() ?? 0}kg`,
      icon: Weight,
    },
    { label: "총 세트", value: `${weekly?.totalSets ?? 0}세트`, icon: Layers },
  ];

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-screen">
          <p className="text-muted-foreground">불러오는 중...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 pt-6">
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
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="mb-6 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  이번 달 운동
                </p>
                <p className="text-3xl font-bold text-primary">
                  {monthlyCount}회
                </p>
                <p className={`text-xs font-medium mt-1 ${message.color}`}>
                  {message.text}
                </p>
              </div>
              <div className="flex gap-1">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-8 w-2 rounded-full ${i < monthlyCount % 7 ? "bg-primary" : "bg-muted"}`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              최근 운동
            </h2>
            <button className="text-xs text-primary hover:underline transition-colors">
              전체보기
            </button>
          </div>
          {recentWorkouts.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground text-sm">
                  아직 운동 기록이 없어요
                </p>
                <button
                  onClick={() => router.push("/workout")}
                  className="mt-3 text-xs text-primary hover:underline"
                >
                  첫 운동 기록하러 가기 →
                </button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentWorkouts.map((workout) => (
                <Card
                  key={workout.id}
                  className="bg-card border-border hover:bg-card/80 hover:border-primary/30 transition-all cursor-pointer"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {workout.memo || "운동 기록"}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(workout.createdAt).toLocaleDateString(
                            "ko-KR",
                          )}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
