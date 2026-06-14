import { createContext, useContext, useMemo } from 'react'
import {
  Show,
  SignInButton,
  UserButton,
  useAuth,
  useClerk,
} from '@clerk/react'

const AuthContext = createContext(null)

const anonymousAuth = {
  configured: false,
  isLoaded: true,
  isSignedIn: false,
  userId: null,
  getToken: async () => null,
  openSignIn: () => {},
}

export function AnonymousAuthProvider({ children }) {
  return <AuthContext.Provider value={anonymousAuth}>{children}</AuthContext.Provider>
}

export function ClerkAuthProvider({ children }) {
  const auth = useAuth()
  const clerk = useClerk()
  const value = useMemo(() => ({
    configured: true,
    isLoaded: auth.isLoaded,
    isSignedIn: Boolean(auth.isSignedIn),
    userId: auth.userId || null,
    getToken: auth.getToken,
    openSignIn: () => clerk.openSignIn(),
  }), [auth.getToken, auth.isLoaded, auth.isSignedIn, auth.userId, clerk])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function AuthControls({ className }) {
  const auth = useWouessiAuth()

  if (!auth.configured) {
    return <span className={className} title="Configure Clerk to enable accounts">Account unavailable</span>
  }

  if (!auth.isLoaded) {
    return <span className={className}>Loading account…</span>
  }

  return (
    <div className={`${className} authControls`}>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button type="button">Sign in</button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </div>
  )
}

export function useWouessiAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useWouessiAuth must be used inside an auth provider')
  return context
}
