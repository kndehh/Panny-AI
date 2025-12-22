import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Use local token getter (do not place Supabase service keys in the frontend).
// The getter reads any existing access token from localStorage; backend sessions
// via cookies are still preferred.
import { registerLocalTokenGetter } from "./api/registerSupabaseToken";
registerLocalTokenGetter();
import { loadServerConfig } from "./api/config";

// Load server-provided config (e.g., Edge auth URL) before rendering so pages
// do not need to prompt for configuration.
await loadServerConfig();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
