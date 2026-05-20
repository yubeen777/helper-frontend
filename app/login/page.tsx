"use client";

import { useState } from "react";
import { Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { authApi, setToken } from "@/lib/api";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const res = await authApi.login({ email, password });
        setToken(res.accessToken);
        router.push("/");
      } else {
        await authApi.signup({ name, email, password });
        setIsLogin(true);
        setError("회원가입 완료! 로그인해주세요.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div
        className="flex items-center gap-3 mb-8 cursor-pointer"
        onClick={() => router.push("/")}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Flame className="h-7 w-7 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Helper</h1>
          <p className="text-xs text-muted-foreground">피트니스 트래킹</p>
        </div>
      </div>

      <Card className="w-full max-w-sm bg-card border-border">
        <CardContent className="p-6">
          <div className="flex mb-6 bg-muted rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                isLogin
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                !isLogin
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              회원가입
            </button>
          </div>

          {error && (
            <p
              className={`text-xs mb-4 text-center ${error.includes("완료") ? "text-primary" : "text-red-400"}`}
            >
              {error}
            </p>
          )}

          <div className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label className="text-sm text-foreground">이름</Label>
                <Input
                  placeholder="홍길동"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-sm text-foreground">이메일</Label>
              <Input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-foreground">비밀번호</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium mt-2"
            >
              {loading ? "처리 중..." : isLogin ? "로그인" : "회원가입"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
