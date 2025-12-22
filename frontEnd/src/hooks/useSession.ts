import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchSession,
  login,
  signup,
  logout,
  UnauthenticatedError,
  type Session,
} from "../api/auth";
import {
  clearPersistedSession,
  isPersistedSessionExpired,
  loadPersistedSession,
  savePersistedSession,
} from "../utils/persistedSession";

export function useSession() {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery<Session | null>({
    queryKey: ["session"],
    queryFn: async () => {
      try {
        const server = await fetchSession();
        if (server) {
          savePersistedSession(server);
          return server;
        }
        clearPersistedSession();
        return null;
      } catch (err) {
        if (err instanceof UnauthenticatedError) {
          clearPersistedSession();
          return null;
        }

        const p = loadPersistedSession();
        if (p && !isPersistedSessionExpired(p)) return p.session;

        clearPersistedSession();
        return null;
      }
    },
    initialData: null,
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.setQueryData(["session"], data);
      savePersistedSession(data);
    },
  });

  const signupMutation = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      queryClient.setQueryData(["session"], data);
      savePersistedSession(data);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["session"], null);
      clearPersistedSession();
      if (typeof window !== "undefined") {
        try {
          window.localStorage.removeItem("supabase.access_token");
          window.localStorage.removeItem("supabase.refresh_token");
          window.localStorage.removeItem("sb:token");
          window.localStorage.removeItem("access_token");
        } catch {}
      }
    },
  });

  return {
    sessionQuery,
    loginMutation,
    signupMutation,
    logoutMutation,
    isAuthenticated: Boolean(sessionQuery.data),
    isLoading: sessionQuery.isLoading,
  };
}
