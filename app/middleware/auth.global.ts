export default defineNuxtRouteMiddleware((to) => {
    const { hasPermission } = useAuth()

    const requiredPermission = to.meta.permission as string | undefined
    if (!requiredPermission) return

    if (!hasPermission(requiredPermission as any)) {
        return navigateTo('/dashboard')
    }
})