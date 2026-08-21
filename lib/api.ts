const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Activity {
  time: string;
  name: string;
  category: string;
  description: string;
  costEstimate?: number;
}

export interface Day {
  day: number;
  location: string;
  activities: Activity[];
  transport: string;
  neighborhood: string;
}

export interface Hotel {
  name: string;
  area: string;
  tier: string;
  estimatedCost: number;
}

export interface Budget {
  total: number;
  breakdown: {
    accommodation: number;
    food: number;
    transport: number;
    activities: number;
    other?: number;
  };
  withinBudget: boolean;
}

export interface TripSpec {
  destination?: string;
  duration?: number;
  budget?: number;
  interests?: string[];
  travelers?: number;
  currency?: string;
}

export interface Review {
  score?: number;
  feedback?: string;
  validatedAt?: string;
}

export type AgentProvider = 'groq' | 'gemini';

export interface PipelineStep {
  agent: string;
  section: string;
  provider: AgentProvider;
  status: 'ok' | 'fallback';
}

export interface ValidationCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

export interface BuildTrace {
  runId?: string;
  pipeline: PipelineStep[];
  checks: ValidationCheck[];
  repairCount: number;
  repairProvider?: AgentProvider;
  validatorScore?: number;
  validatorPassed?: boolean;
}

export interface Trip {
  _id: string;
  userId: string;
  request: string;
  tripSpec: TripSpec;
  itinerary: {
    days: Day[];
    hotels: Hotel[];
    disclaimer?: string;
  };
  budget: Budget;
  review?: Review;
  buildTrace?: BuildTrace;
  createdAt: string;
  updatedAt: string;
  warnings?: string[];
  runId?: string;
  repairCount?: number;
  logs?: string[];
}

export interface AuthUser {
  _id: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError('Could not reach the server. Please check your connection and try again.', 0);
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    if (data && typeof data === 'object' && 'error' in (data as Record<string, unknown>)) {
      const errorValue = (data as Record<string, unknown>).error;
      if (typeof errorValue === 'string' && errorValue.length > 0) {
        message = errorValue;
      }
    }
    throw new ApiError(message, res.status);
  }

  return data as T;
}

export const api = {
  register: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  getTrips: (token: string) => request<Trip[]>('/api/trips', { method: 'GET' }, token),

  getTrip: (id: string, token: string) => request<Trip>(`/api/trips/${id}`, { method: 'GET' }, token),

  createPlan: (requestText: string, token: string) =>
    request<Trip>('/api/plan', { method: 'POST', body: JSON.stringify({ request: requestText }) }, token),

  deleteTrip: (id: string, token: string) =>
    request<{ message: string }>(`/api/trips/${id}`, { method: 'DELETE' }, token),

  addActivity: (tripId: string, day: number, activity: Activity, token: string) =>
    request<Trip>(`/api/trips/${tripId}/days/${day}/activities`, { method: 'POST', body: JSON.stringify(activity) }, token),

  removeActivity: (tripId: string, day: number, idx: number, token: string) =>
    request<Trip>(`/api/trips/${tripId}/days/${day}/activities/${idx}`, { method: 'DELETE' }, token),

  regenerateDay: (tripId: string, day: number, instruction: string | undefined, token: string) =>
    request<Trip>(
      `/api/trips/${tripId}/days/${day}/regenerate`,
      { method: 'POST', body: JSON.stringify({ instruction }) },
      token
    ),
};
