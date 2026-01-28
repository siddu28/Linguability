import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isMounted = true

        async function init() {
            const { data, error } = await supabase.auth.getSession()
            if (!isMounted) return
            if (error) {
                console.error('supabase.auth.getSession error:', error)
            }
            setSession(data?.session ?? null)
            setLoading(false)
        }

        init()

        const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession)
            setLoading(false)
        })

        return () => {
            isMounted = false
            subscription?.subscription?.unsubscribe?.()
        }
    }, [])

    const value = useMemo(
        () => ({
            session,
            user: session?.user ?? null,
            loading,
        }),
        [session, loading],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
    return ctx
}
