import create from 'zustand'
import { persist } from 'zustand/middleware'

export type Message = {
  id: string
  text: string
  role: 'user' | 'assistant'
  timestamp: number
}

export type PannyState = {
  theme: 'light' | 'dark'
  soundEnabled: boolean
  chatHistory: Message[]
  setTheme: (t: 'light' | 'dark') => void
  setSound: (v: boolean) => void
  addMessage: (m: Message) => void
  prependMessages: (msgs: Message[]) => void
  reset: () => void
}

export const usePannyStore = create<PannyState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      soundEnabled: typeof window !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent) ? false : true,
      chatHistory: [],
      setTheme: (t: 'light' | 'dark') => set({ theme: t }),
      setSound: (v: boolean) => set({ soundEnabled: v }),
      addMessage: (m: Message) => set({ chatHistory: [...get().chatHistory, m] }),
          prependMessages: (msgs: Message[]) => set({ chatHistory: [...msgs, ...get().chatHistory] }),
      reset: () => set({ chatHistory: [] }),
    }),
    { name: 'panny-storage' },
  ),
)
