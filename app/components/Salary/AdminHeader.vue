<template>
    <header
        class="px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
        <div>
            <div class="flex items-center gap-3 mb-1">
                <div class="p-2 bg-indigo-600 rounded-xl text-white shadow-sm">
                    <UIcon name="i-lucide-banknote" class="w-5 h-5" />
                </div>
                <h2 class="text-2xl font-bold text-slate-800">Organization Payroll</h2>
            </div>
            <p class="text-sm text-slate-400">
                Manage disbursements, tax compliance, and payroll reports.
            </p>
        </div>

        <div class="flex items-center gap-3">
            <div class="hidden md:flex bg-white border border-slate-200 px-4 py-2 rounded-xl items-center gap-3 shadow-sm">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Total Budget
                </span>
                <span class="text-sm font-bold text-slate-800">
                    ₹ {{ formatCurrency(store.orgStats?.monthlyPayroll || 0) }}
                </span>
            </div>
            <!-- <UButton icon="i-lucide-download" color="neutral" variant="outline" class="rounded-xl">
                Export
            </UButton>
            <UButton icon="i-lucide-play" color="primary" class="rounded-xl">
                Run Payroll
            </UButton> -->
        </div>
    </header>
</template>

<script setup lang="ts">
import { useSalaryStore } from '@/stores/salary'

const store = useSalaryStore()

const formatCurrency = (value: number) => {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(2)}M`
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}k`
    }
    return value.toLocaleString()
}
</script>
