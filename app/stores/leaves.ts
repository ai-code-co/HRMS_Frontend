import { defineStore } from 'pinia'
import { leaveMeta } from '~/config/leaveMeta'
import type { LeaveBalanceResponse, LeaveListResponse, LeaveRequestAPI } from '~/types/leaves'

export const useLeaveStore = defineStore('leave', {
    state: () => ({
        requests: [] as LeaveRequestAPI[],
        balancesRaw: {} as LeaveBalanceResponse['data'],
        loading: false,
    }),

    getters: {
        uiRequests: (state) =>
            state.requests.map(r => ({
                id: r.id,
                type: r.leave_type,
                startDate: new Date(r.from_date).toLocaleDateString(),
                endDate: new Date(r.to_date).toLocaleDateString(),
                duration: `${r.no_of_days} Days`,
                status: r.status.toLowerCase(),
                reason: r.reason,
                appliedDate: new Date(r.created_at).toLocaleDateString(),
            })),
        uiBalances: (state) =>
            Object.entries(state.balancesRaw)
                .map(([type, data]) => ({
                    type,
                    total: data.allocated,
                    used: data.used,
                    color: leaveMeta[type]?.color ?? 'indigo',
                    icon: leaveMeta[type]?.icon ?? 'i-lucide-file',
                })),
    },

    actions: {
        async fetchLeaves() {
            this.loading = true
            try {
                const res = await useApi<LeaveListResponse>('/api/leaves/')
                this.requests = res.results
            } finally {
                this.loading = false
            }
        },
        async fetchLeaveBalances() {
            const res = await useApi<LeaveBalanceResponse>('/api/leaves/balance/')
            this.balancesRaw = res.data
            console.log(this.balancesRaw, 'balances')
        },
    },
})
