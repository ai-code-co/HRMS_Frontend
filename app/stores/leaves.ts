import { defineStore } from 'pinia'
import type {
    LeaveRequestAPI,
    LeaveListResponse,
    LeaveBalanceResponse,
    LeaveStatus
} from '~/types/leaves'

export const useLeaveStore = defineStore('leaves', {
    state: () => ({
        requests: [] as LeaveRequestAPI[],
        balances: {} as Record<string, any>,
        loading: false,
        error: null as string | null,
    }),

    getters: {
        // Simple computed properties for data access
        leaveRequests: (state) => state.requests,
        leaveBalances: (state) => state.balances,
        isLoading: (state) => state.loading,
    },

    actions: {
        async fetchLeaves() {
            this.error = null
            try {
                const res = await useApi<LeaveListResponse>('/api/leaves/')
                this.requests = res.results
            } catch (err: any) {
                this.error = err?.message || 'Failed to fetch leave requests'
                const toast = useToast()
                toast.add({
                    title: 'Error',
                    description: this.error || 'Failed to fetch leave requests',
                    color: 'error'
                })
            }
        },

        async fetchLeaveBalances() {
            this.error = null
            try {
                const res = await useApi<LeaveBalanceResponse>('/api/leaves/balance/')
                if (res.error === 0) {
                    this.balances = res.data
                }
            } catch (err: any) {
                this.error = err?.message || 'Failed to fetch leave balances'
                const toast = useToast()
                toast.add({
                    title: 'Error',
                    description: this.error || 'Failed to fetch leave balances',
                    color: 'error'
                })
            }
        },

        async applyLeave(payload: any) {
            this.loading = true
            this.error = null
            try {
                await useApi('/api/leaves/', {
                    method: 'POST',
                    body: payload
                })
                await this.fetchLeaves()
                await this.fetchLeaveBalances()
                const toast = useToast()
                toast.add({
                    title: 'Success',
                    description: 'Leave request submitted successfully',
                    color: 'success'
                })
            } catch (err: any) {
                this.error = err?.message || 'Failed to submit leave request'
                const toast = useToast()
                toast.add({
                    title: 'Error',
                    description: this.error || 'Failed to submit leave request',
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
            const payload = { status }
            try {
                await useApi(`/api/leaves/${id}/`, {
                    method: 'PATCH',
                    body: payload
                })
                await this.fetchLeaves()
                await this.fetchLeaveBalances()
                const toast = useToast()
                toast.add({
                    title: 'Success',
                    description: 'Leave request updated successfully',
                    color: 'success'
                })
            } catch (err: any) {
                this.error = err?.message || 'Failed to update leave request'
                const toast = useToast()
                toast.add({
                    title: 'Error',
                    description: this.error || 'Failed to update leave request',
                    color: 'error'
                })
                throw err
            } finally {
                this.loading = false
            }
        }
    }
})