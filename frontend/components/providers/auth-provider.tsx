"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import { ApiError, api } from "@/lib/api"
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  firebaseLogin,
} from "@/lib/services/api"
import {
  isFirebaseConfigured,
  signIn,
  signOutFirebase,
  getFirebaseIdToken,
} from "@/services/firebase"
import type { ApiUser } from "@/lib/api-types"

interface AuthContextValue {
  user: ApiUser | null
  loading: boolean
  isAuthenticated: boolean
  isStaff: boolean
  login: (email: string, password: string) => Promise<ApiUser>
  register: (data: { firstName: string; lastName: string; email: string; password: string; phone?: string }) => Promise<ApiUser>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const refresh = useCallback(async () => {
    try {
      const me = await getCurrentUser()
      setUser(me)
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = useCallback(
    async (email: string, password: string) => {
      if (isFirebaseConfigured) {
        try {
          await signIn(email, password)
          const idToken = await getFirebaseIdToken()
          if (idToken) {
            const me = await firebaseLogin(idToken)
            setUser(me)
            router.refresh()
            return me
          }
        } catch {
          // fall through to server-side (bcrypt) login below
        }
      }
      const me = await loginUser({ email, password })
      setUser(me)
      router.refresh()
      return me
    },
    [router],
  )

  const register = useCallback(
    async (data: { firstName: string; lastName: string; email: string; password: string; phone?: string }) => {
      const me = await registerUser(data)
      setUser(me)
      try {
        await login(data.email, data.password)
      } catch {
        // register succeeded; a failed follow-up login is non-fatal
      }
      router.refresh()
      return me
    },
    [login, router],
  )

  const logout = useCallback(async () => {
    if (isFirebaseConfigured) {
      try {
        await signOutFirebase()
      } catch {
        // ignore Firebase sign-out errors; the session cookie is revoked below
      }
    }
    try {
      await logoutUser()
    } catch {
      // ignore network errors on logout
    }
    setUser(null)
    router.refresh()
    router.push("/")
  }, [router])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isStaff:
        !!user && ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF"].includes(user.role),
      login,
      register,
      logout,
      refresh,
    }),
    [user, loading, login, register, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

// Convenience passthrough so client components can call auth APIs directly.
export { api as authApi, ApiError as AuthApiError }