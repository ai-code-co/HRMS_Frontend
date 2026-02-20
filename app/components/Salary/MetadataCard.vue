<template>
    <div class="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
        <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{{ label }}</p>
        <div class="space-y-1">
            <div class="flex items-center gap-2">
                <UIcon v-if="highlight" name="i-heroicons-check-circle-20-solid" class="text-emerald-500 w-4 h-4" />
                <p :class="[
                    'text-[13px] font-black tracking-tight',
                    isNegative ? 'text-rose-500' : highlight ? 'text-emerald-600' : 'text-slate-800'
                ]">
                    {{ isNegative ? '- ' : '' }}{{ value }}
                </p>
            </div>
            <p v-if="subValue" class="text-[10px] font-bold text-slate-400">{{ subValue }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    label: string
    value: string
    subValue?: string
    highlight?: boolean
    isNegative?: boolean
}>()
</script>