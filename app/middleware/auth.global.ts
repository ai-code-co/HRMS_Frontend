import { canAccessNavItem, navigationItems } from '~/utils/roleConfig'

export default defineNuxtRouteMiddleware(async (to) => {
    const { token, isAuthenticated, hasPermission, user } = useAuth()

    const resetRoutes = ['/forgot-password', '/reset-password']
    const publicRoutes = ['/login', '/audit']
    const isPublicRoute = publicRoutes.includes(to.path)

    if (resetRoutes.includes(to.path)) {
        return
    }

    if (to.path === '/login' && isAuthenticated.value) {
        return navigateTo('/dashboard')
    }

    if (!publicRoutes.includes(to.path) && !token.value) {
        return navigateTo('/login')
    }

    if (token.value && isAuthenticated.value) {
        try {
            const auditStore = useAuditStore()

            if (!auditStore.auditStatus) {
                await auditStore.fetchAuditStatus()
            }

            if (to.path !== '/audit' && !auditStore.allItemsAudited) {
                return navigateTo('/audit')
            }
        } catch (err) {
            console.error('Failed to check audit status:', err)
        }
    }

    const requiredPermission = to.meta.permission as string | undefined
    if (requiredPermission && !hasPermission(requiredPermission as any)) {
        return navigateTo('/dashboard')
    }

    const currentPath = to.path
    const navItem = navigationItems.find(item => item.to === currentPath)

    if (navItem && !canAccessNavItem(navItem, user.value?.role_detail || null)) {
        return navigateTo('/dashboard')
    }
})