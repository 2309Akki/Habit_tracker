"use client";

import { Provider } from "react-redux";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { store } from "@/store/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <Toaster position="top-center" />
      </ThemeProvider>
    </Provider>
  );
}
