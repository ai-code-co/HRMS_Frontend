<script setup lang="ts">
import { Calendar } from 'lucide-vue-next'
import type { Holiday } from '~/stores/holidays'
import { getPublicRestrictedLabel } from '~/utils/holidays'

defineProps<{ holiday: Holiday }>()
</script>

<template>
    <div class="relative bg-indigo-600 rounded-3xl p-6 text-white flex flex-col md:flex-row gap-6">
        <div class="flex-1">
            <span class="text-[8px] uppercase tracking-widest font-black">Next Holiday</span>
            <h2 class="text-3xl font-black mt-2">{{ holiday.name }}</h2>
            <div class="flex items-center gap-2 text-xs mt-1">
                <Calendar :size="14" />
                {{ holiday.day }}, {{ holiday.date }} · {{ getPublicRestrictedLabel(holiday) }} Holiday
            </div>
        </div>


        <div class="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
            <UIcon :name="holiday.icon" class="text-3xl" />
        </div>
    </div>
</template>