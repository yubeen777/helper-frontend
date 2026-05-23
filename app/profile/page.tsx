"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, TrendingUp, Calendar, LogOut, ChevronRight, X, Check } from "lucide-react";
import { getToken, removeToken, statsApi, workoutApi, userApi } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
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

  const handleEditOpen = () => {
    setNewNickname(nickname);
    setShowEditModal(true);
  };

  const handleSaveNickname = async () => {
    if (!newNickname.trim()) return;
    setSaving(true);
    try {
      await userApi.updateMe(newNickname.trim());
      setNickname(newNickname.trim());
      localStorage.setItem("nickname", newNickname.trim());
      setShowEditModal(false);
    } catch (e) {
      console.error(e);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const initials = nickname ? nickname.slice(0, 1) : "H";

  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 pt-6">
        {/* 닉네임 수정 모달 */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center px-4">
            <Card className="w-full max-w-sm bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-foreground">닉네임 수정</CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowEditModal(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  placeholder="새 닉네임 입력"
                  className="bg-muted border-border"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowEditModal(false)}
                  >
                    취소
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSaveNickname}
                    disabled={saving || !newNickname.trim()}
                  >
                    {saving ? "저장 중..." : "저장"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <Calendar className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{totalWorkouts}회</p>
                <p className="text-[10px] text-muted-foreground">이번 주 운동</p>
              </div>
              <div className="text-center">
                <TrendingUp className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{totalVolume.toLocaleString()}kg</p>
                <p className="text-[10px] text-muted-foreground">총 볼륨</p>
              </div>
            </div>
            <div className="mt-3 text-center border-t border-border pt-3">
              <User className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{workoutCount}회</p>
              <p className="text-[10px] text-muted-foreground">누적 운동</p>
            </div>
          </CardContent>
        </Card>

        {/* 메뉴 */}
        <div className="space-y-2 mb-6">
          <Card
            className="bg-card border-border hover:bg-card/80 transition-colors cursor-pointer"
            onClick={handleEditOpen}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">프로필 정보 수정</span>
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