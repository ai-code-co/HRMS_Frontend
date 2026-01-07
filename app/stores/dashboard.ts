import { defineStore } from 'pinia'

interface Overview {
    monthly_attendance_pct: string
    attendance_trend: string
    leave_balance: string
    tasks_completed: number
    tasks_trend: string
    employee_score: number
}

interface Holiday {
    name: string
    type: string
    date: string
}

interface LeaveBreakdownItem {
    label: string
    value: number
}

interface LeaveChart {
    breakdown: LeaveBreakdownItem[]
}

interface PerformanceWidget {
    title: string
    message: string
}

interface DashboardData {
    overview: Overview
    upcoming_holidays: Holiday[]
    leave_chart: LeaveChart
    performance_widget: PerformanceWidget
}

export const useDashboardStore = defineStore('dashboard', {
    state: () => ({
        dashboardData: null as DashboardData | null,
        loading: false,
        error: null as string | null
    }),

    getters: {
        overview: (state) => state.dashboardData?.overview ?? null,
        upcomingHolidays: (state) => state.dashboardData?.upcoming_holidays ?? [],
        leaveBreakdown: (state) => state.dashboardData?.leave_chart.breakdown ?? [],
        performanceWidget: (state) => state.dashboardData?.performance_widget ?? null
    },

    actions: {
        async fetchSummary() {
            this.loading = true
            this.error = null
            try {
                const response = await useApi('/api/dashboard/summary/')
                if (response.error === 0) {
                    this.dashboardData = response.data
                } else {
                    this.error = 'Failed to fetch dashboard data'
                }
            } catch (err: any) {
                this.error = err.message || 'An error occurred'
            } finally {
                this.loading = false
            }
        }
    }
})