<template>
    <UCard :ui="{ body: 'p-6' }">
        <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-6 text-center">Cost Distribution</h3>
        <div class="relative w-36 h-36 mx-auto mb-8">
            <svg class="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="60" stroke="#f1f5f9" stroke-width="14" fill="transparent" />
                <circle cx="50%" cy="50%" r="60" stroke="#4f46e5" stroke-width="14" :stroke-dasharray="377"
                    :stroke-dashoffset="377 - (377 * coreSalaries / 100)" stroke-linecap="round" fill="transparent" />
                <circle cx="50%" cy="50%" r="60" stroke="#10b981" stroke-width="14" :stroke-dasharray="377"
                    :stroke-dashoffset="377 - (377 * bonuses / 100)" stroke-linecap="round" fill="transparent"
                    :style="{ transform: `rotate(${coreSalaries * 3.6}deg)`, transformOrigin: 'center' }" />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-xl font-bold text-slate-800">{{ formatCurrency(budgetUsed) }}</span>
                <span class="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Budget Used</span>
            </div>
        </div>
        <div class="space-y-2.5">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-indigo-600" />
                    <span class="text-xs font-medium text-slate-500">Core Salaries</span>
                </div>
                <span class="text-xs font-semibold text-slate-800">{{ coreSalaries }}%</span>
            </div>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-emerald-500" />
                    <span class="text-xs font-medium text-slate-500">Performance Bonuses</span>
                </div>
                <span class="text-xs font-semibold text-slate-800">{{ bonuses }}%</span>
            </div>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-slate-200" />
                    <span class="text-xs font-medium text-slate-500">Misc / Other</span>
                </div>
                <span class="text-xs font-semibold text-slate-800">{{ misc }}%</span>
            </div>
        </div>
    </UCard>
</template>

<script setup lang="ts">
defineProps<{
    coreSalaries: number
    bonuses: number
    misc: number
    budgetUsed: number
}>()

const formatCurrency = (value: number) => {
    if (value >= 1000000) {
        return `₹${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
        return `₹${(value / 1000).toFixed(0)}k`
    }
    return `₹${value.toLocaleString()}`
}
</script>
