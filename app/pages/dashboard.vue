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
                        {{ currentRole === 'admin' ? 'Organization Insights' : `Welcome back, ${userName}!` }}
                    </h1>
                    <p class="text-sm font-medium text-slate-400 mt-1">
                        {{ currentRole === 'admin'
                            ? "Here's what's happening in Nebula today."
                            : dashboardStore.raw_data?.performance_widget?.message }}
                    </p>
                </div>
                <div class="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
                    <CalendarDays class="text-indigo-500" :size="20" />
                    <span class="text-sm font-bold text-slate-600">{{ displayDate }}</span>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardStatCard v-for="(stat, index) in dashboardStore.stats" :key="index" v-bind="stat" />
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div class="xl:col-span-2 space-y-8">
                    <DashboardActivityChart :role="currentRole"
                        :data="dashboardStore.raw_data?.productivity?.graph_data" />

                    <DashboardEventsList :title="currentRole === 'admin' ? 'Pending Approvals' : 'Upcoming Holidays'"
                        :items="dashboardStore.events" :action-label="currentRole === 'admin' ? 'Review' : 'Details'" />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-8">
                    <DashboardDistributionChart :title="currentRole === 'admin' ? 'Team Distribution' : 'Leave Balance'"
                        :total="currentRole === 'admin' ? '1.2k' : dashboardStore.raw_data?.leave_chart?.total_left"
                        :sub="currentRole === 'admin' ? 'Total Staff' : 'leaves Left'"
                        :data="dashboardStore.distribution" />

                    <DashboardHighlightCard v-if="dashboardStore.highlight" v-bind="dashboardStore.highlight" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { CalendarDays } from 'lucide-vue-next';
import { useDashboardStore } from '~/stores/dashboard';

const dashboardStore = useDashboardStore();
await useAsyncData('dashboard-data', async () => {
    await dashboardStore.fetchSummary();
})

const currentRole = ref('user');

const toggleRole = () => {
    currentRole.value = currentRole.value === 'user' ? 'admin' : 'user';
}

const displayDate = computed(() => {
    return dashboardStore.raw_data?.user?.date ||
        new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
});

const userName = computed(() => dashboardStore.raw_data?.user?.first_name || 'User');
</script>