<template>
    <div class="min-h-34 p-2 border-b border-r border-slate-300 cursor-pointer transition-colors flex flex-col" :class="[
        !day.isCurrentMonth ? 'bg-slate-50/50' : '',
        cellStyle,
        !shouldShowRecord ? 'hover:bg-slate-100' : ''
    ]">
        <div class="flex justify-between items-start mb-2">
            <span class="text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full" :class="[
                day.isToday ? 'bg-indigo-600 text-white' : 'text-slate-800',
                !day.isCurrentMonth && !day.isToday ? 'text-slate-400' : ''
            ]">
                {{ day.date.getDate() }}
            </span>
            <UIcon v-if="day.record?.is_working_from_home" name="i-lucide-home" class="text-indigo-500" size="14" />
        </div>

        <div v-if="shouldShowRecord" class="space-y-1.5 flex-1 flex flex-col justify-center">
            <div class="text-[9px] font-bold px-1 py-0.5 rounded text-center uppercase tracking-wider"
                :class="labelStyle">
                {{ displayLabel }}
            </div>

            <div v-if="hasTimeRecords" class="text-[10px] font-bold text-slate-700 text-center leading-tight">
                {{ formatTime(day.record.in_time) }}
                <span v-if="day.record.out_time"> - {{ formatTime(day.record.out_time) }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { format, parseISO, isValid } from 'date-fns';
import { computed } from 'vue';

const props = defineProps<{
    day: {
        date: Date
        dateKey: string
        isCurrentMonth: boolean
        isToday: boolean
        record: any
    }
}>()

const DAY_TYPE_STYLES = {
    WORKING_DAY: {
        cell: 'bg-emerald-200',
        label: 'text-emerald-800',
        displayLabel: 'Working Day'
    },
    HALF_DAY: {
        cell: 'bg-amber-50',
        label: 'text-amber-800',
        displayLabel: 'Half Day'
    },
    NON_WORKING_DAY: {
        cell: 'bg-amber-200',
        label: 'text-slate-600',
        displayLabel: 'Weekend'
    },
    ABSENT: {
        cell: 'bg-rose-200',
        label: 'text-rose-800',
        displayLabel: 'Absent'
    },
    LEAVE: {
        cell: 'bg-purple-50 border-purple-100',
        label: 'text-purple-800',
        displayLabel: 'On Leave'
    },
    HOLIDAY: {
        cell: 'bg-blue-50 border-blue-100',
        label: 'text-blue-800',
        displayLabel: 'Holiday'
    }
} as const

const normalizedType = computed(() => {
    return props.day.record?.day_type?.toUpperCase().replace(/\s+/g, '_') || ''
})

const isFutureDay = computed(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dayDate = new Date(props.day.date); dayDate.setHours(0, 0, 0, 0);
    return dayDate > today
})

const shouldShowRecord = computed(() => {
    if (!props.day.record) return false
    const type = normalizedType.value
    if (isFutureDay.value) {
        return ['LEAVE', 'HOLIDAY', 'NON_WORKING_DAY'].includes(type)
    }
    return type !== 'FUTUREDAY' && type !== ''
})

const cellStyle = computed(() => {
    if (!shouldShowRecord.value) return 'bg-white'
    return DAY_TYPE_STYLES[normalizedType.value as keyof typeof DAY_TYPE_STYLES]?.cell || 'bg-white'
})

const labelStyle = computed(() => {
    if (!shouldShowRecord.value) return ''
    return DAY_TYPE_STYLES[normalizedType.value as keyof typeof DAY_TYPE_STYLES]?.label || 'bg-slate-100 text-slate-600'
})

const displayLabel = computed(() => {
    if (!shouldShowRecord.value) return ''
    const styleObj = DAY_TYPE_STYLES[normalizedType.value as keyof typeof DAY_TYPE_STYLES]
    return styleObj ? styleObj.displayLabel : normalizedType.value.replace(/_/g, ' ')
})

const hasTimeRecords = computed(() => {
    const r = props.day.record
    return r?.in_time && r?.total_time && r?.total_time !== '0m :0s'
})

function formatTime(timeStr: string) {
    if (!timeStr) return ''
    const date = parseISO(timeStr)
    return isValid(date) ? format(date, 'h:mm a') : ''
}
</script>