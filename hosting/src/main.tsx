import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { RoleProvider } from "./context/RoleContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { AppProvider } from "./context/AppContext";
import { CurrencyProvider } from "./context/CurrencyContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <ToastProvider>
      <RoleProvider>
        <AuthProvider>
          <CurrencyProvider>
            <AppProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </AppProvider>
          </CurrencyProvider>
        </AuthProvider>
      </RoleProvider>
    </ToastProvider>
  </StrictMode>
);
