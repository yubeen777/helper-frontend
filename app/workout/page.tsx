"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, X, Check, Dumbbell } from "lucide-react"

const exerciseDatabase = [
  { id: 1, name: "벤치프레스", bodyPart: "가슴", equipment: "바벨" },
  { id: 2, name: "인클라인 벤치프레스", bodyPart: "가슴", equipment: "바벨" },
  { id: 3, name: "덤벨 플라이", bodyPart: "가슴", equipment: "덤벨" },
  { id: 4, name: "케이블 크로스오버", bodyPart: "가슴", equipment: "케이블" },
  { id: 5, name: "데드리프트", bodyPart: "등", equipment: "바벨" },
  { id: 6, name: "풀업", bodyPart: "등", equipment: "맨몸" },
  { id: 7, name: "바벨 로우", bodyPart: "등", equipment: "바벨" },
  { id: 8, name: "랫 풀다운", bodyPart: "등", equipment: "머신" },
  { id: 9, name: "스쿼트", bodyPart: "하체", equipment: "바벨" },
  { id: 10, name: "레그 프레스", bodyPart: "하체", equipment: "머신" },
  { id: 11, name: "레그 컬", bodyPart: "하체", equipment: "머신" },
  { id: 12, name: "레그 익스텐션", bodyPart: "하체", equipment: "머신" },
  { id: 13, name: "숄더 프레스", bodyPart: "어깨", equipment: "바벨" },
  { id: 14, name: "사이드 레터럴 레이즈", bodyPart: "어깨", equipment: "덤벨" },
  { id: 15, name: "바벨 컬", bodyPart: "팔", equipment: "바벨" },
  { id: 16, name: "트라이셉 푸쉬다운", bodyPart: "팔", equipment: "케이블" },
]

interface SetData {
  id: number
  weight: string
  reps: string
  completed: boolean
}

interface ExerciseEntry {
  exercise: typeof exerciseDatabase[0]
  sets: SetData[]
}

