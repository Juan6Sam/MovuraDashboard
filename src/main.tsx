import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import AppRoutes from './routes/AppRoutes'

async function main() {
  // if (import.meta.env.VITE_USE_MOCK === 'true') {
  //   const { worker } = await import('./mocks/browser')
  //   await worker.start({ onUnhandledRequest: 'bypass' })
  // }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  )
}

main()
