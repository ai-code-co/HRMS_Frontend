<template>
    <div class="flex-1 h-full p-4 md:p-8 mx-auto w-full bg-[#F8FAFC]">
        <div class="space-y-8 pb-20">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div class="flex items-center gap-3">
                        <p class="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-1">Overview</p>
                        <!-- <button @click="toggleRole"
                            class="text-[9px] bg-slate-200 px-2 py-0.5 rounded text-slate-500 hover:bg-slate-300 transition">
                            Switch to {{ currentRole === 'user' ? 'Admin' : 'User' }} View
                        </button> -->
                    </div>
                    <h1 class="text-3xl font-black text-slate-800 tracking-tight">
                        {{ currentRole === 'admin' ? 'Organization Insights' : `Welcome back, ${userName} !` }}
                    </h1>
                    <p class="text-sm font-medium text-slate-400 mt-1">
                        {{ currentRole === 'admin'
                            ? "Here's what's happening in Nebula today."
                            : dashboardStore.performanceWidget?.message }}
                    </p>
                </div>
                <div class="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
                    <CalendarDays class="text-indigo-500" :size="20" />
                    <span class="text-sm font-bold text-slate-600">{{ displayDate }}</span>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardStatCard v-for="(stat, index) in stats" :key="index" v-bind="stat" />
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div class="xl:col-span-2 space-y-8">
                    <DashboardActivityChart :role="currentRole"
                        :data="dashboardStore.dashboardData?.productivity?.graph_data || []"
                        :daily-average="dashboardStore.dashboardData?.productivity?.daily_average" />

                    <DashboardEventsList :title="currentRole === 'admin' ? 'Pending Approvals' : 'Upcoming Holidays'"
                        :items="events" />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-8">
                    <DashboardDistributionChart :title="currentRole === 'admin' ? 'Team Distribution' : 'Leave Balance'"
                        :total="currentRole === 'admin' ? '1.2k' : dashboardStore.dashboardData?.leave_chart?.total_left"
                        :sub="currentRole === 'admin' ? 'Total Staff' : 'leaves Left'" :data="distribution" />

                    <DashboardHighlightCard v-if="highlight" v-bind="highlight" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { CalendarDays, UserCheck, Briefcase, Award } from 'lucide-vue-next';
import { useDashboardStore } from '~/stores/dashboard';
const { selectedEmployeeId } = useEmployeeContext()

const dashboardStore = useDashboardStore();
const { data: dashboardData } = await useAsyncData('dashboard-data', () => {
    return dashboardStore.fetchSummary()
}, {
    watch: [selectedEmployeeId],
})

if (import.meta.client && dashboardData.value) {
    dashboardStore.setDashboardData(dashboardData.value)
}

const currentRole = ref('user');

const toggleRole = () => {
    currentRole.value = currentRole.value === 'user' ? 'admin' : 'user';
}

const displayDate = computed(() => {
    return dashboardStore.dashboardData?.user?.date ||
        new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
});

const userName = computed(() => dashboardStore.dashboardData?.user?.first_name || 'User');

// UI-specific data transformations
const stats = computed(() => {
    const overview = dashboardStore.overview;
    if (!overview) return [];

    return [
        {
            label: "Monthly Attendance",
            value: overview.monthly_attendance_pct,
            trend: overview.attendance_trend,
            icon: UserCheck,
            color: "indigo"
        },
        {
            label: "Leave Balance",
            value: overview.leave_balance,
            icon: CalendarDays,
            color: "emerald"
        },
        {
            label: "Tasks Completed",
            value: overview.tasks_completed.toString(),
            trend: overview.tasks_trend,
            icon: Briefcase,
            color: "amber"
        },
        {
            label: "Employee Score",
            value: overview.employee_score.toString(),
            icon: Award,
            color: "purple"
        }
    ];
});

const events = computed(() => {
    return dashboardStore.upcomingHolidays.map(holiday => ({
        title: holiday.name,
        sub: `${holiday.type} • ${holiday.date}`,
        icon: CalendarDays,
        color: "indigo"
    }));
});

const distribution = computed(() => {
    const colors = ['bg-indigo-600', 'bg-emerald-500', 'bg-amber-400', 'bg-slate-200'];
    return dashboardStore.leaveBreakdown.map((item, index) => ({
        label: item.label,
        value: item.value.toString(),
        color: colors[index] || 'bg-slate-200'
    }));
});

const highlight = computed(() => {
    const widget = dashboardStore.performanceWidget;
    if (!widget) return null;

    return {
        title: widget.title,
        description: widget.message,
        action: 'View Stats'
    };
});
</script>