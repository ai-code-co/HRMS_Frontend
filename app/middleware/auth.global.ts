export default defineNuxtRouteMiddleware((to) => {
    const { token, isAuthenticated, hasPermission } = useAuth()

    const resetRoutes = ['/forgot-password', '/reset-password'];
    const publicRoutes = ['/login']
    const isPublicRoute = publicRoutes.includes(to.path)

    if (resetRoutes.includes(to.path)) {
        return
    }
    
    if (isPublicRoute && isAuthenticated.value) {
        return navigateTo('/dashboard')
    }

    if (!isPublicRoute && !token.value) {
        return navigateTo('/login')
    }

    const requiredPermission = to.meta.permission as string | undefined
    if (requiredPermission && !hasPermission(requiredPermission as any)) {
        return navigateTo('/dashboard')
    }
})