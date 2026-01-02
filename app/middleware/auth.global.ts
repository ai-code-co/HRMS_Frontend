export default defineNuxtRouteMiddleware((to, from) => {
    const { token, isAuthenticated } = useAuth()

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/forgot-password', '/reset-password']
    const isPublicRoute = publicRoutes.includes(to.path)

    // Redirect authenticated users away from auth pages
    if (isPublicRoute && isAuthenticated.value) {
        return navigateTo('/')
    }

    // Redirect unauthenticated users to login (except for public routes)
    if (!isPublicRoute && !token.value) {
        return navigateTo('/login')
    }
})