import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AppThemeProvider } from "./context/AppThemeProvider.jsx";
import { VoiceCallProvider } from "./context/VoiceCallProvider.jsx";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/notification-sw.js").catch(() => {});
  });
}

createRoot(document.getElementById("root")).render(
  <AppThemeProvider>
    <BrowserRouter>
      <VoiceCallProvider>
        <App />
      </VoiceCallProvider>
    </BrowserRouter>
  </AppThemeProvider>
);
