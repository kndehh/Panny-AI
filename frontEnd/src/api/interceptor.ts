import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";

let tokenGetter: (() => Promise<string | null>) | null = null;

export function setTokenGetter(getter: () => Promise<string | null>) {
  tokenGetter = getter;
}

export function attachAuthInterceptor(client: AxiosInstance) {
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      if (!tokenGetter) return config;
      try {
        const token = await tokenGetter();
        if (token) {
          config.headers = config.headers ?? {};
          // Avoid overwriting existing Authorization header
          if (!config.headers["Authorization"]) {
            config.headers["Authorization"] = `Bearer ${token}`;
          }
        }
      } catch (e) {
        // ignore token errors
      }
      return config;
    }
  );
}

export default attachAuthInterceptor;
