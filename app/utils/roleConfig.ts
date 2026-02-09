import type { RoleDetail } from '~/types/auth'

export interface NavigationItem {
  label: string
  icon?: string
  to?: string
  requiredRole?: ('Admin' | 'HR' | 'Manager' | 'Employee')[]
  requiredPermission?: string
  children?: NavigationItem[]
}

export const navigationItems: NavigationItem[] = [
  { label: 'Profile', icon: 'i-lucide-user', to: '/profile' },
  { label: 'Dashboard', icon: 'i-lucide-house', to: '/dashboard' },
  { label: 'Attendance', icon: 'i-lucide-calendar', to: '/attendance' },
  { label: 'My Inventory', icon: 'i-lucide-monitor', to: '/inventory' },
  { label: 'Leaves', icon: 'i-lucide-file-text', to: '/leaves' },
  { label: 'Salary', icon: 'i-lucide-dollar-sign', to: '/salary' },
  { label: 'Teams', icon: 'i-lucide-users', to: '/teams', requiredRole: ['Admin'] },
  { label: 'Settings', icon: 'i-lucide-settings', to: '/settings', requiredRole: ['Admin', 'HR'] },
  {
    label: 'Inventory',
    icon: 'i-lucide-wrench',
    to: '/adminInventory?category=1',
    requiredRole: ['Admin', 'HR'],
  },
  { label: 'Interview', icon: 'i-lucide-users', to: '/interview', requiredRole: ['Admin'] },
  { label: 'Holidays', icon: 'i-lucide-sun', to: '/holidays' },
]

export const canAccessNavItem = (item: NavigationItem, roleDetail: RoleDetail | null): boolean => {
  const { isSuperUser } = useRoleAccess()
  const { selectedEmployeeId } = useEmployeeContext()
  if (!roleDetail) return false

  if (!item.requiredRole) return true
  if (isSuperUser.value && selectedEmployeeId.value) {
    if (item.label === 'Holidays' || item.label === 'Inventory' || item.label === 'Interview' || item.label === 'Teams') return false
  }
  return item.requiredRole.includes(roleDetail.role)
}

export const getAccessibleNavItems = (roleDetail: RoleDetail | null): NavigationItem[] => {
  return navigationItems.filter(item => canAccessNavItem(item, roleDetail))
}

export const rolePermissionMap: Record<string, string[]> = {
  Admin: [
    'can_view_all_employees',
    'can_create_employees',
    'can_edit_all_employees',
    'can_delete_employees',
    'can_view_subordinates',
    'can_approve_leave',
    'can_approve_timesheet',
  ],
  HR: [
    'can_view_all_employees',
    'can_create_employees',
    'can_edit_all_employees',
    'can_approve_leave',
    'can_approve_timesheet',
  ],
  Manager: ['can_view_subordinates', 'can_approve_leave', 'can_approve_timesheet'],
  Employee: [],
}
