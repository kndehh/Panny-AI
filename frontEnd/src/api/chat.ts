import apiClient from "./client";

export type MessagePayload = {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
};

export async function sendChat(payload: { prompt: string; sessionId?: string }) {
  const res = await apiClient.post<{
    reply: string;
    model?: string;
    source?: string;
    sessionId?: string;
  }>("/api/chat", payload);

  return res.data;
}

export async function saveChatHistory(payload: {
  sessionId: string;
  messages: MessagePayload[];
}) {
  const res = await apiClient.post("/api/chat/history", payload);
  return res.data;
}

// FIX: list sessions uses GET /api/chat/history/get (no sessionId)
export async function getChatSessions(_params?: { page?: number; perPage?: number }) {
  const res = await apiClient.get("/api/chat/history/get");
  return res.data;
}

export async function getChatHistory(sessionId: string, includeMessages = true) {
  const qs = new URLSearchParams();
  qs.set("sessionId", sessionId);
  if (includeMessages) qs.set("includeMessages", "true");

  const res = await apiClient.get(`/api/chat/history/get?${qs.toString()}`);
  return res.data;
}
