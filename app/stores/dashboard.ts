import { defineStore } from 'pinia'
import {
    UserCheck, CalendarDays, Briefcase, Award
} from 'lucide-vue-next'

export const useDashboardStore = defineStore('dashboard', {
    state: () => ({
        raw_data: null as any,
        loading: false,
        error: null as string | null
    }),

    getters: {
        stats: (state) => {
            if (!state.raw_data) return []
            const ov = state.raw_data.overview
            return [
                { label: "Monthly Attendance", value: ov.monthly_attendance_pct, trend: ov.attendance_trend, icon: UserCheck, color: "indigo" },
                { label: "Leave Balance", value: ov.leave_balance, icon: CalendarDays, color: "emerald" },
                { label: "Tasks Completed", value: ov.tasks_completed.toString(), trend: ov.tasks_trend, icon: Briefcase, color: "amber" },
                { label: "Employee Score", value: ov.employee_score.toString(), icon: Award, color: "purple" }
            ]
        },
        events: (state) => {
            if (!state.raw_data) return []
            return state.raw_data.upcoming_holidays.map((h: any) => ({
                title: h.name,
                sub: `${h.type} • ${h.date}`,
                icon: CalendarDays,
                color: "indigo"
            }))
        },
        distribution: (state) => {
            if (!state.raw_data) return []
            const colors = ['bg-indigo-600', 'bg-emerald-500', 'bg-amber-400', 'bg-slate-200']
            return state.raw_data.leave_chart.breakdown.map((item: any, index: number) => ({
                label: item.label,
                value: item.value.toString(),
                color: colors[index] || 'bg-slate-200'
            }))
        },
        highlight: (state) => {
            if (!state.raw_data) return null
            const perf = state.raw_data.performance_widget
            return {
                title: perf.title,
                description: perf.message,
                action: 'View Stats'
            }
        }
    },

    actions: {
        async fetchSummary() {
            this.loading = true
            try {
                const response = await useApi('/api/dashboard/summary/')
                if (response.error === 0) {
                    this.raw_data = response.data
                }
            } catch (err: any) {
                this.error = err.message
            } finally {
                this.loading = false
            }
        }
    }
})