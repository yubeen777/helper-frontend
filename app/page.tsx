"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, ChevronRight, Flame, Zap, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { statsApi, workoutApi, getToken } from "@/lib/api";

function getMonthlyMessage(count: number) {
  if (count >= 20) return { text: "헬창이 되어가는구만... 🏆", color: "text-yellow-400" };
  if (count >= 13) return { text: "이미 남들과 다른 레벨 💀", color: "text-purple-400" };
  if (count >= 8) return { text: "못 말리는 거 아님? ⚡", color: "text-blue-400" };
  if (count >= 4) return { text: "이제 좀 진심이네 🔥", color: "text-orange-400" };
  return { text: "일단 시작했으면 됐어 👊", color: "text-green-400" };
}

interface WorkoutItem {
  id: number;
  memo: string;
  workoutDate: string;
  createdAt: string;
  workoutSets?: { exerciseName: string; setNumber: number; weight: number; reps: number }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [weekly, setWeekly] = useState<{
    totalWorkouts: number;
    totalVolume: number;
    totalSets: number;
    lastWeekVolume: number;
    volumeChangeRate: number;
  } | null>(null);
  const [streak, setStreak] = useState<{ streakDays: number; thisWeekWorkouts: number } | null>(null);
  const [allWorkouts, setAllWorkouts] = useState<WorkoutItem[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutItem | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    const fetchData = async () => {
      try {
        const [weeklyData, workoutsData, streakData] = await Promise.all([
          statsApi.weekly(),
          workoutApi.getAll(),
          statsApi.streak(),
        ]);
        setWeekly(weeklyData);
        setStreak(streakData);
        setAllWorkouts(workoutsData.content || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleWorkoutClick = async (workout: WorkoutItem) => {
    setLoadingDetail(true);
    try {
      const detail = await workoutApi.getOne(workout.id);
      setSelectedWorkout(detail);
    } catch (e) {
      console.error(e);
      setSelectedWorkout(workout);
    } finally {
      setLoadingDetail(false);
    }
  };

  // 이번 달 운동 횟수
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthlyCount = allWorkouts.filter((w) =>
    (w.workoutDate || w.createdAt?.split("T")[0] || "").startsWith(thisMonth)
  ).length;

  const message = getMonthlyMessage(monthlyCount);
  const displayWorkouts = showAll ? allWorkouts : allWorkouts.slice(0, 4);
  const isVolumeUp = (weekly?.volumeChangeRate ?? 0) >= 0;

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
      {/* 운동 상세 모달 */}
      {selectedWorkout && (
        <div
          className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-end justify-center"
          onClick={() => setSelectedWorkout(null)}
        >
          <div
            className="w-full max-w-md bg-card border border-border rounded-t-2xl p-5 max-h-[75vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-foreground text-lg">
                  {selectedWorkout.memo || "운동 기록"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedWorkout.workoutDate ||
                    new Date(selectedWorkout.createdAt).toLocaleDateString("ko-KR")}
                </p>
              </div>
              <button
                onClick={() => setSelectedWorkout(null)}
                className="text-muted-foreground hover:text-foreground text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {selectedWorkout.workoutSets && selectedWorkout.workoutSets.length > 0 ? (
              <div className="space-y-3">
                {Object.entries(
                  selectedWorkout.workoutSets.reduce(
                    (acc, set) => {
                      if (!acc[set.exerciseName]) acc[set.exerciseName] = [];
                      acc[set.exerciseName].push(set);
                      return acc;
                    },
                    {} as Record<string, typeof selectedWorkout.workoutSets>,
                  ),
                ).map(([exerciseName, sets]) => (
                  <div key={exerciseName} className="bg-muted/30 rounded-lg p-3">
                    <p className="font-semibold text-foreground text-sm mb-2">{exerciseName}</p>
                    <div className="grid grid-cols-3 text-xs text-muted-foreground mb-1 px-1">
                      <span>세트</span>
                      <span>무게</span>
                      <span>횟수</span>
                    </div>
                    {sets.map((set, i) => (
                      <div key={i} className="grid grid-cols-3 text-sm py-1 border-t border-border/30">
                        <span className="text-muted-foreground">{set.setNumber}세트</span>
                        <span className="font-medium text-foreground">{set.weight}kg</span>
                        <span className="text-foreground">{set.reps}회</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                세트 데이터가 없습니다
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-md px-4 pt-6">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Helper</h1>
          </div>
          <p className="text-sm text-muted-foreground">오늘도 화이팅하세요! 🔥</p>
        </div>

        {/* 통계 3개 */}
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            이번 주
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {/* 연속 운동일 */}
            <Card className="bg-card border-border">
              <CardContent className="p-3">
                <Zap className="h-4 w-4 text-orange-400 mb-2" />
                <p className="text-lg font-bold text-foreground">
                  {streak?.streakDays ?? 0}일
                </p>
                <p className="text-[10px] text-muted-foreground">연속 운동</p>
              </CardContent>
            </Card>

            {/* 볼륨 변화 */}
            <Card className="bg-card border-border">
              <CardContent className="p-3">
                {isVolumeUp
                  ? <TrendingUp className="h-4 w-4 text-primary mb-2" />
                  : <TrendingDown className="h-4 w-4 text-destructive mb-2" />}
                <p className={`text-lg font-bold ${isVolumeUp ? "text-primary" : "text-destructive"}`}>
                  {weekly?.lastWeekVolume === 0
                    ? "-"
                    : `${isVolumeUp ? "▲" : "▼"}${Math.abs(weekly?.volumeChangeRate ?? 0)}%`}
                </p>
                <p className="text-[10px] text-muted-foreground">볼륨 변화</p>
              </CardContent>
            </Card>

            {/* 이번 주 운동 횟수 */}
            <Card className="bg-card border-border">
              <CardContent className="p-3">
                <Calendar className="h-4 w-4 text-primary mb-2" />
                <p className="text-lg font-bold text-foreground">
                  {streak?.thisWeekWorkouts ?? weekly?.totalWorkouts ?? 0}회
                </p>
                <p className="text-[10px] text-muted-foreground">이번 주 운동</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 이번 달 카드 */}
        <Card className="mb-6 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">이번 달 운동</p>
                <p className="text-3xl font-bold text-primary">{monthlyCount}회</p>
                <p className={`text-xs font-medium mt-1 ${message.color}`}>{message.text}</p>
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

        {/* 최근 운동 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              최근 운동
            </h2>
            {allWorkouts.length > 4 && (
              <button
                className="text-xs text-primary hover:underline transition-colors"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "접기" : "전체보기"}
              </button>
            )}
          </div>

          {displayWorkouts.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground text-sm">아직 운동 기록이 없어요</p>
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
              {displayWorkouts.map((workout) => (
                <Card
                  key={workout.id}
                  className="bg-card border-border hover:bg-card/80 hover:border-primary/30 transition-all cursor-pointer"
                  onClick={() => handleWorkoutClick(workout)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Dumbbell className="h-4 w-4 text-primary flex-shrink-0" />
                          <h3 className="font-semibold text-foreground">
                            {workout.memo || "운동 기록"}
                          </h3>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 pl-6">
                          {workout.workoutDate ||
                            new Date(workout.createdAt).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
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
