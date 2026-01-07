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
