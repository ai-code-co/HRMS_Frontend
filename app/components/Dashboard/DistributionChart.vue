<script setup lang="ts">
defineProps<{
    title: string;
    total: string;
    sub: string;
    data: { label: string; value: string; color: string }[];
}>();

// Map generic colors to specific Tailwind background classes for the legend
const legendColorMap: Record<string, string> = {
    'bg-indigo-600': 'bg-indigo-600',
    'bg-emerald-500': 'bg-emerald-500',
    'bg-slate-200': 'bg-slate-200',
};
</script>

<template>
    <section class="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
        <h3 class="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8 text-center">
            {{ title }}
        </h3>

        <!-- SVG Chart -->
        <div class="relative w-48 h-48 mx-auto mb-10">
            <svg class="w-full h-full transform -rotate-90">
                <!-- Background Circle -->
                <circle cx="50%" cy="50%" r="70" stroke="#f1f5f9" stroke-width="20" fill="transparent" />
                <!-- Segment 1 (Blue) -->
                <circle v-motion :initial="{ strokeDashoffset: 440 }"
                    :enter="{ strokeDashoffset: 120, transition: { duration: 1000, type: 'spring' } }" cx="50%" cy="50%"
                    r="70" stroke="#4f46e5" stroke-width="20" stroke-dasharray="440" stroke-linecap="round"
                    fill="transparent" />
                <!-- Segment 2 (Green) -->
                <circle v-motion :initial="{ strokeDashoffset: 440 }"
                    :enter="{ strokeDashoffset: 380, transition: { duration: 1000, delay: 200, type: 'spring' } }"
                    cx="50%" cy="50%" r="70" stroke="#10b981" stroke-width="20" stroke-dasharray="440"
                    stroke-linecap="round" fill="transparent" />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-3xl font-black text-slate-800">{{ total }}</span>
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{{ sub }}</span>
            </div>
        </div>

        <!-- Legend -->
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