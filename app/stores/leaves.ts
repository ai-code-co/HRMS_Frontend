import { defineStore } from 'pinia'
import type {
    LeaveRequestAPI,
    LeaveListResponse,
    LeaveBalanceResponse,
    EmployeeLeaveBalance,
    LeaveBalanceAPIItem,
    EmployeeLeaveSummaryItem,
    EmployeeLeaveSummaryResponse,
    PendingLeaveRequestAPI,
    PendingLeavesResponse
} from '~/types/leaves'
import { extractErrorMessage } from '~/composables/useErrorMessage'

export const useLeaveStore = defineStore('leaves', {
    state: () => ({
        requests: [] as LeaveRequestAPI[],
        pendingRequests: [] as PendingLeaveRequestAPI[],
        allEmployeeBalances: [] as EmployeeLeaveBalance[],
        balances: {} as Record<string, any>,
        loading: false,
        employeeBalancesLoading: false,
        error: null as string | null,
    }),

    getters: {
        leaveRequests: (state) => state.requests,
        pendingLeaveRequests: (state) => state.pendingRequests,
        pendingLeaveCount: (state) => state.pendingRequests.length,
        leaveBalances: (state) => state.balances,
        isLoading: (state) => state.loading,
        employeeLeaveBalances: (state) => state.allEmployeeBalances,
        employeeBalancesIsLoading: (state) => state.employeeBalancesLoading,
    },

    actions: {
        async fetchLeaves(showGlobalLoader = false, userId?: number | null) {
            this.error = null
            const toast = useToast()
            const { showLoader, hideLoader } = useGlobalLoader()

            if (showGlobalLoader && import.meta.client) {
                showLoader()
            }
            try {
                let params: Record<string, any> = {}
                if (userId) {
                    params.userid = userId
                }
                const res = await useApi<LeaveListResponse>('/api/leaves/', { params })
                this.requests = res.results
                return res.results
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to fetch leave requests')
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error'
                })
                return []
            } finally {
                if (showGlobalLoader && import.meta.client) {
                    hideLoader()
                }
            }
        },

        async fetchLeaveBalances(showGlobalLoader = false, userId?: number | null) {
            this.error = null
            const toast = useToast()
            const { showLoader, hideLoader } = useGlobalLoader()

            if (showGlobalLoader && import.meta.client) {
                showLoader()
            }
            try {
                let params: Record<string, any> = {}
                if (userId) {
                    params.userid = userId
                }
                const res = await useApi<LeaveBalanceResponse>('/api/leaves/balance/', { params })
                if (res.error === 0) {
                    this.balances = res.data
                    return res.data
                }
                return {}
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to fetch leave balances')
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error'
                })
                return {}
            } finally {
                if (showGlobalLoader && import.meta.client) {
                    hideLoader()
                }
            }
        },

        setLeaveData(requests: LeaveRequestAPI[], balances: Record<string, any>, pendingRequests?: PendingLeaveRequestAPI[]) {
            this.requests = requests
            this.balances = balances
            if (pendingRequests) {
                this.pendingRequests = pendingRequests
            }
        },

        async applyLeave(payload: any) {
            this.loading = true
            this.error = null
            const toast = useToast()
            try {
                await useApi('/api/leaves/', {
                    method: 'POST',
                    body: payload
                })
                await this.fetchLeaves()
                await this.fetchLeaveBalances()

                toast.add({
                    title: 'Success',
                    description: 'Leave request submitted successfully',
                    color: 'success'
                })
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to submit leave request')
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error'
                })
                throw err
            } finally {
                this.loading = false
            }
        },

        async updateLeave(id: number, status: any) {
            this.loading = true
            this.error = null
            const toast = useToast()
            let rejection_reason = 'Leave Rejected'
            const payload = { status }
            if(status === 'Rejected') {
                payload.rejection_reason = rejection_reason;
            }
            try {
                await useApi(`/api/leaves/${id}/`, {
                    method: 'PATCH',
                    body: payload
                })
                await this.fetchLeaves()
                await this.fetchLeaveBalances()
                toast.add({
                    title: 'Success',
                    description: 'Leave request updated successfully',
                    color: 'success'
                })
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to update leave request')
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error'
                })
                throw err
            } finally {
                this.loading = false
            }
        },

        async fetchPendingLeaves(showGlobalLoader = false) {
            this.error = null
            const toast = useToast()
            const { showLoader, hideLoader } = useGlobalLoader()

            if (showGlobalLoader && import.meta.client) {
                showLoader()
            }
            try {
                const res = await useApi<PendingLeavesResponse>('/api/leaves/pending-leaves/')
                if (res.error === 0) {
                    this.pendingRequests = res.data
                    return res.data
                }
                return []
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to fetch pending leave requests')
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error'
                })
                return []
            } finally {
                if (showGlobalLoader && import.meta.client) {
                    hideLoader()
                }
            }
        },

        async updateLeaveWithReason(id: number, status: string, reason: string) {
            this.loading = true
            this.error = null
            const toast = useToast()
            const payload: Record<string, any> = { status }

            if (status === 'Rejected') {
                payload.rejection_reason = reason || 'Leave Rejected'
            } else if (status === 'Approved' && reason) {
                payload.approver_notes = reason
            }

            try {
                await useApi(`/api/leaves/${id}/`, {
                    method: 'PATCH',
                    body: payload
                })
                // Refresh pending leaves list
                await this.fetchPendingLeaves()
                toast.add({
                    title: 'Success',
                    description: `Leave request ${status.toLowerCase()} successfully`,
                    color: 'success'
                })
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to update leave request')
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error'
                })
                throw err
            } finally {
                this.loading = false
            }
        },

        async fetchAllEmployeeBalances(showGlobalLoader = false) {
            this.employeeBalancesLoading = true
            this.error = null
            const { showLoader, hideLoader } = useGlobalLoader()

            if (showGlobalLoader && import.meta.client) {
                showLoader()
            }
            try {
                const res = await useApi<EmployeeLeaveSummaryResponse>('/api/leaves/employee-leave-summary/')
                if (res.error === 0) {
                    this.allEmployeeBalances = mapEmployeeLeaveSummary(res.data)
                    return this.allEmployeeBalances
                }
                this.allEmployeeBalances = []
                return []
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to fetch employee leave balances')
                const toast = useToast()
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error'
                })
                return []
            } finally {
                this.employeeBalancesLoading = false
                if (showGlobalLoader && import.meta.client) {
                    hideLoader()
                }
            }
        }
    }
})

function mapEmployeeLeaveSummary(items: EmployeeLeaveSummaryItem[]): EmployeeLeaveBalance[] {
    return items.map(item => {
        const balances: Record<string, LeaveBalanceAPIItem> = {}
        let totalAllocated = 0
        let totalUsed = 0
        let totalPending = 0
        let totalAvailable = 0

        const leaves = item.leaves || {}
        Object.entries(leaves).forEach(([type, values]) => {
            const pending = toPositiveNumber(values?.pending)
            const used = toPositiveNumber(values?.used)
            const available = toPositiveNumber(values?.remaining)
            const allocated = pending + used + available

            balances[type] = {
                allocated,
                used,
                pending,
                available
            }

            totalAllocated += allocated
            totalUsed += used
            totalPending += pending
            totalAvailable += available
        })

        return {
            employee_id: item.employee_id,
            employee_name: item.employee_name,
            balances,
            summary: {
                total_allocated: totalAllocated,
                total_used: totalUsed,
                total_pending: totalPending,
                total_available: totalAvailable
            }
        }
    })
}

function toPositiveNumber(value: unknown) {
    const numberValue = Number(value)
    return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 0
}
