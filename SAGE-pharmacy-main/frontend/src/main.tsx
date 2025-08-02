import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes.tsx";
import { ThemeProvider } from "styled-components";
import { theme } from "./styles/theme.ts";
import { GlobalStyles } from "./styles/globalStyles.ts";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyles theme={theme} />
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);
