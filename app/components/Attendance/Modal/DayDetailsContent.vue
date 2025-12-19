<template>
    <div v-if="day" class="p-2 md:p-2 space-y-4">
        <template v-if="day.status === 'working'">
            <div class="grid grid-cols-2 gap-4">
                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div class="flex items-center gap-2 mb-2 text-slate-400">
                        <Clock :size="14" />
                        <span class="text-[10px] font-bold uppercase">Clock In</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <p class="text-xl font-bold text-slate-800">{{ day.inTime }}</p>
                        <AlertTriangle v-if="day.isLate" :size="14" class="text-rose-500" />
                    </div>
                </div>

                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div class="flex items-center gap-2 mb-2 text-slate-400">
                        <ArrowRight :size="14" />
                        <span class="text-[10px] font-bold uppercase">Clock Out</span>
                    </div>
                    <p class="text-xl font-bold text-slate-800">{{ day.outTime }}</p>
                </div>
            </div>

            <div class="p-5 border rounded-3xl space-y-4 bg-slate-50 border-slate-100">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-[10px] font-bold text-slate-400 uppercase">
                            Total Duration
                        </p>
                        <p class="text-2xl font-black text-slate-800">
                            {{ day.totalFormatted }}
                        </p>
                    </div>

                    <span class="px-3 py-1.5 rounded-full text-[10px] font-bold" :class="day.totalHours >= DAILY_TARGET
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-rose-50 text-rose-500'">
                        {{ day.totalHours >= DAILY_TARGET ? 'Goal Achieved' : 'Goal Pending' }}
                    </span>
                </div>
                <UProgress :modelValue="Math.min((day.totalHours / DAILY_TARGET) * 100, 100)"
                    :color="day.totalHours >= DAILY_TARGET ? 'primary' : 'error'" />
            </div>
        </template>

        <template v-else>
            <div class="py-12 flex flex-col items-center text-center space-y-4">
                <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                    <Calendar :size="40" />
                </div>
                <h4 class="text-lg font-bold text-slate-700">No Shift Recorded</h4>
                <p class="text-sm text-slate-400 italic max-w-xs">
                    This day was marked as an
                    {{ day.status === 'holiday' ? 'official holiday' : 'off day' }}.
                </p>
            </div>
        </template>

        <UButton color="secondary" size="lg" block> Edit Session </UButton>
    </div>
</template>

<script setup lang="ts">
import {
    Clock,
    AlertTriangle,
    ArrowRight,
    Calendar
} from 'lucide-vue-next'
import type { AttendanceDay } from '~/types/attendance'

const DAILY_TARGET = 9

defineProps<{
    day: AttendanceDay | null
}>()
</script>