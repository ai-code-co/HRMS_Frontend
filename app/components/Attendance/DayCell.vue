<template>
    <div class="min-h-34 p-2 border-b border-r border-slate-300 cursor-pointer transition-colors flex flex-col relative"
        :class="[
            !day.isCurrentMonth ? 'bg-slate-50/50' : '',
            cellStyle,
            !shouldShowRecord ? 'hover:bg-slate-100' : ''
        ]">
        <UTooltip v-if="showPendingIndicator" :text="pendingTooltipText">
            <div class="absolute top-1 right-1 cursor-help">
                <UIcon name="i-lucide-clipboard-clock" class="text-fuchsia-900 animate-pulse" size="20" />
            </div>
        </UTooltip>

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
            <div v-if="holidayName" class="text-[10px] font-bold text-blue-700 text-center leading-tight">
                {{ holidayName }}
            </div>

            <div v-if="hasTimeRecords" class="text-[10px] font-bold text-slate-700 text-center leading-tight">
                {{ formatTimeFromISO(day.record.in_time) }}
                <span v-if="day.record.out_time"> - {{ formatTimeFromISO(day.record.out_time) }}</span>
            </div>

            <div v-else-if="isMissingTime"
                class="text-[9px] font-bold px-1 py-0.5 rounded text-center uppercase tracking-wider"
                :class="DAY_TYPE_STYLES.MISSING_TIME.label">
                {{ DAY_TYPE_STYLES.MISSING_TIME.displayLabel }}
            </div>
            <div v-if="isAttendanceSubmitted && attendanceStatusMeta">
                <div class="text-xs font-bold text-center leading-tight" :class="attendanceStatusMeta.labelClass">
                    {{ attendanceStatusMeta.text }}
                </div>
            </div>
            <div v-if="isLeaveSubmitted && leaveStatusMeta">
                <div class="text-xs font-bold text-center leading-tight" :class="leaveStatusMeta.labelClass">
                    {{ leaveStatusMeta.text }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { formatTimeFromISO } from '~/utils/function'
import { getStatusMeta } from '~/utils/function';

const props = defineProps<{
    day: {
        date: Date
        dateKey: string
        isCurrentMonth: boolean
        isToday: boolean
        isFutureDay: boolean
        record: any
    }
    isViewingOther?: boolean
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
    WEEKEND_OFF: {
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
    },
    MISSING_TIME: {
        cell: 'bg-blue-200',
        label: 'text-blue-800',
        displayLabel: 'In/Out Time Missing'
    },
    MANUAL_ATTENDANCE: {
        cell: 'bg-red-800',
        label: 'text-purple-800',
        displayLabel: 'Manual Attendance'
    },
    LEAVE_APPLIED: {
        cell: 'bg-red-300 border-purple-200',
        label: 'text-red-700',
        displayLabel: 'Leave Applied'
    },
} as const

const leaveStatusMeta = computed(() =>
    getStatusMeta(
        props.day.record?.leave_submission,
        DAY_TYPE_STYLES.LEAVE_APPLIED.displayLabel,
        DAY_TYPE_STYLES.LEAVE_APPLIED.label
    )
)

const attendanceStatusMeta = computed(() =>
    getStatusMeta(
        props.day.record?.attendance_submission,
        DAY_TYPE_STYLES.MANUAL_ATTENDANCE.displayLabel,
        DAY_TYPE_STYLES.MANUAL_ATTENDANCE.label
    )
)


const normalizedType = computed(() => {
    return props.day.record?.day_type?.toUpperCase().replace(/\s+/g, '_') || ''
})

const isAttendanceSubmitted = computed(() => {
    return props.day.record?.attendance_submission || false
})

const isLeaveSubmitted = computed(() => {
    const leaveSubmission = props.day.record?.leave_submission
    if (!leaveSubmission) return false
    return leaveSubmission.status?.toLowerCase() !== 'cancelled'
})

const shouldShowRecord = computed(() => {
    if (!props.day.record) return false
    const type = normalizedType.value
    if (props.day.isFutureDay) {
        return ['HOLIDAY', 'WEEKEND_OFF', 'MANUAL_ATTENDANCE', 'LEAVE_APPLIED'].includes(type) || isLeaveSubmitted.value || isAttendanceSubmitted.value
    }
    return type !== 'FUTUREDAY' && type !== ''
})

const cellStyle = computed(() => {
    if (!shouldShowRecord.value) return 'bg-white'
    if (shouldShowRecord.value && (normalizedType.value == 'FUTURE_DAY' || normalizedType.value == 'LEAVE_DAY')) return DAY_TYPE_STYLES['LEAVE_APPLIED'].cell
    if (isMissingTime.value) return DAY_TYPE_STYLES.MISSING_TIME.cell
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

const holidayName = computed(() => {
    if (normalizedType.value !== 'HOLIDAY') return ''
    return props.day.record?.holiday?.name || ''
})

const hasTimeRecords = computed(() => {
    const r = props.day.record
    return r?.in_time && r?.total_time && r?.total_time !== '0m :0s'
})

const isMissingTime = computed(() => {
    if (!props.day.record) return false
    const type = normalizedType.value
    if (!['WORKING_DAY', 'HALF_DAY'].includes(type)) return false
    if (props.day.isFutureDay) return false
    const r = props.day.record
    return !r.in_time || !r.out_time
})

// Show pending indicator for admin when viewing another employee's pending applications
const hasPendingAttendance = computed(() => {
    const submission = props.day.record?.attendance_submission
    return submission?.status?.toLowerCase() === 'pending'
})

const hasPendingLeave = computed(() => {
    const submission = props.day.record?.leave_submission
    return submission?.status?.toLowerCase() === 'pending'
})

const showPendingIndicator = computed(() => {
    if (!props.isViewingOther) return false
    return hasPendingAttendance.value || hasPendingLeave.value
})

const pendingTooltipText = computed(() => {
    const pending: string[] = []
    if (hasPendingLeave.value) pending.push('Leave')
    if (hasPendingAttendance.value) pending.push('Manual Attendance')
    return `Pending: ${pending.join(', ')}`
})
</script>