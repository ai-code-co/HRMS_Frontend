<script setup lang="ts">
defineProps<{
    title: string;
    total: string | number;
    sub: string;
    data: { label: string; value: string; color: string }[];
}>();

const legendColorMap: Record<string, string> = {
    'bg-indigo-600': 'bg-indigo-600',
    'bg-emerald-500': 'bg-emerald-500',
    'bg-slate-200': 'bg-slate-200',
};
</script>

<template>
    <section class="bg-white border border-slate-100 rounded-2xl px-5 py-8 md:p-8 shadow-sm">
        <h3 class="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-8 text-center">
            {{ title }}
        </h3>

        <div class="relative w-40 h-40 md:w-48 md:h-48 mx-auto mb-10">
            <svg class="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="70" stroke="#f1f5f9" stroke-width="20" fill="transparent" />
                <circle cx="50%" cy="50%" r="70" stroke="#4f46e5" stroke-width="20" stroke-dasharray="440"
                    stroke-dashoffset="120" stroke-linecap="round" fill="transparent" class="chart-segment" />
                <circle cx="50%" cy="50%" r="70" stroke="#10b981" stroke-width="20" stroke-dasharray="440"
                    stroke-dashoffset="380" stroke-linecap="round" fill="transparent" class="chart-segment delay-200" />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-3xl font-black text-slate-800">{{ total }}</span>
                <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{{ sub }}</span>
            </div>
        </div>

        <div class="space-y-4">
            <div v-for="(item, i) in data" :key="i" class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-2 h-2 rounded-full" :class="legendColorMap[item.color]"></div>
                    <span class="text-[11px] font-bold text-slate-500">{{ item.label }}</span>
                </div>
                <span class="text-xs font-black text-slate-800">{{ item.value }}</span>
            </div>
        </div>
    </section>
</template>

<style scoped>
.chart-segment {
    transition: stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.delay-200 {
    transition-delay: 200ms;
}

@starting-style {
    .chart-segment {
        stroke-dashoffset: 440;
    }
}
</style>