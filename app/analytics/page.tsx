"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  CartesianGrid,
} from "recharts";
import { statsApi, workoutApi } from "@/lib/api";
import { Zap, TrendingUp, TrendingDown, Calendar } from "lucide-react";

const BODY_PART_KO: Record<string, string> = {
  CHEST: "가슴",
  BACK: "등",
  LEG: "하체",
  SHOULDER: "어깨",
  ARM: "팔",
  CORE: "코어",
  CARDIO: "유산소",
};

interface Exercise {
  id: number;
  name: string;
}

export default function AnalyticsPage() {
  const [volumeData, setVolumeData] = useState<
    { name: string; volume: number }[]
  >([]);
  const [weeklyData, setWeeklyData] = useState<{
    totalWorkouts: number;
    totalVolume: number;
    totalSets: number;
    lastWeekVolume: number;
    volumeChangeRate: number;
  } | null>(null);
  const [streakData, setStreakData] = useState<{
    streakDays: number;
    thisWeekWorkouts: number;
  } | null>(null);
  const [workoutDates, setWorkoutDates] = useState<string[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(
    null,
  );
  const [oneRMData, setOneRMData] = useState<{ date: string; oneRm: number }[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [volume, weekly, consistency, workouts, streak] =
          await Promise.all([
            statsApi.volume(),
            statsApi.weekly(),
            statsApi.consistency(),
            workoutApi.getAll(),
            statsApi.streak(),
          ]);

        setVolumeData(
          volume.map((v: { bodyPart: string; volume: number }) => ({
            name: BODY_PART_KO[v.bodyPart] || v.bodyPart,
            volume: Math.round(v.volume),
          })),
        );
        setWeeklyData(weekly);
        setStreakData(streak);
        setWorkoutDates(consistency.workoutDates || []);

        const exerciseMap = new Map<number, string>();
        workouts.content?.forEach(
          (workout: {
            workoutSets: { exerciseId: number; exerciseName: string }[];
          }) => {
            workout.workoutSets?.forEach((set) => {
              exerciseMap.set(set.exerciseId, set.exerciseName);
            });
          },
        );
        const exerciseList = Array.from(exerciseMap.entries()).map(
          ([id, name]) => ({ id, name }),
        );
        setExercises(exerciseList);
        if (exerciseList.length > 0) setSelectedExerciseId(exerciseList[0].id);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (!selectedExerciseId) return;
    const fetchOneRM = async () => {
      try {
        const data = await statsApi.oneRMTrend(selectedExerciseId);
        setOneRMData(
          data.map((d: { date: string; oneRm: number }) => ({
            date: d.date.slice(5),
            oneRm: Math.round(d.oneRm * 10) / 10,
          })),
        );
      } catch (e) {
        console.error(e);
      }
    };
    fetchOneRM();
  }, [selectedExerciseId]);

  // 달력 계산 (현재 월)
  const today = new Date();
  const calYear = today.getFullYear();
  const calMonth = today.getMonth();
  const monthLabel = `${calYear}년 ${calMonth + 1}월`;
  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay(); // 0=일
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const startOffset = (firstDayOfMonth + 6) % 7; // 월요일 기준

  const workoutDateSet = new Set(workoutDates);
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const isVolumeUp = (weeklyData?.volumeChangeRate ?? 0) >= 0;

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-screen">
          <p className="text-muted-foreground">데이터 불러오는 중...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">분석</h1>
          <p className="text-sm text-muted-foreground">
            운동 데이터를 분석하고 성장을 확인하세요
          </p>
        </div>

        {/* 통계 3개 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-3 text-center">
              <Zap className="h-4 w-4 text-orange-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">
                {streakData?.streakDays ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground">연속 운동일</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-3 text-center">
              {isVolumeUp ? (
                <TrendingUp className="h-4 w-4 text-primary mx-auto mb-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive mx-auto mb-1" />
              )}
              <p
                className={`text-2xl font-bold ${isVolumeUp ? "text-primary" : "text-destructive"}`}
              >
                {weeklyData?.lastWeekVolume === 0
                  ? "-"
                  : `${isVolumeUp ? "+" : ""}${weeklyData?.volumeChangeRate ?? 0}%`}
              </p>
              <p className="text-[10px] text-muted-foreground">볼륨 변화</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-3 text-center">
              <Calendar className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">
                {weeklyData?.totalWorkouts ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground">이번 주 운동</p>
            </CardContent>
          </Card>
        </div>

        {/* 부위별 볼륨 */}
        <Card className="mb-6 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">
              부위별 볼륨
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              이번 주 총 볼륨 (kg)
            </p>
          </CardHeader>
          <CardContent>
            {volumeData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                이번 주 운동 데이터가 없습니다
              </p>
            ) : (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={volumeData}
                    layout="vertical"
                    margin={{ top: 8, right: 56, bottom: 8, left: 8 }}
                    barCategoryGap={18}
                  >
                    <XAxis
                      type="number"
                      domain={[0, "dataMax"]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--foreground))", fontSize: 10 }}
                      tickFormatter={(v: number) => `${v.toLocaleString()}`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                      width={52}
                    />
                    <CartesianGrid
                      horizontal={false}
                      stroke="hsl(var(--border))"
                      strokeDasharray="3 3"
                      strokeOpacity={0.3}
                    />
                    <Tooltip
                      cursor={false}
                      content={({ active, payload }) => {
                        if (active && payload?.length) {
                          return (
                            <div
                              style={{
                                background: "#1a1a1a",
                                border: "1px solid #333",
                                borderRadius: 8,
                                padding: "6px 10px",
                              }}
                            >
                              <p style={{ color: "#888", fontSize: 12 }}>
                                {payload[0].payload.name}:{" "}
                                <span
                                  style={{ color: "#22c55e", fontWeight: 600 }}
                                >
                                  {Number(payload[0].value).toLocaleString()}kg
                                </span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="volume"
                      radius={[0, 4, 4, 0]}
                      barSize={22}
                      label={{
                        position: "right",
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 10,
                        formatter: (v: number) => `${v.toLocaleString()}`,
                      }}
                    >
                      {volumeData.map((_, index) => (
                        <Cell key={index} fill="#22c55e" fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 1RM 추세 */}
        <Card className="mb-6 bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-foreground">
                  1RM 추세
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  예상 1RM 변화 (Epley 공식)
                </p>
              </div>
              {exercises.length > 0 && (
                <select
                  value={selectedExerciseId ?? ""}
                  onChange={(e) =>
                    setSelectedExerciseId(Number(e.target.value))
                  }
                  className="text-xs bg-muted border border-border rounded px-2 py-1 text-foreground"
                >
                  {exercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {oneRMData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                데이터가 없습니다
              </p>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={oneRMData}
                    margin={{ top: 16, right: 16, bottom: 8, left: 0 }}
                  >
                    <CartesianGrid
                      stroke="#333333"
                      strokeDasharray="3 3"
                      strokeOpacity={0.6}
                    />

                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
                      width={40}
                      domain={["dataMin - 5", "dataMax + 5"]}
                      tickFormatter={(v) => `${Math.round(v)}`}
                    />
                    <Tooltip
                      cursor={{ stroke: "hsl(var(--border))" }}
                      content={({ active, payload, label }) => {
                        if (active && payload?.length) {
                          return (
                            <div
                              style={{
                                background: "#1a1a1a",
                                border: "1px solid #333",
                                borderRadius: 8,
                                padding: "6px 10px",
                              }}
                            >
                              <p style={{ color: "#888", fontSize: 11 }}>
                                {label}
                              </p>
                              <p
                                style={{
                                  color: "#22c55e",
                                  fontSize: 13,
                                  fontWeight: 600,
                                }}
                              >
                                {Number(payload[0].value).toFixed(1)}kg
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="oneRm"
                      stroke="#22c55e"
                      strokeWidth={2.5}
                      dot={{ fill: "#22c55e", strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      connectNulls
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 운동 달력 */}
        <Card className="mb-6 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">
              운동 달력
            </CardTitle>
            <p className="text-xs text-muted-foreground">{monthLabel}</p>
          </CardHeader>
          <CardContent>
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {["월", "화", "수", "목", "금", "토", "일"].map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] text-muted-foreground py-1 font-medium"
                >
                  {d}
                </div>
              ))}
            </div>
            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((day, i) => {
                if (!day) return <div key={i} />;
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const isToday = day === today.getDate();
                const worked = workoutDateSet.has(dateStr);
                return (
                  <div
                    key={i}
                    className={[
                      "aspect-square flex items-center justify-center rounded-md text-xs font-medium transition-colors",
                      worked
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/30 text-muted-foreground",
                      isToday && !worked
                        ? "ring-1 ring-primary text-primary"
                        : "",
                      isToday && worked ? "ring-2 ring-white/40" : "",
                    ]
                      .join(" ")
                      .trim()}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-muted" />
                <span className="text-[10px] text-muted-foreground">휴식</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-primary" />
                <span className="text-[10px] text-muted-foreground">운동</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
