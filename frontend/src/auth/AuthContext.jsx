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
  openUserProfile: () => {},
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
    openUserProfile: () => clerk.openUserProfile(),
  }), [auth.getToken, auth.isLoaded, auth.isSignedIn, auth.userId, clerk])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function AuthControls({ className, onOpenDashboard }) {
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
          <button className="authSignInButton" type="button">Sign in</button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        {onOpenDashboard && (
          <button className="authDashboardButton" type="button" onClick={onOpenDashboard}>
            My websites
          </button>
        )}
        <div className="authAccountControl">
          <button className="authAccountButton" type="button" onClick={auth.openUserProfile}>
            Account
          </button>
          <UserButton />
        </div>
      </Show>
    </div>
  )
}

export function useWouessiAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useWouessiAuth must be used inside an auth provider')
  return context
}
