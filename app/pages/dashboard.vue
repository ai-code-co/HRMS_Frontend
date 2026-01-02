<script setup lang="ts">
import {
    Users, UserCheck, CalendarDays, Clock, TrendingUp,
    Briefcase, Smile, Award
} from 'lucide-vue-next';
import type { DashboardData, UserRole } from '~/types/dashboard';

const currentRole = ref<UserRole>('user');

const toggleRole = () => {
    currentRole.value = currentRole.value === 'user' ? 'admin' : 'user';
}

const adminData: DashboardData = {
    stats: [
        { label: "Total Employees", value: "1,248", trend: "+12", icon: Users, color: "indigo" },
        { label: "Present Today", value: "98%", trend: "+3.2", icon: UserCheck, color: "emerald" },
        { label: "Pending Leaves", value: "14", trend: "-2", icon: CalendarDays, color: "amber" },
        { label: "Avg. Work Hours", value: "8.4h", trend: "+0.2", icon: Clock, color: "purple" }
    ],
    events: [
        { title: "Sarah Miller", sub: "Annual Leave Request (3 Days)", icon: CalendarDays, color: "indigo" },
        { title: "Marcus Chen", sub: "Expense Reimbursement", icon: TrendingUp, color: "emerald" },
        { title: "Inventory Restock", sub: "50x Wireless Mouse", icon: Briefcase, color: "amber" },
    ],
    distribution: [
        { label: 'Engineering', value: '45%', color: 'bg-indigo-600' },
        { label: 'Design', value: '30%', color: 'bg-emerald-500' },
        { label: 'Marketing', value: '25%', color: 'bg-slate-200' },
    ],
    highlight: {
        title: 'Employee of the Month',
        description: 'Congratulations to Sarah Miller for outstanding performance in the Q3 product launch!',
        action: 'Celebrate'
    }
};

const userData: DashboardData = {
    stats: [
        { label: "Monthly Attendance", value: "95%", trend: "+2.4", icon: UserCheck, color: "indigo" },
        { label: "Leave Balance", value: "12 Days", icon: CalendarDays, color: "emerald" },
        { label: "Tasks Completed", value: "28", trend: "+5", icon: Briefcase, color: "amber" },
        { label: "Employee Score", value: "4.8", icon: Award, color: "purple" }
    ],
    events: [
        { title: "Halloween Holiday", sub: "Company-wide Holiday • Oct 31", icon: CalendarDays, color: "indigo" },
        { title: "Team Lunch", sub: "Design Department • Nov 02", icon: Smile, color: "emerald" },
        { title: "System Update", sub: "HR Portal Maintenance • Nov 05", icon: Clock, color: "rose" },
    ],
    distribution: [
        { label: 'Annual Leave', value: '8', color: 'bg-indigo-600' },
        { label: 'Sick Leave', value: '4', color: 'bg-emerald-500' },
        { label: 'Casual Leave', value: '2', color: 'bg-slate-200' },
    ],
    highlight: {
        title: 'Top Performer!',
        description: 'Great job, John! Your efficiency this week is 15% higher than the team average.',
        action: 'View Stats'
    }
};

const currentData = computed(() => currentRole.value === 'admin' ? adminData : userData);
const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
</script>

<template>
    <div class="flex-1 h-full overflow-y-auto custom-scrollbar p-4 md:p-8 max-w-[1600px] mx-auto w-full bg-[#F8FAFC]">

        <div class="space-y-8 pb-20">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div class="flex items-center gap-3">
                        <p class="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-1">Overview</p>
                        <button @click="toggleRole"
                            class="text-[9px] bg-slate-200 px-2 py-0.5 rounded text-slate-500 hover:bg-slate-300 transition">
                            Switch to {{ currentRole === 'user' ? 'Admin' : 'User' }} View
                        </button>
                    </div>
                    <h1 class="text-3xl font-black text-slate-800 tracking-tight">
                        {{ currentRole === 'admin' ? 'Organization Insights' : 'Welcome back, John!' }}
                    </h1>
                    <p class="text-sm font-medium text-slate-400 mt-1">
                        {{ currentRole === 'admin'
                            ? "Here's what's happening in Nebula today."
                            : "You're on track! You've been present 95% of this month." }}
                    </p>
                </div>
                <div class="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
                    <CalendarDays class="text-indigo-500" :size="20" />
                    <span class="text-sm font-bold text-slate-600">{{ currentDate }}</span>
                </div>
            </div>

            <!-- Key Stats Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardStatCard v-for="(stat, index) in currentData.stats" :key="index" v-bind="stat"
                    :class="`delay-${index * 100}`" />
            </div>
            <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div class="xl:col-span-2 space-y-8">
                    <DashboardActivityChart :role="currentRole" />
                    <DashboardEventsList :title="currentRole === 'admin' ? 'Pending Approvals' : 'Upcoming Holidays'"
                        :items="currentData.events" :action-label="currentRole === 'admin' ? 'Review' : 'Details'" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-8">
                    <DashboardDistributionChart :title="currentRole === 'admin' ? 'Team Distribution' : 'Leave Balance'"
                        :total="currentRole === 'admin' ? '1.2k' : '12'"
                        :sub="currentRole === 'admin' ? 'Total Staff' : 'Days Left'" :data="currentData.distribution" />
                    <DashboardHighlightCard v-bind="currentData.highlight" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
}
</style>