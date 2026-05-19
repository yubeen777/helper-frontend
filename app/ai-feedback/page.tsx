"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bot, Sparkles, Clock, CheckCircle2, ChevronRight, RefreshCw } from "lucide-react"

interface FeedbackItem {
  id: number
  title: string
  date: string
  status: "pending" | "completed"
  summary?: string
  recommendations?: string[]
}

const feedbackHistory: FeedbackItem[] = [
  {
    id: 1,
    title: "가슴 & 삼두 운동 분석",
    date: "오늘",
    status: "completed",
    summary:
      "전반적으로 훌륭한 운동이었습니다. 볼륨이 지난주 대비 8% 증가했고, 벤치프레스 1RM이 2.5kg 상승한 것으로 추정됩니다.",
    recommendations: [
      "인클라인 벤치프레스 세트 간 휴식시간을 90초에서 120초로 늘려보세요",
      "케이블 플라이를 추가하면 가슴 안쪽 발달에 도움이 됩니다",
      "삼두 운동 볼륨이 부족합니다. 1-2세트 추가를 권장합니다",
    ],
  },
  {
    id: 2,
    title: "등 & 이두 운동 분석",
    date: "어제",
    status: "completed",
    summary:
      "데드리프트 폼이 개선되었습니다. 풀업 횟수가 지속적으로 증가하고 있어 좋은 진전입니다.",
    recommendations: [
      "바벨 로우 시 허리를 더 곧게 유지하세요",
      "이두 운동 시 슈퍼세트를 활용해보세요",
    ],
  },
  {
    id: 3,
    title: "하체 운동 분석",
    date: "3일 전",
    status: "pending",
  },
]

export default function AIFeedbackPage() {
  const [expandedId, setExpandedId] = useState<number | null>(1)
  const [isRequesting, setIsRequesting] = useState(false)

  const handleRequestFeedback = () => {
    setIsRequesting(true)
    setTimeout(() => {
      setIsRequesting(false)
      alert("피드백 요청이 완료되었습니다!")
    }, 2000)
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 pt-6">
        {/* Header */}
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

        {/* Request Feedback Button */}
        <Card className="mb-6 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">새 피드백 요청</p>
                  <p className="text-xs text-muted-foreground">
                    최근 운동에 대한 AI 분석 받기
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

        {/* Feedback History */}
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            피드백 기록
          </h2>
          <div className="space-y-3">
            {feedbackHistory.map((feedback) => (
              <Card
                key={feedback.id}
                className={`bg-card border-border transition-all cursor-pointer ${
                  expandedId === feedback.id ? "ring-1 ring-primary/50" : ""
                }`}
                onClick={() =>
                  setExpandedId(expandedId === feedback.id ? null : feedback.id)
                }
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {feedback.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground animate-pulse" />
                      )}
                      <CardTitle className="text-sm font-semibold text-foreground">
                        {feedback.title}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          feedback.status === "completed"
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {feedback.status === "completed" ? "완료" : "분석 중"}
                      </span>
                      <ChevronRight
                        className={`h-4 w-4 text-muted-foreground transition-transform ${
                          expandedId === feedback.id ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{feedback.date}</p>
                </CardHeader>
                {expandedId === feedback.id && feedback.status === "completed" && (
                  <CardContent className="pt-0">
                    <div className="border-t border-border pt-3 mt-2">
                      <p className="text-sm text-foreground mb-3">
                        {feedback.summary}
                      </p>
                      {feedback.recommendations && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                            추천 사항
                          </p>
                          <ul className="space-y-2">
                            {feedback.recommendations.map((rec, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-sm text-muted-foreground"
                              >
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] text-primary font-medium">
                                  {index + 1}
                                </span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
                {expandedId === feedback.id && feedback.status === "pending" && (
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
        </div>

        {/* Tips Card */}
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
                  세트당 무게와 횟수를 정확히 기록할수록 AI의 추천이 개인화됩니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
