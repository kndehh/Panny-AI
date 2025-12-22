import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Message = {
  id: string;
  text: string;
  role: "user" | "assistant";
  timestamp: number;
};

export type PannyState = {
  theme: "light" | "dark";
  soundEnabled: boolean;
  chatHistory: Message[];
  chatSessions: Record<string, Message[]>;
  currentSessionId: string;
  totalJournalingTime: number; // Total time spent in sessions (ms)
  sessionStartTime: number | null; // When current session started
  setTheme: (t: "light" | "dark") => void;
  setSound: (v: boolean) => void;
  setCurrentSessionId: (id: string) => void;
  upsertSessionMessages: (sessionId: string, msgs: Message[]) => void;
  addMessage: (m: Message) => void;
  prependMessages: (msgs: Message[]) => void;
  setChatHistory: (msgs: Message[]) => void;
  startSession: () => void;
  endSession: () => void;
  reset: () => void;
};

export const usePannyStore = create<PannyState>()(
  persist(
    (set, get) => ({
      theme: "light",
      soundEnabled:
        typeof window !== "undefined" &&
        /Mobi|Android/i.test(navigator.userAgent)
          ? false
          : true,
      chatHistory: [],
      chatSessions: {},
      currentSessionId: "", // was "default-session"
      totalJournalingTime: 0,
      sessionStartTime: null,
      setTheme: (t: "light" | "dark") => set({ theme: t }),
      setSound: (v: boolean) => set({ soundEnabled: v }),

      setCurrentSessionId: (id: string) => {
        const sessionId = id || "";
        set({ currentSessionId: sessionId });

        if (!sessionId) return;

        const state = get();
        const local = state.chatSessions[sessionId];
        if (local && local.length > 0) {
          set({ chatHistory: local });
        }
      },

      upsertSessionMessages: (sessionId: string, msgs: Message[]) => {
        const id = sessionId || get().currentSessionId || "";
        if (!id) return;

        set((state) => ({
          chatSessions: {
            ...state.chatSessions,
            [id]: msgs,
          },
        }));
      },

      addMessage: (m: Message) => {
        const state = get();
        if (!state.sessionStartTime) {
          set({ sessionStartTime: Date.now() });
        }

        const sessionId = state.currentSessionId; // no fallback
        const nextHistory = [...state.chatHistory, m];
        set({ chatHistory: nextHistory });

        if (!sessionId) return;

        set((s) => ({
          chatSessions: {
            ...s.chatSessions,
            [sessionId]: nextHistory,
          },
        }));
      },

      prependMessages: (msgs: Message[]) =>
        set({ chatHistory: [...msgs, ...get().chatHistory] }),

      setChatHistory: (msgs: Message[]) => {
        const sessionId = get().currentSessionId; // no fallback
        set({ chatHistory: msgs });

        if (!sessionId) return;

        set((s) => ({
          chatSessions: {
            ...s.chatSessions,
            [sessionId]: msgs,
          },
        }));
      },

      startSession: () => set({ sessionStartTime: Date.now() }),

      endSession: () => {
        const state = get();
        if (state.sessionStartTime) {
          const sessionDuration = Date.now() - state.sessionStartTime;
          set({
            totalJournalingTime: state.totalJournalingTime + sessionDuration,
            sessionStartTime: null,
          });
        }
      },

      reset: () => {
        const state = get();
        if (state.sessionStartTime) {
          const sessionDuration = Date.now() - state.sessionStartTime;
          set({
            totalJournalingTime: state.totalJournalingTime + sessionDuration,
            chatHistory: [],
            sessionStartTime: null,
          });
        } else {
          set({ chatHistory: [] });
        }
      },
    }),
    { name: "panny-storage" }
  )
);
