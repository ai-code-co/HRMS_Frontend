<script setup lang="ts">
import { ArrowUpRight, ArrowDownRight } from 'lucide-vue-next';

interface Props {
    label: string;
    value: string;
    trend?: string;
    icon: any;
    color: 'indigo' | 'emerald' | 'amber' | 'purple' | 'rose';
}

const props = defineProps<Props>();

// Map colors to safe Tailwind classes to ensure they aren't purged
const colorStyles = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    rose: 'bg-rose-50 text-rose-600',
};

const trendColor = computed(() =>
    props.trend?.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'
);
</script>

<template>
    <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
            :class="colorStyles[color]">
            <component :is="icon" :size="20" />
        </div>
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">
            {{ label }}
        </p>
        <div class="flex items-baseline justify-between gap-2">
            <h4 class="text-2xl font-black text-slate-800">{{ value }}</h4>
            <div v-if="trend" class="flex items-center gap-0.5 text-[10px] font-bold" :class="trendColor">
                <ArrowUpRight v-if="trend.startsWith('+')" :size="12" />
                <ArrowDownRight v-else :size="12" />
                {{ trend }}
            </div>
        </div>
    </div>
</template>