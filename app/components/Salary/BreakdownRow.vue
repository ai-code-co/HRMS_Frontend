<template>
    <div class="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors group">
        <span class="text-xs font-bold text-slate-500 group-hover:text-slate-800 transition-colors">{{ label }}</span>
        <span :class="['text-sm font-black', isNegative ? 'text-rose-500' : 'text-emerald-600']">
            {{ isNegative ? '-' : '+' }}${{ value.toLocaleString() }}
        </span>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    label: string
    value: number
    isNegative?: boolean
}>()
</script>