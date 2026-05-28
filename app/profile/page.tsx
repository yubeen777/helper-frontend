"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User, LogOut, ChevronRight, X, Lock, Trash2, Zap, Calendar, Dumbbell,
} from "lucide-react";
import { getToken, removeToken, statsApi, workoutApi, userApi } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [streakDays, setStreakDays] = useState(0);
  const [thisWeekWorkouts, setThisWeekWorkouts] = useState(0);
  const [totalWorkoutCount, setTotalWorkoutCount] = useState(0);

  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const [savingNickname, setSavingNickname] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    setNickname(localStorage.getItem("nickname") || "사용자");
    setEmail(localStorage.getItem("email") || "");

    const fetchStats = async () => {
      try {
        const [streak, workouts] = await Promise.all([
          statsApi.streak(),
          workoutApi.getAll(),
        ]);
        setStreakDays(streak.streakDays ?? 0);
        setThisWeekWorkouts(streak.thisWeekWorkouts ?? 0);
        setTotalWorkoutCount(workouts.totalElements || 0);
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

  const handleSaveNickname = async () => {
    if (!newNickname.trim()) return;
    setSavingNickname(true);
    try {
      await userApi.updateMe(newNickname.trim());
      setNickname(newNickname.trim());
      localStorage.setItem("nickname", newNickname.trim());
      setShowNicknameModal(false);
    } catch (e) {
      console.error(e);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setSavingNickname(false);
    }
  };

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword) return;
    setSavingPassword(true);
    try {
      await userApi.updatePassword(currentPassword, newPassword);
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      alert("비밀번호가 변경되었습니다.");
    } catch (e) {
      console.error(e);
      alert("현재 비밀번호가 올바르지 않습니다.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await userApi.deleteMe();
      removeToken();
      localStorage.removeItem("nickname");
      localStorage.removeItem("email");
      router.push("/login");
    } catch (e) {
      console.error(e);
      alert("오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  const initials = nickname ? nickname.slice(0, 1) : "H";

  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 pt-6">

        {/* 닉네임 수정 모달 */}
        {showNicknameModal && (
          <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center px-4">
            <Card className="w-full max-w-sm bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-foreground">닉네임 수정</CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowNicknameModal(false)}>
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
                  <Button variant="outline" className="flex-1" onClick={() => setShowNicknameModal(false)}>취소</Button>
                  <Button
                    className="flex-1"
                    onClick={handleSaveNickname}
                    disabled={savingNickname || !newNickname.trim()}
                  >
                    {savingNickname ? "저장 중..." : "저장"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 비밀번호 변경 모달 */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center px-4">
            <Card className="w-full max-w-sm bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-foreground">비밀번호 변경</CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowPasswordModal(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="현재 비밀번호"
                  className="bg-muted border-border"
                  autoFocus
                />
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="새 비밀번호"
                  className="bg-muted border-border"
                />
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowPasswordModal(false)}>취소</Button>
                  <Button
                    className="flex-1"
                    onClick={handleSavePassword}
                    disabled={savingPassword || !currentPassword || !newPassword}
                  >
                    {savingPassword ? "변경 중..." : "변경"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 회원탈퇴 확인 모달 */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center px-4">
            <Card className="w-full max-w-sm bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-foreground">회원탈퇴</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  탈퇴 시 모든 운동 기록과 데이터가 삭제됩니다. 정말 탈퇴하시겠습니까?
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowDeleteModal(false)}>취소</Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                  >
                    {deleting ? "처리 중..." : "탈퇴하기"}
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

        {/* 통계 3개 */}
        <Card className="mb-6 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">나의 기록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <Zap className="h-4 w-4 text-orange-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{streakDays}일</p>
                <p className="text-[10px] text-muted-foreground">연속 운동</p>
              </div>
              <div>
                <Calendar className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{thisWeekWorkouts}회</p>
                <p className="text-[10px] text-muted-foreground">이번 주 운동</p>
              </div>
              <div>
                <Dumbbell className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{totalWorkoutCount}회</p>
                <p className="text-[10px] text-muted-foreground">누적 운동</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 메뉴 */}
        <div className="space-y-2 mb-6">
          <Card
            className="bg-card border-border hover:bg-card/80 transition-colors cursor-pointer"
            onClick={() => { setNewNickname(nickname); setShowNicknameModal(true); }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">닉네임 수정</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card
            className="bg-card border-border hover:bg-card/80 transition-colors cursor-pointer"
            onClick={() => setShowPasswordModal(true)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">비밀번호 변경</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 로그아웃 */}
        <Button
          variant="outline"
          className="w-full border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground mb-3"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          로그아웃
        </Button>

        {/* 회원탈퇴 */}
        <Button
          variant="ghost"
          className="w-full text-muted-foreground hover:text-destructive text-xs"
          onClick={() => setShowDeleteModal(true)}
        >
          <Trash2 className="h-3 w-3 mr-1" />
          회원탈퇴
        </Button>
      </div>
    </AppShell>
  );
}