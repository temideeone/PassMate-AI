import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './hooks/useAuth.tsx';
import { ThemeProvider } from './hooks/useTheme.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker
registerSW();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
