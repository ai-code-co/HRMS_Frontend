import type { AuthUser, RolePermissions } from '~/types/auth'

export const useAuth = () => {
    const token = useCookie<string | null>('token', {
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
        sameSite: 'lax',
    })

    const refreshTokenCookie = useCookie<string | null>('refresh_token', {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
        sameSite: 'lax',
        httpOnly: false,
    })
    const user = useState<AuthUser | null>('user', () => null)

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
            const fetchedUser = await useApi<AuthUser>('/auth/me/', {
                method: 'GET',
            })
            user.value = fetchedUser;
        } catch {
            clearAuth()
        }
    }

    const role = computed(() => user.value?.role_detail?.role)

    const permissions = computed<RolePermissions | null>(() => {
        return user.value?.role_detail ?? null
    })

    const hasPermission = (
        permission: keyof RolePermissions
    ): boolean => {
        return Boolean(permissions.value?.[permission])
    }

    const hasAnyPermission = (
        perms: (keyof RolePermissions)[]
    ) => perms.some(p => hasPermission(p))

    const isAuthenticated = computed(() => !!token.value && !!user.value)

    return {
        token,
        user,
        role,
        permissions,
        hasPermission,
        hasAnyPermission,
        setAuth,
        clearAuth,
        initAuth,
        isAuthenticated,
    }
}
