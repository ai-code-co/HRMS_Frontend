export interface RolePermissions {
  can_view_all_employees: boolean
  can_create_employees: boolean
  can_edit_all_employees: boolean
  can_delete_employees: boolean
  can_view_subordinates: boolean
  can_approve_leave: boolean
  can_approve_timesheet: boolean
}

export interface RoleDetail extends RolePermissions {
  id: number
  role: 'Admin' | 'HR' | 'Manager' | 'Employee'
  description: string
  is_active: boolean
}

export interface AuthUser {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  photo_url?: string
  role_detail: RoleDetail
  is_active: boolean
  is_verified: boolean
}
