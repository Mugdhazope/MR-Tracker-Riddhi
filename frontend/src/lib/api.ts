const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

const TOKEN_STORAGE_KEY = "mr_tracker_tokens";
const USER_STORAGE_KEY = "mr_tracker_user";

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string | null;
  name: string;
  role: "admin" | "MR";
}

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  method?: HttpMethod;
  body?: BodyInit | Record<string, unknown> | null;
  skipAuth?: boolean;
};

const getStoredTokens = (): AuthTokens | null => {
  const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as AuthTokens) : null;
};

export const getStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
};

export const clearAuthStorage = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
};

export const storeAuth = (tokens: AuthTokens, user: AuthUser) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

const buildHeaders = (skipAuth?: boolean): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (!skipAuth) {
    const tokens = getStoredTokens();
    if (tokens?.access) {
      headers.Authorization = `Bearer ${tokens.access}`;
    }
  }

  return headers;
};

const handleResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json().catch(() => ({})) : null;

  if (!response.ok) {
    const message =
      (data && (data.detail || data.message)) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
};

export const apiFetch = async <T>(
  path: string,
  { method = "GET", body, skipAuth, ...rest }: ApiFetchOptions = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  const init: RequestInit = {
    method,
    headers: buildHeaders(skipAuth),
    ...rest,
  };

  if (body !== undefined && body !== null) {
    init.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  const response = await fetch(url, init);
  return handleResponse(response);
};

// Auth
export const login = async (
  role: "MR" | "admin",
  credentials: { username: string; password: string }
) => {
  const endpoint =
    role === "MR" ? "/api/auth/mr-login/" : "/api/auth/admin-login/";

  const data = await apiFetch<{
    refresh: string;
    access: string;
    user: AuthUser;
  }>(endpoint, {
    method: "POST",
    body: credentials,
    skipAuth: true,
  });

  storeAuth(
    { access: data.access, refresh: data.refresh },
    { ...data.user, role: data.user.role }
  );

  return data;
};

export const logout = async () => {
  const tokens = getStoredTokens();
  if (!tokens?.refresh) {
    clearAuthStorage();
    return;
  }

  try {
    await apiFetch("/api/auth/logout/", {
      method: "POST",
      body: { refresh: tokens.refresh },
    });
  } finally {
    clearAuthStorage();
  }
};

// Dashboard endpoints
export const fetchMRDashboard = () =>
  apiFetch<{
    today_visits: number;
    assigned_tasks: Array<{
      mr: string;
      doctor: string;
      date: string;
      time: string;
      status: string;
      notes: string;
    }>;
    todays_doctor_visits: Array<{
      mr: string;
      doctor: string;
      time: string;
      notes: string;
    }>;
    todays_shop_visits: Array<{
      shop_name: string;
      location: string;
      notes: string;
      time: string;
    }>;
  }>("/api/dashboard/mr/");

export const fetchAdminDashboard = () =>
  apiFetch<{
    summary: Record<string, unknown>;
    daily_visits: Array<{ date: string; count: number }>;
    recent_visits: Array<{
      mr: string;
      doctor: string;
      time: string;
      notes: string;
      gps_lat?: number | null;
      gps_long?: number | null;
    }>;
    mr_tracking: Array<{
      mr: string;
      visits_today: number;
      first_punch: string | null;
      last_punch: string | null;
    }>;
    assigned_tasks: Array<{
      mr: string;
      doctor: string;
      date: string;
      time: string;
      status: string;
      notes: string;
    }>;
  }>("/api/dashboard/admin/");

// Doctors & visits
export const fetchDoctors = () =>
  apiFetch<Array<{ id: number; name: string; specialization: string }>>(
    "/api/visits/doctors/"
  );

export const fetchMRs = () =>
  apiFetch<Array<{ id: number; username: string; name: string | null }>>(
    "/api/auth/mrs/"
  );

export const fetchDoctorVisits = () =>
  apiFetch<
    Array<{
      id: number;
      mr: number;
      doctor_name: number;
      gps_lat: number | null;
      gps_long: number | null;
      notes: string;
      visit_date: string;
      visit_time: string;
      completed: boolean;
      task_id: number | null;
      is_assigned_task: boolean;
    }>
  >("/api/visits/doctor-visits/");

export const fetchShopVisits = () =>
  apiFetch<
    Array<{
      id: number;
      mr: number;
      shop_name: string;
      location: string | null;
      contact_person: string | null;
      notes: string;
      visit_date: string;
      visit_time: string;
      completed: boolean;
    }>
  >("/api/visits/shop-visits/");

export const createDoctor = (payload: {
  name: string;
  specialization: string;
}) => apiFetch("/api/visits/doctors/", { method: "POST", body: payload });

export const createDoctorVisit = (payload: {
  doctor_name: number;
  gps_lat?: number;
  gps_long?: number;
  notes?: string;
}) =>
  apiFetch("/api/visits/doctor-visits/", {
    method: "POST",
    body: payload,
  });

export const createShopVisit = (payload: {
  shop_name: string;
  location: string;
  contact_person?: string;
  notes?: string;
}) =>
  apiFetch("/api/visits/shop-visits/", {
    method: "POST",
    body: payload,
  });

// Tasks
export const fetchTasks = () =>
  apiFetch<
    Array<{
      id: number;
      assigned_to: number;
      assigned_by: number;
      assigned_doctor: number;
      assigned_date: string;
      due_date: string;
      due_time: string;
      notes: string;
      completed: boolean;
      visit_record: number | null;
    }>
  >("/api/tasks/doctor-tasks/");

export const createTask = (payload: {
  assigned_to: number;
  assigned_doctor: number;
  due_date: string;
  due_time: string;
  notes?: string;
}) =>
  apiFetch("/api/tasks/doctor-tasks/", {
    method: "POST",
    body: payload,
  });

export const completeTask = (
  taskId: number,
  payload: { gps_lat?: number; gps_long?: number; notes?: string } = {}
) =>
  apiFetch(`/api/tasks/doctor-tasks/${taskId}/complete/`, {
    method: "POST",
    body: payload,
  });

// Admin Dashboard - Detailed MR view with visit history
export const fetchAdminMRDetail = (
  mrId: number,
  startDate?: string,
  endDate?: string
) => {
  const params = new URLSearchParams();
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);

  const query = params.toString() ? `?${params.toString()}` : "";

  return apiFetch<{
    mr_id: number;
    mr_username: string;
    mr_name: string;
    statistics: {
      total_visits: number;
      total_doctor_visits: number;
      total_shop_visits: number;
      task_based_doctor_visits: number;
      self_visit_doctor_visits: number;
      task_based_shop_visits: number;
      self_visit_shop_visits: number;
    };
    top_doctors: Array<{
      doctor_name__name: string;
      doctor_name__specialization: string;
      count: number;
    }>;
    doctor_visits: Array<{
      id: number;
      doctor_name: number;
      doctor_name_display: string;
      doctor_specialization: string;
      gps_lat: number | null;
      gps_long: number | null;
      notes: string;
      visit_date: string;
      visit_time: string;
      completed: boolean;
      visit_type: "task" | "self";
      task_id: number | null;
      is_assigned_task: boolean;
    }>;
    shop_visits: Array<{
      id: number;
      shop_name: string;
      location: string | null;
      contact_person: string | null;
      notes: string;
      visit_date: string;
      visit_time: string;
      completed: boolean;
      visit_type: "task" | "self";
    }>;
    date_range: {
      start_date: string;
      end_date: string;
    };
  }>(`/api/dashboard/admin/mr/${mrId}/${query}`);
};

// Admin Dashboard - Analytics with real DB metrics
export const fetchAdminAnalytics = (period: "day" | "week" | "month" = "day") =>
  apiFetch<{
    period: string;
    start_date: string;
    end_date: string;
    summary: {
      total_visits: number;
      total_doctor_visits: number;
      total_shop_visits: number;
      active_mrs: number;
      total_mrs: number;
    };
    mr_performance: Array<{
      mr_id: number;
      mr_username: string;
      mr_name: string;
      doctor_visits: number;
      shop_visits: number;
      total_visits: number;
      task_based_visits: number;
      self_visits: number;
    }>;
    top_doctors: Array<{
      doctor_name__id: number;
      doctor_name__name: string;
      doctor_name__specialization: string;
      total_visits: number;
    }>;
    daily_trends: Array<{
      date: string;
      doctor_visits: number;
      shop_visits: number;
      total: number;
    }>;
  }>(`/api/dashboard/admin/analytics/?period=${period}`);

export const getApiBaseUrl = () => API_BASE_URL;
