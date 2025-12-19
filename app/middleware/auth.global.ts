export default defineNuxtRouteMiddleware((to, from) => {
    const { token } = useAuth()

    // const restrictedRoutes = ['/',]
    // if (restrictedRoutes.includes(to.path) && !token.value) {
    //     return navigateTo('/login')
    // }
})