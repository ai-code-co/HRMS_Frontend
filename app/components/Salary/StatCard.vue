<template>
    <div class="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
        <div :class="[
            'w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform',
            colorClasses.bg, colorClasses.text
        ]">
            <UIcon :name="icon" class="w-5 h-5" />
        </div>
        <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{{ label }}</p>
        <div class="flex items-baseline justify-between mb-0.5">
            <h4 class="text-xl font-bold text-slate-800">{{ value }}</h4>
            <UBadge v-if="trend !== undefined" :color="trend >= 0 ? 'success' : 'error'" variant="subtle" size="xs">
                {{ trend >= 0 ? '+' : '' }}{{ trend }}%
            </UBadge>
        </div>
        <p class="text-[10px] font-medium text-slate-400">{{ sub }}</p>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    label: string
    value: string
    trend?: number
    sub: string
    icon: string
    color: 'indigo' | 'rose' | 'emerald' | 'amber'
}>()

const colorClasses = computed(() => {
    const colors = {
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
        rose: { bg: 'bg-rose-50', text: 'text-rose-600' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600' }
    }
    return colors[props.color] || colors.indigo
})
</script>