export default function WorkoutPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [workoutExercises, setWorkoutExercises] = useState<ExerciseEntry[]>([])
  const [workoutStarted, setWorkoutStarted] = useState(false)

  const filteredExercises = exerciseDatabase.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.bodyPart.includes(searchQuery) ||
      exercise.equipment.includes(searchQuery)
  )

  const addExercise = (exercise: typeof exerciseDatabase[0]) => {
    setWorkoutExercises((prev) => [
      ...prev,
      {
        exercise,
        sets: [{ id: 1, weight: "", reps: "", completed: false }],
      },
    ])
    setShowSearch(false)
    setSearchQuery("")
    if (!workoutStarted) setWorkoutStarted(true)
  }

  const removeExercise = (index: number) => {
    setWorkoutExercises((prev) => prev.filter((_, i) => i !== index))
  }

  const addSet = (exerciseIndex: number) => {
    setWorkoutExercises((prev) =>
      prev.map((entry, i) =>
        i === exerciseIndex
          ? {
              ...entry,
              sets: [
                ...entry.sets,
                {
                  id: entry.sets.length + 1,
                  weight: entry.sets[entry.sets.length - 1]?.weight || "",
                  reps: "",
                  completed: false,
                },
              ],
            }
          : entry
      )
    )
  }

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: "weight" | "reps",
    value: string
  ) => {
    setWorkoutExercises((prev) =>
      prev.map((entry, i) =>
        i === exerciseIndex
          ? {
              ...entry,
              sets: entry.sets.map((set, j) =>
                j === setIndex ? { ...set, [field]: value } : set
              ),
            }
          : entry
      )
    )
  }

  const toggleSetComplete = (exerciseIndex: number, setIndex: number) => {
    setWorkoutExercises((prev) =>
      prev.map((entry, i) =>
        i === exerciseIndex
          ? {
              ...entry,
              sets: entry.sets.map((set, j) =>
                j === setIndex ? { ...set, completed: !set.completed } : set
              ),
            }
          : entry
      )
    )
  }

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    setWorkoutExercises((prev) =>
      prev.map((entry, i) =>
        i === exerciseIndex
          ? {
              ...entry,
              sets: entry.sets.filter((_, j) => j !== setIndex),
            }
          : entry
      )
    )
  }

  const saveWorkout = () => {
    alert("운동이 저장되었습니다! 🎉")
    setWorkoutExercises([])
    setWorkoutStarted(false)
  }

  const totalVolume = workoutExercises.reduce((total, entry) => {
    return (
      total +
      entry.sets.reduce((setTotal, set) => {
        if (set.completed && set.weight && set.reps) {
          return setTotal + parseFloat(set.weight) * parseInt(set.reps)
        }
        return setTotal
      }, 0)
    )
  }, 0)

  const completedSets = workoutExercises.reduce(
    (total, entry) =>
      total + entry.sets.filter((set) => set.completed).length,
    0
  )

  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 pt-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">운동 기록</h1>
          <p className="text-sm text-muted-foreground">
            {workoutStarted
              ? `${workoutExercises.length}개 운동 • ${completedSets}세트 완료`
              : "운동을 추가하여 시작하세요"}
          </p>
        </div>

        {/* Quick Stats */}
        {workoutStarted && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Card className="bg-card border-border">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-primary">
                  {totalVolume.toLocaleString()}kg
                </p>
                <p className="text-xs text-muted-foreground">총 볼륨</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {completedSets}
                </p>
                <p className="text-xs text-muted-foreground">완료 세트</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search Modal */}
        {showSearch && (
          <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
            <div className="mx-auto max-w-md px-4 pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="운동 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-card border-border"
                    autoFocus
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowSearch(false)
                    setSearchQuery("")
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                {filteredExercises.map((exercise) => (
                  <Card
                    key={exercise.id}
                    className="bg-card border-border hover:bg-card/80 cursor-pointer transition-colors"
                    onClick={() => addExercise(exercise)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">
                            {exercise.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {exercise.bodyPart} • {exercise.equipment}
                          </p>
                        </div>
                        <Plus className="h-5 w-5 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Exercise List */}
        <div className="space-y-4 mb-6">
          {workoutExercises.map((entry, exerciseIndex) => (
            <Card key={exerciseIndex} className="bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-foreground">
                    {entry.exercise.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeExercise(exerciseIndex)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {entry.exercise.bodyPart} • {entry.exercise.equipment}
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Set Header */}
                <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground px-1">
                  <div className="col-span-2">세트</div>
                  <div className="col-span-4">무게(kg)</div>
                  <div className="col-span-4">횟수</div>
                  <div className="col-span-2"></div>
                </div>
                {/* Sets */}
                {entry.sets.map((set, setIndex) => (
                  <div
                    key={set.id}
                    className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg transition-colors ${
                      set.completed ? "bg-primary/10" : "bg-muted/50"
                    }`}
                  >
                    <div className="col-span-2 text-sm font-medium text-muted-foreground">
                      {setIndex + 1}
                    </div>
                    <div className="col-span-4">
                      <Input
                        type="number"
                        placeholder="0"
                        value={set.weight}
                        onChange={(e) =>
                          updateSet(
                            exerciseIndex,
                            setIndex,
                            "weight",
                            e.target.value
                          )
                        }
                        className="h-9 bg-card border-border text-center"
                      />
                    </div>
                    <div className="col-span-4">
                      <Input
                        type="number"
                        placeholder="0"
                        value={set.reps}
                        onChange={(e) =>
                          updateSet(
                            exerciseIndex,
                            setIndex,
                            "reps",
                            e.target.value
                          )
                        }
                        className="h-9 bg-card border-border text-center"
                      />
                    </div>
                    <div className="col-span-2 flex justify-end gap-1">
                      <Button
                        variant={set.completed ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          toggleSetComplete(exerciseIndex, setIndex)
                        }
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground hover:text-primary"
                  onClick={() => addSet(exerciseIndex)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  세트 추가
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {workoutExercises.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Dumbbell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              운동을 추가하세요
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              아래 버튼을 눌러 운동을 검색하고 추가하세요
            </p>
          </div>
        )}

        {/* Add Exercise Button */}
        <Button
          className="w-full mb-4"
          onClick={() => setShowSearch(true)}
        >
          <Plus className="h-5 w-5 mr-2" />
          운동 추가
        </Button>

        {/* Save Workout Button */}
        {workoutExercises.length > 0 && (
          <Button
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={saveWorkout}
          >
            운동 저장하기
          </Button>
        )}
      </div>
    </AppShell>
  )
}
