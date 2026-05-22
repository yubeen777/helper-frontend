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

const BODY_PART_KO: Record<string, string> = {
  CHEST: "가슴",
  BACK: "등",
  LEG: "하체",
  SHOULDER: "어깨",
  ARM: "팔",
  CORE: "코어",
};

interface Exercise {
  id: number;
  name: string;
}

export default function AnalyticsPage() {
  const [volumeData, setVolumeData] = useState<{ name: string; volume: number }[]>([]);
  const [weeklyData, setWeeklyData] = useState<{
    totalWorkouts: number;
    totalVolume: number;
    totalSets: number;
  } | null>(null);
  const [consistencyData, setConsistencyData] = useState<{ day: string; weeks: boolean[] }[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  const [oneRMData, setOneRMData] = useState<{ date: string; oneRm: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [volume, weekly, consistency, workouts] = await Promise.all([
          statsApi.volume(),
          statsApi.weekly(),
          statsApi.consistency(),
          workoutApi.getAll(),
        ]);

        setVolumeData(
          volume.map((v: { bodyPart: string; volume: number }) => ({
            name: BODY_PART_KO[v.bodyPart] || v.bodyPart,
            volume: v.volume,
          }))
        );

        setWeeklyData(weekly);

        const today = new Date();
        const days = ["월", "화", "수", "목", "금", "토", "일"];
        const workoutSet = new Set(consistency.workoutDates as string[]);
        const heatmap = days.map((day, dayIndex) => {
          const weeks = [0, 1, 2, 3].map((weekOffset) => {
            const monday = new Date(today);
            monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) - weekOffset * 7);
            const targetDate = new Date(monday);
            targetDate.setDate(monday.getDate() + dayIndex);
            return workoutSet.has(targetDate.toISOString().split("T")[0]);
          });
          return { day, weeks };
        });
        setConsistencyData(heatmap);

        const exerciseMap = new Map<number, string>();
        workouts.content?.forEach(
          (workout: { workoutSets: { exerciseId: number; exerciseName: string }[] }) => {
            workout.workoutSets?.forEach((set) => {
              exerciseMap.set(set.exerciseId, set.exerciseName);
            });
          }
        );
        const exerciseList = Array.from(exerciseMap.entries()).map(([id, name]) => ({ id, name }));
        setExercises(exerciseList);

        if (exerciseList.length > 0) {
          setSelectedExerciseId(exerciseList[0].id);
        }
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
            oneRm: d.oneRm,
          }))
        );
      } catch (e) {
        console.error(e);
      }
    };
    fetchOneRM();
  }, [selectedExerciseId]);

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
          <p className="text-sm text-muted-foreground">운동 데이터를 분석하고 성장을 확인하세요</p>
        </div>

        {weeklyData && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card className="bg-card border-border">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-primary">{weeklyData.totalWorkouts}</p>
                <p className="text-xs text-muted-foreground">이번 주 운동</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{weeklyData.totalVolume.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">총 볼륨(kg)</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{weeklyData.totalSets}</p>
                <p className="text-xs text-muted-foreground">총 세트</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 부위별 볼륨 */}
        <Card className="mb-6 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">부위별 볼륨</CardTitle>
            <p className="text-xs text-muted-foreground">이번 주 총 볼륨 (kg)</p>
          </CardHeader>
          <CardContent>
            {volumeData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">이번 주 운동 데이터가 없습니다</p>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={volumeData}
                    layout="vertical"
                    margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
                    barCategoryGap={18}
                  >
                    <XAxis type="number" hide domain={[0, "dataMax"]} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                      width={64}
                    />
                    <Tooltip
                      cursor={false}
                      content={({ active, payload }) => {
                        if (active && payload?.length) {
                          return (
                            <div style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: "6px 10px" }}>
                              <p style={{ color: "#888", fontSize: 12 }}>
                                {payload[0].payload.name}:{" "}
                                <span style={{ color: "#22c55e", fontWeight: 600 }}>
                                  {Number(payload[0].value).toLocaleString()}kg
                                </span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="volume" radius={[0, 4, 4, 0]} barSize={28}>
                      {volumeData.map((_, index) => (
                        <Cell key={index} fill="#22c55e" fillOpacity={0.75} />
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
                <CardTitle className="text-base font-semibold text-foreground">1RM 추세</CardTitle>
                <p className="text-xs text-muted-foreground">예상 1RM 변화</p>
              </div>
              {exercises.length > 0 && (
                <select
                  value={selectedExerciseId ?? ""}
                  onChange={(e) => setSelectedExerciseId(Number(e.target.value))}
                  className="text-xs bg-muted border border-border rounded px-2 py-1 text-foreground"
                >
                  {exercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </select>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {oneRMData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">데이터가 없습니다</p>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={oneRMData} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--foreground))", fontSize: 10 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--foreground))", fontSize: 10 }}
                      width={40}
                      domain={["dataMin - 5", "dataMax + 5"]}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ stroke: "hsl(var(--border))" }}
                      content={({ active, payload, label }) => {
                        if (active && payload?.length) {
                          return (
                            <div style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: "6px 10px" }}>
                              <p style={{ color: "#888", fontSize: 11 }}>{label}</p>
                              <p style={{ color: "#22c55e", fontSize: 12, fontWeight: 600 }}>{payload[0].value}kg</p>
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

        {/* 운동 일관성 히트맵 */}
        <Card className="mb-6 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">운동 일관성</CardTitle>
            <p className="text-xs text-muted-foreground">최근 4주간 운동 기록</p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-muted-foreground">4주 전</span>
              <span className="text-xs text-muted-foreground">이번 주</span>
            </div>
            <div className="space-y-2">
              {consistencyData.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 text-xs text-muted-foreground">{row.day}</span>
                  <div className="flex flex-1 gap-1">
                    {[...row.weeks].reverse().map((worked, j) => (
                      <div
                        key={j}
                        className={`flex-1 h-8 rounded-md transition-colors ${worked ? "bg-primary" : "bg-muted"}`}
                      />
                    ))}
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
      </div>
    </AppShell>
  );
}