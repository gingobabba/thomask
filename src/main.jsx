import "./storage-shim.js";

// Standalone builds route AI calls through the proxy (which holds the API key
// server-side). In the Claude artifact this global is unset and the component
// falls back to calling the API directly.
window.__CLAUDE_ENDPOINT__ = "/api/claude";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./LivingCharacterSheet.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
