<template>
    <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
        <p class="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] mb-2">{{ label }}</p>
        <div class="space-y-1">
            <div class="flex items-center gap-2">
                <UIcon v-if="highlight" name="i-lucide-check-circle-2" class="text-emerald-500 w-3 h-3" />
                <p :class="['text-[10px] font-black tracking-tight', highlight ? 'text-slate-800' : 'text-slate-400']">
                    {{ value }}
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
}>()
</script>