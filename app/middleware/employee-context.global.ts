const employeeQueryKey = 'employeeId'
const ignoredRoutes = new Set(['/login', '/audit', '/forgot-password', '/reset-password'])

export default defineNuxtRouteMiddleware((to) => {
  if (ignoredRoutes.has(to.path)) return

  const { selectedEmployeeId } = useEmployeeContext()
  if (!selectedEmployeeId.value) return

  const hasEmployeeQuery = Object.prototype.hasOwnProperty.call(to.query, employeeQueryKey)
  if (hasEmployeeQuery) return

  return navigateTo({
    path: to.path,
    query: {
      ...to.query,
      [employeeQueryKey]: String(selectedEmployeeId.value)
    },
    hash: to.hash
  }, { replace: true })
})
