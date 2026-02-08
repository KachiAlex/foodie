import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { RoleProvider } from "./context/RoleContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <RoleProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </RoleProvider>
  </StrictMode>
);
