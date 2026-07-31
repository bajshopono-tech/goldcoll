import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Handle third-party cross-origin script errors gracefully (e.g., TradingView embed script in iframe)
window.addEventListener('error', (event) => {
  if (event.message === 'Script error.' || event.message?.includes('TradingView') || event.message?.includes('ResizeObserver')) {
    event.preventDefault();
    event.stopPropagation();
    return true;
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

