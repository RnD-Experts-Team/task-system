import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { clearLegacyServiceWorker } from "./lib/clearLegacyServiceWorker.ts";

// Remove any stale service workers/caches from the previous app deployment.
void clearLegacyServiceWorker();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
