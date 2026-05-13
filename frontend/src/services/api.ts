import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

export interface User {
  id: string;
  name: string;
  role: "Requester" | "Validator";
}

export interface VacationRequest {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: "Pending" | "Approved" | "Rejected";
  comments: string | null;
  created_at: string;
  user?: User;
}

export interface CreateRequestPayload {
  user_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
}

export interface UpdateStatusPayload {
  status: "Approved" | "Rejected";
  comments?: string;
}

export const userService = {
  getAll: () => api.get<User[]>("/users").then((r) => r.data),
};

export const requestService = {
  create: (payload: CreateRequestPayload) =>
    api.post<VacationRequest>("/requests", payload).then((r) => r.data),

  getByUser: (userId: string) =>
    api.get<VacationRequest[]>("/requests", { params: { userId } }).then((r) => r.data),

  getAll: (status?: string) =>
    api.get<VacationRequest[]>("/requests", { params: status ? { status } : {} }).then((r) => r.data),

  updateStatus: (id: string, payload: UpdateStatusPayload) =>
    api.patch<VacationRequest>(`/requests/${id}/status`, payload).then((r) => r.data),
};
