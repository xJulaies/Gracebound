import { ClerkProvider } from "@clerk/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { getClerkPublishableKey } from "./shared/config/environment";
import "./styles.css";

const queryClient = new QueryClient();
const publishableKey = getClerkPublishableKey();
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element is missing");
}

createRoot(rootElement).render(
  <StrictMode>
    <ClerkProvider publishableKey={publishableKey}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ClerkProvider>
  </StrictMode>,
);
