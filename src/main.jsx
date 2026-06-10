import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const enableStrictMode = import.meta.env.VITE_ENABLE_STRICT_MODE !== "false";
const app = <App />;

ReactDOM.createRoot(document.getElementById("root")).render(
  enableStrictMode ? <React.StrictMode>{app}</React.StrictMode> : app
);
