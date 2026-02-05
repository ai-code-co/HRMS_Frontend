export type LeaveStatus = 'approved' | 'pending' | 'rejected' | 'cancelled'

export interface LeaveRequestAPI {
    id: number
    from_date: string
    to_date: string
    no_of_days: number
    reason: string
    leave_type: string
    status: string
    created_at: string
    doc_link_url: string | null
}

export interface AllLeaveRequestAPI extends LeaveRequestAPI {
    employee_name: string
    employee_id: number
}

export interface RestrictedHolidayDetails {
    id: number
    date: string
    name: string
    description: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface EmployeeDetails {
    id: number
    employee_id: string
    full_name: string
    photo: string | null
}

export interface PendingLeaveRequestAPI {
    id: number
    from_date: string
    to_date: string
    no_of_days: number
    reason: string
    leave_type: string
    is_restricted: boolean
    status: string
    day_status: string
    late_reason: string | null
    doc_link: string | null
    doc_link_url: string | null
    rejection_reason: string | null
    rh_dates: string[]
    created_at: string
    restricted_holiday: number | null
    restricted_holiday_details: RestrictedHolidayDetails | null
    employee: number
    employee_details: EmployeeDetails
}

export interface PendingLeavesResponse {
    error: number
    data: PendingLeaveRequestAPI[]
}

export interface LeaveListResponse {
    count: number
    next: string | null
    previous: string | null
    results: LeaveRequestAPI[]
}

export interface LeaveBalanceAPIItem {
    allocated: number
    used: number
    pending?: number
    available: number
    carried_forward?: number
}

export interface LeaveBalanceResponse {
    error: number
    data: Record<string, LeaveBalanceAPIItem>
}

export interface EmployeeLeaveBalance {
    employee_id: number
    employee_name: string
    designation?: string
    department?: string
    balances: Record<string, LeaveBalanceAPIItem>
    summary: {
        total_allocated: number
        total_used: number
        total_pending: number
        total_available: number
    }
}

export interface EmployeeLeaveBalancesResponse {
    error: number
    data: EmployeeLeaveBalance[]
}
