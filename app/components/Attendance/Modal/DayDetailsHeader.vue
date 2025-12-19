<template>
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Calendar :size="20" />
            </div>
            <div>
                <h3 class="text-sm font-bold text-slate-800">
                    {{ day?.dateStr }}
                </h3>
                <p class="text-[10px] text-slate-400 font-bold uppercase">
                    Session Overview
                </p>
            </div>
        </div>
        <button @click="$emit('close')" class="p-2 rounded-full transition-colors
             text-slate-300 hover:text-slate-600 hover:bg-slate-50">
            <XCircle :size="24" />
        </button>
    </div>
</template>

<script setup lang="ts">
import { Calendar, XCircle } from 'lucide-vue-next'
import type { AttendanceDay } from '~/types/attendance'

defineProps<{
    day: AttendanceDay | null
}>()

defineEmits(['close'])
</script>
