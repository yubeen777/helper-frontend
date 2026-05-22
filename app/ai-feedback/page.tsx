"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Sparkles,
  Clock,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { feedbackApi } from "@/lib/api";

interface FeedbackItem {
  id: number;
  feedbackType: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  summary?: string;
  analysis?: string;
  routine?: string;
  nutrition?: string;
  nextWeekGoal?: string;
  createdAt: string;
}

export default function AIFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchFeedbacks = async () => {
    try {
      const data = await feedbackApi.getAll();
      setFeedbacks(data);
      if (data.length > 0) setExpandedId(data[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleRequestFeedback = async () => {
    setIsRequesting(true);
    try {
      await feedbackApi.request("WEEKLY");
      await fetchFeedbacks();
    } catch (e) {
      console.error(e);
      alert("피드백 요청 중 오류가 발생했습니다.");
    } finally {
      setIsRequesting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diff = Math.floor(
      (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diff === 0) return "오늘";
    if (diff === 1) return "어제";
    return `${diff}일 전`;
  };

  const getFeedbackTypeLabel = (type: string) => {
    if (type === "WEEKLY") return "주간 운동 분석";
    if (type === "SESSION") return "세션 운동 분석";
    return type;
  };

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
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">AI 피드백</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            AI가 분석한 운동 피드백을 확인하세요
          </p>
        </div>

        {/* 피드백 요청 카드 */}
        <Card className="mb-6 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    새 피드백 요청
                  </p>
                  <p className="text-xs text-muted-foreground">
                    이번 주 운동에 대한 AI 분석 받기
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleRequestFeedback}
                disabled={isRequesting}
              >
                {isRequesting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  "요청"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 피드백 목록 */}
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            피드백 기록
          </h2>
          {feedbacks.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <Bot className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  아직 피드백이 없습니다
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  위 버튼으로 첫 피드백을 요청해보세요
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((feedback) => (
                <Card
                  key={feedback.id}
                  className={`bg-card border-border transition-all cursor-pointer ${
                    expandedId === feedback.id ? "ring-1 ring-primary/50" : ""
                  }`}
                  onClick={() =>
                    setExpandedId(
                      expandedId === feedback.id ? null : feedback.id,
                    )
                  }
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {feedback.status === "COMPLETED" ? (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        ) : feedback.status === "FAILED" ? (
                          <XCircle className="h-4 w-4 text-destructive" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground animate-pulse" />
                        )}
                        <CardTitle className="text-sm font-semibold text-foreground">
                          {getFeedbackTypeLabel(feedback.feedbackType)}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            feedback.status === "COMPLETED"
                              ? "bg-primary/20 text-primary"
                              : feedback.status === "FAILED"
                                ? "bg-destructive/20 text-destructive"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {feedback.status === "COMPLETED"
                            ? "완료"
                            : feedback.status === "FAILED"
                              ? "실패"
                              : "분석 중"}
                        </span>
                        <ChevronRight
                          className={`h-4 w-4 text-muted-foreground transition-transform ${expandedId === feedback.id ? "rotate-90" : ""}`}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(feedback.createdAt)}
                    </p>
                  </CardHeader>

                  {expandedId === feedback.id &&
                    feedback.status === "COMPLETED" && (
                      <CardContent className="pt-0">
                        <div className="border-t border-border pt-3 mt-2 space-y-3">
                          {feedback.summary && (
                            <p className="text-sm text-foreground">
                              {feedback.summary}
                            </p>
                          )}
                          {feedback.analysis && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                                분석
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {feedback.analysis}
                              </p>
                            </div>
                          )}
                          {feedback.routine && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                                루틴 추천
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {feedback.routine}
                              </p>
                            </div>
                          )}
                          {feedback.nutrition && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                                영양 조언
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {feedback.nutrition}
                              </p>
                            </div>
                          )}
                          {feedback.nextWeekGoal && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                                다음 주 목표
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {feedback.nextWeekGoal}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    )}

                  {expandedId === feedback.id &&
                    feedback.status === "PENDING" && (
                      <CardContent className="pt-0">
                        <div className="border-t border-border pt-3 mt-2">
                          <div className="flex items-center justify-center py-6">
                            <div className="text-center">
                              <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">
                                AI가 운동 데이터를 분석 중입니다...
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                약 1-2분 소요됩니다
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 팁 카드 */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">
                  AI 피드백 활용 팁
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  운동 직후 피드백을 요청하면 더 정확한 분석을 받을 수 있습니다.
                  세트당 무게와 횟수를 정확히 기록할수록 AI의 추천이
                  개인화됩니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
