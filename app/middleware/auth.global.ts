export default defineNuxtRouteMiddleware((to, from) => {
    const { token } = useAuth()

    const restrictedRoutes = ['/', '/leaves', '/employees', '/settings', '/dashboard', '/profile', '/attendance']
    if (restrictedRoutes.includes(to.path) && !token.value) {
        return navigateTo('/login')
    }
})