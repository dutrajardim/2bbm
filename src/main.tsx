import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AppRoutes from './AppRoutes.tsx'
import { BrowserRouter } from 'react-router-dom'

// Handle GitHub Pages SPA routing
if (window.location.search.startsWith('/?')) {
  const path = window.location.search.slice(2).replace(/~and~/g, '&');
  window.history.replaceState(null, '', path);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename='/2bbm'>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>,
)
