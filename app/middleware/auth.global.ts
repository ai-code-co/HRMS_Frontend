export default defineNuxtRouteMiddleware((to, from) => {
    const { token, isAuthenticated } = useAuth()

    const publicRoutes = ['/login', '/forgot-password', '/reset-password']
    const isPublicRoute = publicRoutes.includes(to.path)

    // Redirect authenticated users away from auth pages
    if (isPublicRoute && isAuthenticated.value) {
        return navigateTo('/dashboard')
    }

    // Redirect unauthenticated users to login (except for public routes)
    if (!isPublicRoute && !token.value) {
        return navigateTo('/login')
    }
})