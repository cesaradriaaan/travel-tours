import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

import { TripProvider } from "./context/TripContext";
import { AuthProvider } from "./context/AuthContext";

import "./styles/global.css";
import "./styles/refresh.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TripProvider>
          <App />
        </TripProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
