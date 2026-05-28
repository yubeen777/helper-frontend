"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, X, Check, Dumbbell } from "lucide-react";
import { exerciseApi, workoutApi, getToken } from "@/lib/api";

const BODY_PARTS = [
  { key: "", label: "전체" },
  { key: "CHEST", label: "가슴" },
  { key: "BACK", label: "등" },
  { key: "LEG", label: "하체" },
  { key: "SHOULDER", label: "어깨" },
  { key: "ARM", label: "팔" },
  { key: "CORE", label: "코어" },
  { key: "CARDIO", label: "유산소" },
];

const BODY_PART_KO: Record<string, string> = {
  CHEST: "가슴", BACK: "등", LEG: "하체",
  SHOULDER: "어깨", ARM: "팔", CORE: "코어",
  CARDIO: "유산소", ETC: "기타",
};

interface Exercise {
  id: number;
  name: string;
  bodyPart: string;
}

interface SetData {
  id: number;
  weight: string;
  reps: string;
  completed: boolean;
}

interface ExerciseEntry {
  exercise: Exercise;
  sets: SetData[];
}

export default function WorkoutPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBodyPart, setSelectedBodyPart] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
  const [workoutExercises, setWorkoutExercises] = useState<ExerciseEntry[]>([]);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!getToken()) router.push("/login");
  }, [router]);

  const fetchExercises = useCallback(async (keyword: string, bodyPart: string) => {
    try {
      const results = await exerciseApi.search(
        keyword || undefined,
        bodyPart || undefined,
      );
      setSearchResults(results);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // 모달 열릴 때, 탭 변경 시, 검색어 변경 시 자동 fetch
  useEffect(() => {
    if (!showSearch) return;
    const timer = setTimeout(() => {
      fetchExercises(searchQuery, selectedBodyPart);
    }, 150);
    return () => clearTimeout(timer);
  }, [showSearch, searchQuery, selectedBodyPart, fetchExercises]);

  const openSearch = () => {
    setSearchQuery("");
    setShowSearch(true);
  };

  const addExercise = (exercise: Exercise) => {
    setWorkoutExercises((prev) => [
      ...prev,
      { exercise, sets: [{ id: 1, weight: "", reps: "", completed: false }] },
    ]);
    setShowSearch(false);
    setSearchQuery("");
    if (!workoutStarted) setWorkoutStarted(true);
  };

  const removeExercise = (index: number) => {
    setWorkoutExercises((prev) => prev.filter((_, i) => i !== index));
  };

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
          : entry,
      ),
    );
  };

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: "weight" | "reps",
    value: string,
  ) => {
    setWorkoutExercises((prev) =>
      prev.map((entry, i) =>
        i === exerciseIndex
          ? {
              ...entry,
              sets: entry.sets.map((set, j) =>
                j === setIndex ? { ...set, [field]: value } : set,
              ),
            }
          : entry,
      ),
    );
  };

  const toggleSetComplete = (exerciseIndex: number, setIndex: number) => {
    setWorkoutExercises((prev) =>
      prev.map((entry, i) =>
        i === exerciseIndex
          ? {
              ...entry,
              sets: entry.sets.map((set, j) =>
                j === setIndex ? { ...set, completed: !set.completed } : set,
              ),
            }
          : entry,
      ),
    );
  };

  const saveWorkout = async () => {
    setSaving(true);
    try {
      const workout = await workoutApi.create({});
      const workoutId = workout.id;

      for (const entry of workoutExercises) {
        for (const set of entry.sets) {
          if (set.completed && set.weight && set.reps) {
            await workoutApi.addSet(workoutId, {
              exerciseId: entry.exercise.id,
              weight: parseFloat(set.weight),
              reps: parseInt(set.reps),
            });
          }
        }
      }

      alert("운동이 저장되었습니다! 🎉");
      setWorkoutExercises([]);
      setWorkoutStarted(false);
      router.push("/");
    } catch (e) {
      console.error(e);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const totalVolume = workoutExercises.reduce(
    (total, entry) =>
      total +
      entry.sets.reduce(
        (setTotal, set) =>
          set.completed && set.weight && set.reps
            ? setTotal + parseFloat(set.weight) * parseInt(set.reps)
            : setTotal,
        0,
      ),
    0,
  );

  const completedSets = workoutExercises.reduce(
    (total, entry) => total + entry.sets.filter((s) => s.completed).length,
    0,
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">운동 기록</h1>
          <p className="text-sm text-muted-foreground">
            {workoutStarted
              ? `${workoutExercises.length}개 운동 · ${completedSets}세트 완료`
              : "운동을 추가하여 시작하세요"}
          </p>
        </div>

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
                <p className="text-2xl font-bold text-foreground">{completedSets}</p>
                <p className="text-xs text-muted-foreground">완료 세트</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 운동 검색 모달 */}
        {showSearch && (
          <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
            <div className="mx-auto max-w-md px-4 pt-6 h-full flex flex-col">

              {/* 검색창 */}
              <div className="flex items-center gap-3 mb-3">
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
                  onClick={() => { setShowSearch(false); setSearchQuery(""); }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* 부위 탭 */}
              <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none flex-shrink-0">
                {BODY_PARTS.map((bp) => (
                  <button
                    key={bp.key}
                    onClick={() => setSelectedBodyPart(bp.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                      selectedBodyPart === bp.key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {bp.label}
                  </button>
                ))}
              </div>

              {/* 결과 목록 */}
              <div className="flex-1 overflow-y-auto space-y-2 pb-6">
                {searchResults.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    {searchQuery
                      ? `"${searchQuery}" 검색 결과 없음`
                      : "운동을 선택하거나 검색하세요"}
                  </div>
                ) : (
                  searchResults.map((exercise) => (
                    <Card
                      key={exercise.id}
                      className="bg-card border-border hover:bg-card/80 cursor-pointer transition-colors"
                      onClick={() => addExercise(exercise)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">{exercise.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {BODY_PART_KO[exercise.bodyPart] || exercise.bodyPart}
                            </p>
                          </div>
                          <Plus className="h-5 w-5 text-primary" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 운동 목록 */}
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
                  {BODY_PART_KO[entry.exercise.bodyPart] || entry.exercise.bodyPart}
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground px-1">
                  <div className="col-span-2">세트</div>
                  <div className="col-span-4">무게(kg)</div>
                  <div className="col-span-4">횟수</div>
                  <div className="col-span-2"></div>
                </div>
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
                          updateSet(exerciseIndex, setIndex, "weight", e.target.value)
                        }
                        className="h-9 bg-card border-border text-center"
                        step="0.5"
                      />
                    </div>
                    <div className="col-span-4">
                      <Input
                        type="number"
                        placeholder="0"
                        value={set.reps}
                        onChange={(e) =>
                          updateSet(exerciseIndex, setIndex, "reps", e.target.value)
                        }
                        className="h-9 bg-card border-border text-center"
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <Button
                        variant={set.completed ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleSetComplete(exerciseIndex, setIndex)}
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

        {workoutExercises.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Dumbbell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">운동을 추가하세요</h3>
            <p className="text-sm text-muted-foreground mb-4">
              아래 버튼을 눌러 부위별로 운동을 선택하세요
            </p>
          </div>
        )}

        <Button className="w-full mb-4" onClick={openSearch}>
          <Plus className="h-5 w-5 mr-2" />
          운동 추가
        </Button>

        {workoutExercises.length > 0 && (
          <Button
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={saveWorkout}
            disabled={saving}
          >
            {saving ? "저장 중..." : "운동 저장하기"}
          </Button>
        )}
      </div>
    </AppShell>
  );
}