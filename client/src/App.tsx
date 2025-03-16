import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { store } from './store/store';
import { queryClient } from './lib/queryClient';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { useEffect } from 'react';
import type { RootState } from './store/store';
import { CustomCursor } from './components/CustomCursor';

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const themeMode = useSelector((state: RootState) => state.mode.themeMode);
  const isMobile = false;

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (themeMode === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(themeMode);
    }
  }, [themeMode]);

  return (
  <>
    {children}
    {!isMobile && <CustomCursor />}
  </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeWrapper>
          <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <Navbar />
            <Home />
          </div>
        </ThemeWrapper>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;