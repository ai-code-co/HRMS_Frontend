<template>
    <header
        class="px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
        <div>
            <div class="flex items-center gap-3 mb-1">
                <h2 class="text-2xl font-bold">
                    Salary Credits
                </h2>
            </div>
            <p class="text-sm text-slate-500">
                Earnings history and payslips.
            </p>
        </div>

        <div class="flex gap-3">
            <div
                class="hidden md:flex bg-white border border-slate-200 px-4 py-2 rounded-xl items-center gap-3 shadow-sm">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Annual CTC
                </span>
                <span class="text-sm font-black text-slate-800">
                    ₹ {{ annualCtc.toLocaleString() }}
                </span>
            </div>

            <!-- <UButton icon="i-heroicons-cloud-arrow-down" color="secondary" class="font-bold rounded-xl"
                label="Download All" /> -->
        </div>
    </header>
</template>

<script setup lang="ts">
defineProps<{
    annualCtc: number
}>()
</script>
