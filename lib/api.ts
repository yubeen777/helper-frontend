const BASE_URL =
  typeof window !== "undefined"
    ? "/api/proxy"
    : process.env.NEXT_PUBLIC_API_URL;

export const getToken = () => localStorage.getItem("accessToken");
export const setToken = (token: string) => localStorage.setItem("accessToken", token);
export const removeToken = () => localStorage.removeItem("accessToken");

const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    let error: { message?: string } = {};
    try { error = text ? JSON.parse(text) : {}; } catch { error = {}; }
    throw new Error(error.message || `HTTP ${response.status} 오류`);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text);
};

export const authApi = {
  signup: (data: { name: string; email: string; password: string }) =>
    fetchApi("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ nickname: data.name, email: data.email, password: data.password }),
    }),
  login: (data: { email: string; password: string }) =>
    fetchApi("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),
};

export const workoutApi = {
  getAll: () => fetchApi("/api/workouts"),
  getOne: (id: number) => fetchApi(`/api/workouts/${id}`),
  create: (data: { memo?: string }) =>
    fetchApi("/api/workouts", {
      method: "POST",
      body: JSON.stringify({
        workoutDate: new Date().toISOString().split("T")[0],
        ...data,
      }),
    }),
  delete: (id: number) => fetchApi(`/api/workouts/${id}`, { method: "DELETE" }),
  addSet: (workoutId: number, data: { exerciseId: number; weight: number; reps: number }) =>
    fetchApi(`/api/workouts/${workoutId}/sets`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// keyword, bodyPart 둘 다 선택사항 — 없으면 전체 반환
export const exerciseApi = {
  search: (keyword?: string, bodyPart?: string) => {
    const params = new URLSearchParams();
    if (keyword) params.append("keyword", keyword);
    if (bodyPart) params.append("bodyPart", bodyPart);
    const qs = params.toString();
    return fetchApi(`/api/exercises${qs ? `?${qs}` : ""}`);
  },
};

export const statsApi = {
  weekly: () => fetchApi("/api/stats/weekly"),
  volume: () => fetchApi("/api/stats/volume"),
  consistency: () => fetchApi("/api/stats/consistency"),
  streak: () => fetchApi("/api/stats/streak"),
  workoutSession: (id: number) => fetchApi(`/api/stats/workout/${id}`),
  oneRMTrend: (exerciseId: number) =>
    fetchApi(`/api/stats/exercise/${exerciseId}/1rm-trend`),
};

export const feedbackApi = {
  getAll: () => fetchApi("/api/feedback"),
  request: (feedbackType: string, workoutId?: number) =>
    fetchApi("/api/feedback", {
      method: "POST",
      body: JSON.stringify({
        feedbackType,
        ...(workoutId ? { workoutId } : {}),
      }),
    }),
};

export const userApi = {
  updateMe: (nickname: string) =>
    fetchApi("/api/users/me", { method: "PATCH", body: JSON.stringify({ nickname }) }),
  updatePassword: (currentPassword: string, newPassword: string) =>
    fetchApi("/api/users/me/password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  deleteMe: () => fetchApi("/api/users/me", { method: "DELETE" }),
};