import { Provider, useSelector } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { store } from "./store/store";
import { queryClient } from "./lib/queryClient";
import { Navbar } from "./components/Navbar";
import { Home } from "./pages/Home";
import type { RootState } from "./store/store";
import { CustomCursor } from "./components/CustomCursor";
import { audioManager } from "./lib/audio";

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const themeMode = useSelector((state: RootState) => state.mode.themeMode);
  const soundEnabled = useSelector(
    (state: RootState) => state.mode.soundEnabled,
  );
  const isMobile = false;

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (themeMode === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(themeMode);
    }
  }, [themeMode]);

  // Global audio management
  useEffect(() => {
    if (soundEnabled) {
      audioManager.playBackgroundMusic();
    } else {
      audioManager.stopBackgroundMusic();
    }

    return () => {
      audioManager.stopBackgroundMusic();
    };
  }, [soundEnabled]);

  return (
    <>
      {children}
      {!isMobile && <CustomCursor />}
    </>
  );
}

function AppLayout() {
  return (
    <>
      <a
        href="#main-content"
        className="skip-link bg-primary text-primary-foreground rounded focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <Navbar />
        <main id="main-content">
          <Home />
        </main>
      </div>
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeWrapper>
          <AppLayout />
        </ThemeWrapper>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
