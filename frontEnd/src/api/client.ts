import axios from "axios";
import { attachAuthInterceptor } from "./interceptor";

const apiClient = axios.create({
  baseURL: import.meta.env.DEV
    ? ""
    : import.meta.env.VITE_API_URL ?? "https://panny-be-production.up.railway.app",
  withCredentials: true,
});

attachAuthInterceptor(apiClient);

export default apiClient;
export { apiClient };
