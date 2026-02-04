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
