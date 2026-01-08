import { useAuth } from './useAuth'
import { canAccessNavItem, getAccessibleNavItems } from '~/utils/roleConfig'
import type { NavigationItem } from '~/utils/roleConfig'

export const useRoleAccess = () => {
    const { user, role, hasPermission } = useAuth()

    const hasRole = (requiredRole: string | string[]): boolean => {
        if (!role.value) return false
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
        return roles.includes(role.value)
    }

    const canAccessItem = (item: NavigationItem): boolean => {
        return canAccessNavItem(item, user.value?.role_detail || null)
    }

    const getAccessibleItems = (): NavigationItem[] => {
        return getAccessibleNavItems(user.value?.role_detail || null)
    }
    const isAdmin = computed(() => hasRole('Admin'))
    const isHR = computed(() => hasRole('HR'))
    const isManager = computed(() => hasRole('Manager'))
    const isEmployee = computed(() => hasRole('Employee'))
    const isSuperUser = computed(() => isAdmin.value || isHR.value)

    return {
        role,
        user,
        hasRole,
        hasPermission,
        canAccessItem,
        getAccessibleItems,
        isAdmin,
        isHR,
        isManager,
        isEmployee,
        isSuperUser,
    }
}
