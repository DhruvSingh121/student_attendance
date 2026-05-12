import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import App from "./App.jsx";
import { AuthProvider } from "./context/Authcontext.jsx";

import "react-toastify/dist/ReactToastify.css";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="dark"
          toastStyle={{
            background: "#161b22",
            border: "1px solid #21262d",
            color: "#e6edf3",
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
