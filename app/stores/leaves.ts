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
        balancesRaw: {} as Record<string, any>,
        loading: false,
        error: null as string | null,
    }),

    getters: {
        uiBalances: (state) => {
            const config: Record<string, { icon: string; color: string }> = {
                'Annual Leave': { icon: 'i-lucide-calendar', color: 'indigo' },
                'Sick Leave': { icon: 'i-lucide-thermometer', color: 'rose' },
                'Casual Leave': { icon: 'i-lucide-coffee', color: 'amber' },
                'Maternity Leave': { icon: 'i-lucide-baby', color: 'emerald' },
            }

            return Object.entries(state.balancesRaw).map(([type, data]) => ({
                type,
                total: data.allocated + (data.carried_forward || 0),
                used: data.used,
                available: data.available,
                icon: config[type]?.icon || 'i-lucide-info',
                color: config[type]?.color || 'blue'
            }))
        },
        uiRequests: (state) => {
            return state.requests.map(r => ({
                id: r.id,
                type: r.leave_type,
                startDate: r.from_date,
                endDate: r.to_date,
                duration: `${r.no_of_days} Days`,
                status: r.status.toLowerCase() as LeaveStatus,
                appliedDate: new Date(r.created_at).toLocaleDateString(),
                reason: r.reason
            }))
        }
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
                    this.balancesRaw = res.data
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
        }
    }
})