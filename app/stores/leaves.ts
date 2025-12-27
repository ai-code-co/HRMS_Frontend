import { defineStore } from 'pinia'
import type {
    LeaveRequestAPI,
    LeaveListResponse,
    LeaveBalanceResponse,
    LeaveStatus
} from '~/types/leave'

export const useLeaveStore = defineStore('leaves', {
    state: () => ({
        requests: [] as LeaveRequestAPI[],
        balancesRaw: {} as Record<string, any>,
        loading: false,
    }),

    getters: {
        // Transform API Record into UI Array
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

        // Transform API list into UI display format
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
            try {
                const res = await useApi<LeaveListResponse>('/leaves/')
                this.requests = res.results
            } catch (err) {
                console.error('Fetch leaves failed', err)
            }
        },

        async fetchLeaveBalances() {
            try {
                const res = await useApi<LeaveBalanceResponse>('/leaves/balances/')
                if (res.error === 0) {
                    this.balancesRaw = res.data
                }
            } catch (err) {
                console.error('Fetch balances failed', err)
            }
        },

        async applyLeave(payload: any) {
            this.loading = true
            try {
                await useApi('/leaves/apply/', {
                    method: 'POST',
                    body: payload
                })
                await this.fetchLeaves()
                await this.fetchLeaveBalances()
            } finally {
                this.loading = false
            }
        }
    }
})