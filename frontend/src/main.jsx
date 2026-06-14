import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'
import App from './App.jsx'
import { AnonymousAuthProvider, ClerkAuthProvider } from './auth/AuthContext.jsx'
import './index.css'

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const app = clerkPublishableKey ? (
  <ClerkProvider afterSignOutUrl="/">
    <ClerkAuthProvider>
      <App />
    </ClerkAuthProvider>
  </ClerkProvider>
) : (
  <AnonymousAuthProvider>
    <App />
  </AnonymousAuthProvider>
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {app}
  </React.StrictMode>
)
