<template>
    <div v-if="day" class="p-2 md:p-2 space-y-4">
        <template v-if="day.day_type === 'WORKING_DAY' || day.day_type === 'HALF_DAY'">
            <div class="grid grid-cols-2 gap-4">
                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div class="flex items-center gap-2 mb-2 text-slate-400">
                        <Clock :size="14" />
                        <span class="text-[10px] font-bold uppercase">Clock In</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <p class="text-xl font-bold text-slate-800">{{ displayInTime }}</p>
                        <AlertTriangle v-if="day.admin_alert" :size="14" class="text-rose-500" />
                    </div>
                </div>

                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div class="flex items-center gap-2 mb-2 text-slate-400">
                        <ArrowRight :size="14" />
                        <span class="text-[10px] font-bold uppercase">Clock Out</span>
                    </div>
                    <p class="text-xl font-bold text-slate-800">{{ displayOutTime }}</p>
                </div>
            </div>

            <div class="p-5 border rounded-3xl space-y-4 bg-slate-50 border-slate-100">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-[10px] font-bold text-slate-400 uppercase">
                            Total Duration
                        </p>
                        <p class="text-2xl font-black text-slate-800">
                            {{ day.total_time }}
                        </p>
                    </div>

                    <span class="px-3 py-1.5 rounded-full text-[10px] font-bold" :class="day.seconds_actual_worked_time >= day.orignal_total_time
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-rose-50 text-rose-500'">
                        {{ day.seconds_actual_worked_time >= day.orignal_total_time ? 'Goal Achieved' : 'Goal Pending'
                        }}
                    </span>
                </div>
                <UProgress :modelValue="Math.min((day.seconds_actual_worked_time / day.orignal_total_time) * 100, 100)"
                    :color="day.seconds_actual_worked_time >= day.orignal_total_time ? 'primary' : 'error'" />
            </div>
        </template>
        <template v-else>
            <div class="py-12 flex flex-col items-center text-center space-y-4">
                <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                    <Calendar :size="40" />
                </div>
                <h4 class="text-lg font-bold text-slate-700">No Shift Recorded</h4>
                <p class="text-sm text-slate-400 italic max-w-xs">
                    This day was marked as a
                    {{ day.day_type === 'HOLIDAY' ? 'official holiday' : 'weekend off' }}.
                </p>
            </div>
        </template>

        <UButton color="secondary" size="lg" block> Edit Session </UButton>
    </div>
</template>

<script setup lang="ts">
import { Clock, AlertTriangle, ArrowRight, Calendar } from 'lucide-vue-next'
import { format, parseISO, isValid } from 'date-fns'

const props = defineProps<{
    day: any | null
}>()

const displayInTime = computed(() => {
    const timeStr = props.day?.office_in_time || props.day?.home_in_time
    if (!timeStr) return '--:--'
    const date = parseISO(timeStr)
    return isValid(date) ? format(date, 'hh:mm a') : '--:--'
})

const displayOutTime = computed(() => {
    const timeStr = props.day?.office_out_time || props.day?.home_out_time
    if (!timeStr) return '--:--'
    const date = parseISO(timeStr)
    return isValid(date) ? format(date, 'hh:mm a') : '--:--'
})
</script>