import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";
import { registerServiceWorker } from "./push/register.js";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// SW'yi kaydet (push + kurulabilirlik). Hata olursa uygulama yine calisir.
registerServiceWorker().catch((e) => console.warn("SW register failed:", e));
