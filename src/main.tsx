import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

import { useGameStore } from "./store/gameStore";

// 🔥 DEV ONLY: expose store to browser console
if (typeof window !== "undefined") {
  (window as any).useGameStore = useGameStore;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);