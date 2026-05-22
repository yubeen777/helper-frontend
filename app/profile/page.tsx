"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, TrendingUp, Calendar, LogOut, ChevronRight } from "lucide-react";
import { getToken, removeToken, statsApi, workoutApi } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);
  const [totalSets, setTotalSets] = useState(0);
  const [workoutCount, setWorkoutCount] = useState(0);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    // localStorage에서 유저 정보 꺼내기
    setNickname(localStorage.getItem("nickname") || "사용자");
    setEmail(localStorage.getItem("email") || "");

    const fetchStats = async () => {
      try {
        const [weekly, workouts] = await Promise.all([
          statsApi.weekly(),
          workoutApi.getAll(),
        ]);
        setTotalWorkouts(weekly.totalWorkouts);
        setTotalVolume(weekly.totalVolume);
        setTotalSets(weekly.totalSets);
        setWorkoutCount(workouts.totalElements || 0);
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
  }, [router]);

  const handleLogout = () => {
    removeToken();
    localStorage.removeItem("nickname");
    localStorage.removeItem("email");
    router.push("/login");
  };

  const initials = nickname ? nickname.slice(0, 2).toUpperCase() : "HE";

  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 pt-6">
        {/* 프로필 헤더 */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">{nickname}</h1>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>
        </div>

        {/* 이번 주 통계 */}
        <Card className="mb-6 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">이번 주 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <Calendar className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{totalWorkouts}회</p>
                <p className="text-[10px] text-muted-foreground">운동 횟수</p>
              </div>
              <div className="text-center">
                <TrendingUp className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{totalVolume.toLocaleString()}kg</p>
                <p className="text-[10px] text-muted-foreground">총 볼륨</p>
              </div>
              <div className="text-center">
                <User className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{workoutCount}회</p>
                <p className="text-[10px] text-muted-foreground">누적 운동</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 메뉴 */}
        <div className="space-y-2 mb-6">
          <Card className="bg-card border-border hover:bg-card/80 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">프로필 정보</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 로그아웃 */}
        <Button
          variant="outline"
          className="w-full border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          로그아웃
        </Button>
      </div>
    </AppShell>
  );
}