export const useAuth = () => {
    const token = useCookie<string | null>('token', {
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
        sameSite: 'lax',
    }) as Ref<string | null>
    const refreshTokenCookie = useCookie<string | null>('refresh_token', {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
        sameSite: 'lax',
        httpOnly: false,
    })
    const user = useState<any | null>('user', () => null)

    const setAuth = (access: string, refresh: string) => {
        token.value = access
        refreshTokenCookie.value = refresh
    }

    const clearAuth = () => {
        token.value = null
        refreshTokenCookie.value = null
        user.value = null
    }

    const initAuth = async () => {
        if (!token.value) return
        try {
            const fetchedUser = await useApi<{ user: any }>('/auth/me/', {
                method: 'GET',
                // server: true,
            })
            user.value = fetchedUser;
        } catch (err) {
            clearAuth()
        }
    }
    const refreshToken = async () => {
        try {
            const config = useRuntimeConfig()
            const cookieRefreshToken = useCookie<string | null>('refresh_token')
            const token = useCookie<string | null>('token')

            const { access } = await $fetch<{ access: string }>(
                '/auth/refresh-token/',
                {
                    baseURL: config.public.apiBase,
                    method: 'POST',
                    body: { refresh: cookieRefreshToken.value },
                    retry: 0,
                }
            )

            token.value = access
            return access
        } catch (err) {
            logout()
            throw err
        }
    }

    const logout = async () => {
        try {
            // await useApi('/auth/logout', {
            //     method: 'POST',
            //     credentials: 'include',
            // })
        } catch (err) {
            // Silently fail on logout
        } finally {
            clearAuth()
        }
    }


    const isAuthenticated = computed(() => !!token.value && !!user.value)

    return { token, user, setAuth, clearAuth, initAuth, refreshToken, logout, isAuthenticated }
}