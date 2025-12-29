<script setup lang="ts">
defineProps<{
    role: 'admin' | 'user';
}>();

const dataPoints = [65, 80, 45, 90, 75, 85, 95];
const days = ['18', '19', '20', '21', '22', '23', '24'];
</script>

<template>
    <section class="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
        <div class="flex items-center justify-between mb-10">
            <div>
                <h3 class="text-lg font-black text-slate-800 tracking-tight">
                    {{ role === 'admin' ? 'Attendance Trends' : 'My Productivity' }}
                </h3>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Last 7 Days</p>
            </div>
            <UBadge color="indigo" variant="subtle" size="md" :ui="{ rounded: 'rounded-full' }">
                Daily Average: 8.5h
            </UBadge>
        </div>

        <div class="h-64 flex items-end justify-between gap-4 px-2">
            <div v-for="(h, i) in dataPoints" :key="i" class="flex-1 flex flex-col items-center gap-3 group">
                <div class="relative w-full h-full flex items-end">
                    <div v-motion :initial="{ height: '0%' }"
                        :enter="{ height: `${h}%`, transition: { delay: i * 100, type: 'spring', stiffness: 100 } }"
                        class="w-full rounded-t-xl transition-all duration-300"
                        :class="i === 6 ? 'bg-indigo-600' : 'bg-slate-100 group-hover:bg-indigo-100'"></div>
                </div>
                <span class="text-[10px] font-bold text-slate-400">Oct {{ days[i] }}</span>
            </div>
        </div>
    </section>
</template>