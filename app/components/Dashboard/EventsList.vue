<script setup lang="ts">
import type { EventItem } from '~/types/dashboard';

defineProps<{
    title: string;
    items: EventItem[];
    actionLabel: string;
}>();

const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
};
</script>

<template>
    <section class="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div class="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
            <h3 class="font-black text-slate-700 uppercase text-xs tracking-widest">
                {{ title }}
            </h3>
            <UButton variant="link" color="primary" size="xs" :padded="false">See All</UButton>
        </div>
        <div class="divide-y divide-slate-50">
            <div v-for="(item, i) in items" :key="i"
                class="px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="colorMap[item.color]">
                        <component :is="item.icon" :size="18" />
                    </div>
                    <div>
                        <p class="text-sm font-bold text-slate-700">{{ item.title }}</p>
                        <p class="text-[11px] font-medium text-slate-400">{{ item.sub }}</p>
                    </div>
                </div>
                <UButton size="lg" color="neutral" variant="solid"
                    class="font-bold uppercase tracking-widest shadow-none bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white cursor-pointer transition-all">
                    {{ actionLabel }}
                </UButton>
            </div>
        </div>
    </section>
</template>