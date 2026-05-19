"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  User, 
  Settings, 
  Medal, 
  TrendingUp, 
  Calendar, 
  LogOut,
  ChevronRight,
  Edit2
} from "lucide-react"

const achievements = [
  { name: "첫 운동", description: "첫 번째 운동 완료", earned: true },
  { name: "연속 7일", description: "7일 연속 운동", earned: true },
  { name: "연속 30일", description: "30일 연속 운동", earned: false },
  { name: "100kg 클럽", description: "스쿼트 100kg 달성", earned: true },
  { name: "볼륨 왕", description: "주간 볼륨 50,000kg 달성", earned: false },
]

const stats = [
  { label: "총 운동 횟수", value: "87회", icon: Calendar },
  { label: "총 볼륨", value: "245,680kg", icon: TrendingUp },
  { label: "최장 연속", value: "12일", icon: Medal },
]

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(true)

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 pt-6">
        {/* Profile Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                JK
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">김정우</h1>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Edit2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">@jungwoo_fit</p>
              <p className="text-xs text-primary mt-1">프리미엄 회원</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-card border-border">
              <CardContent className="p-3 text-center">
                <stat.icon className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Achievements */}
        <Card className="mb-6 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Medal className="h-4 w-4 text-primary" />
              업적
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {achievements.map((achievement) => (
                <div
                  key={achievement.name}
                  className={`flex-shrink-0 w-20 text-center p-2 rounded-lg ${
                    achievement.earned
                      ? "bg-primary/20"
                      : "bg-muted opacity-50"
                  }`}
                >
                  <div
                    className={`h-10 w-10 mx-auto rounded-full flex items-center justify-center mb-1 ${
                      achievement.earned ? "bg-primary" : "bg-muted-foreground/20"
                    }`}
                  >
                    <Medal
                      className={`h-5 w-5 ${
                        achievement.earned
                          ? "text-primary-foreground"
                          : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <p className="text-[10px] font-medium text-foreground truncate">
                    {achievement.name}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <div className="space-y-2 mb-6">
          {[
            { icon: User, label: "프로필 수정", href: "#" },
            { icon: Settings, label: "설정", href: "#" },
          ].map((item) => (
            <Card
              key={item.label}
              className="bg-card border-border hover:bg-card/80 transition-colors cursor-pointer"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={() => setIsLoggedIn(false)}
        >
          <LogOut className="h-4 w-4 mr-2" />
          로그아웃
        </Button>
      </div>
    </AppShell>
  )
}

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin()
  }

  return (
    <AppShell showNav={false}>
      <div className="mx-auto max-w-md px-4 pt-12">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary mb-4">
            <span className="text-3xl font-bold text-primary-foreground">H</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Helper</h1>
          <p className="text-sm text-muted-foreground mt-1">
            당신의 피트니스 파트너
          </p>
        </div>

        {/* Auth Card */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-foreground text-center">
              {isSignUp ? "회원가입" : "로그인"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    이름
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full h-11 px-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  이메일
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full h-11 px-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  비밀번호
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button type="submit" className="w-full h-11">
                {isSignUp ? "가입하기" : "로그인"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {isSignUp
                  ? "이미 계정이 있으신가요? 로그인"
                  : "계정이 없으신가요? 회원가입"}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Social Login */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">
                또는
              </span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Button
              variant="outline"
              className="w-full h-11 border-border"
              type="button"
              onClick={onLogin}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google로 계속하기
            </Button>
            <Button
              variant="outline"
              className="w-full h-11 border-border"
              type="button"
              onClick={onLogin}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              Apple로 계속하기
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
