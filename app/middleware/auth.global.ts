export default defineNuxtRouteMiddleware((to) => {
    const { token, isAuthenticated, hasPermission } = useAuth()

    const publicRoutes = ['/login', '/forgot-password', '/reset-password']
    const isPublicRoute = publicRoutes.includes(to.path)

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