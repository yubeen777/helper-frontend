const BASE_URL =
  typeof window !== "undefined"
    ? "/api/proxy"
    : process.env.NEXT_PUBLIC_API_URL;
//브라우저에서 요청할 때 → /api/proxy로 보내면 Next.js가 백엔드로 대신 전달
//서버에서 요청할 때 → 직접 백엔드 URL로 요청

// 토큰 저장/가져오기
export const getToken = () => localStorage.getItem("accessToken");
export const setToken = (token: string) =>
  localStorage.setItem("accessToken", token);
export const removeToken = () => localStorage.removeItem("accessToken");

// 기본 fetch 함수
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
    const error = await response.json();
    throw new Error(error.message || "API 오류가 발생했습니다.");
  }

  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text);
};

// 인증 API
export const authApi = {
  signup: (data: { name: string; email: string; password: string }) =>
    fetchApi("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        nickname: data.name,
        email: data.email,
        password: data.password,
      }),
    }),
  login: (data: { email: string; password: string }) =>
    fetchApi("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),
};

// 운동 기록 API
export const workoutApi = {
  getAll: () => fetchApi("/api/workouts"),
  getOne: (id: number) => fetchApi(`/api/workouts/${id}`),
  create: (data: { memo?: string }) =>
    fetchApi("/api/workouts", { method: "POST", body: JSON.stringify(data) }),
  delete: (id: number) => fetchApi(`/api/workouts/${id}`, { method: "DELETE" }),

  addSet: (
    workoutId: number,
    data: { exerciseId: number; weight: number; reps: number },
  ) =>
    fetchApi(`/api/workouts/${workoutId}/sets`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// 운동 종목 API
export const exerciseApi = {
  search: (keyword: string) => fetchApi(`/api/exercises?keyword=${keyword}`),
};

// 통계 API
export const statsApi = {
  weekly: () => fetchApi("/api/stats/weekly"),
  volume: () => fetchApi("/api/stats/volume"),
  consistency: () => fetchApi("/api/stats/consistency"),
  workoutSession: (id: number) => fetchApi(`/api/stats/workout/${id}`),
  oneRMTrend: (exerciseId: number) =>
    fetchApi(`/api/stats/exercise/${exerciseId}/1rm-trend`),
};

// AI 피드백 API
export const feedbackApi = {
  getAll: () => fetchApi("/api/feedback"),
  request: (workoutId: number) =>
    fetchApi("/api/feedback", {
      method: "POST",
      body: JSON.stringify({ workoutId }),
    }),
};
