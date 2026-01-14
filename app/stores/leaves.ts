import { defineStore } from 'pinia'
import type {
    LeaveRequestAPI,
    LeaveListResponse,
    LeaveBalanceResponse,
    LeaveStatus
} from '~/types/leaves'
import { extractErrorMessage } from '~/composables/useErrorMessage'

export const useLeaveStore = defineStore('leaves', {
    state: () => ({
        requests: [] as LeaveRequestAPI[],
        balances: {} as Record<string, any>,
        loading: false,
        error: null as string | null,
    }),

    getters: {
        leaveRequests: (state) => state.requests,
        leaveBalances: (state) => state.balances,
        isLoading: (state) => state.loading,
    },

    actions: {
        async fetchLeaves() {
            this.error = null
            const { isSuperUser } = useRoleAccess();
            const { activeEmployee, selectedEmployeeId } = useEmployeeContext()
            try {
                let params: Record<string, any> = {}
                if (isSuperUser.value && activeEmployee.value) {
                    params.userid = selectedEmployeeId.value
                }
                const res = await useApi<LeaveListResponse>('/api/leaves/', { params })
                this.requests = res.results
                return res.results
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to fetch leave requests')
                const toast = useToast()
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error'
                })
                return []
            }
        },

        async fetchLeaveBalances() {
            this.error = null
            const toast = useToast()
            const { isSuperUser } = useRoleAccess();
            const { activeEmployee, selectedEmployeeId } = useEmployeeContext()
            try {
                let params: Record<string, any> = {}
                if (isSuperUser.value && activeEmployee.value) {
                    params.userid = selectedEmployeeId.value
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
            }
        },

        setLeaveData(requests: LeaveRequestAPI[], balances: Record<string, any>) {
            this.requests = requests
            this.balances = balances
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
            const payload = { status }
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
        }
    }
})