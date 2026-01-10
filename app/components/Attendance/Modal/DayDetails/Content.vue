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
                        <template v-if="isEditing">
                            <UInputTime v-model="inTime" />
                        </template>

                        <template v-else>
                            <p class="text-xl font-bold text-slate-800">
                                {{ displayInTime }}
                            </p>
                        </template>
                    </div>
                </div>

                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div class="flex items-center gap-2 mb-2 text-slate-400">
                        <ArrowRight :size="14" />
                        <span class="text-[10px] font-bold uppercase">Clock Out</span>
                    </div>
                    <template v-if="isEditing">
                        <UInputTime v-model="outTime" />
                    </template>

                    <template v-else>
                        <p class="text-xl font-bold text-slate-800">
                            {{ displayOutTime }}
                        </p>
                    </template>
                </div>
            </div>

            <div class="p-5 border rounded-3xl space-y-4 bg-slate-50 border-slate-100">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-[10px] font-bold text-slate-400 uppercase">
                            Total Duration
                        </p>
                        <p class="text-2xl font-black text-slate-800">
                            {{ day.total_time }} Hrs
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
            <div v-if="manualAttendanceSubmission"
                :class="[attendanceSubmissionStyles.container, 'p-4 border rounded-2xl']">
                <div class="flex items-center justify-between mb-3">
                    <div :class="[attendanceSubmissionStyles.text, 'flex items-center gap-2']">
                        <Fingerprint :size="16" />
                        <span class="text-[10px] font-bold uppercase">Manual Attendance Applied</span>
                    </div>
                    <span
                        :class="[attendanceSubmissionStyles.badge, 'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase']">
                        {{ manualAttendanceSubmission.status }}
                    </span>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-[10px] text-slate-400 uppercase font-medium">Requested In</p>
                        <p class="text-sm font-bold text-slate-700">{{
                            isValid(parseISO(manualAttendanceSubmission.in_time))
                                ?
                                format(manualAttendanceSubmission.in_time, 'hh:mm a') : '--:--' }}</p>
                    </div>
                    <div>
                        <p class="text-[10px] text-slate-400 uppercase font-medium">Requested Out</p>
                        <p class="text-sm font-bold text-slate-700">{{
                            isValid(parseISO(manualAttendanceSubmission.out_time))
                                ?
                                format(manualAttendanceSubmission.out_time, 'hh:mm a') : '--:--' }}
                        </p>
                    </div>
                </div>
            </div>

            <div v-if="leaveSubmission" :class="[leaveSubmissionStyles.container, 'p-4 border rounded-2xl']">
                <div class="flex items-center justify-between mb-3">
                    <div :class="[leaveSubmissionStyles.text, 'flex items-center gap-2']">
                        <FileText :size="16" />
                        <span class="text-[10px] font-bold uppercase">Leave Applied</span>
                    </div>
                    <span
                        :class="[leaveSubmissionStyles.badge, 'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase']">
                        {{ leaveSubmission.status }}
                    </span>
                </div>
                <div class="grid grid-cols-2 gap-4 items-center">
                    <div>
                        <p class="text-[10px] text-slate-400 uppercase font-medium">Leave Type</p>
                        <p class="text-sm font-bold text-slate-700">{{ leaveSubmission.type || '--' }}</p>
                    </div>
                    <div v-if="leaveSubmission.reason">
                        <p class="text-[10px] text-slate-400 uppercase font-medium">Reason</p>
                        <p class="text-sm text-slate-700">{{ leaveSubmission.reason }}</p>
                    </div>
                </div>
            </div>
        </template>
        <template v-else>
            <div v-if="day.day_type === 'HOLIDAY'" class="p-4 border rounded-2xl bg-blue-50 border-blue-100">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2 text-blue-600">
                        <PartyPopper :size="16" />
                        <span class="text-[10px] font-bold uppercase">Official Holiday</span>
                    </div>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-600">
                        Holiday
                    </span>
                </div>
                <div class="grid grid-cols-2 gap-4 items-center">
                    <div>
                        <p class="text-[10px] text-slate-400 uppercase font-medium">Holiday Name</p>
                        <p class="text-sm font-bold text-slate-700">{{ day.holiday.name || day.name || 'Public Holiday'
                        }}</p>
                    </div>
                    <div>
                        <p class="text-[10px] text-slate-400 uppercase font-medium">Date</p>
                        <p class="text-sm font-bold text-slate-700">{{ formatDateFromISO(day.full_date || day.date) }}</p>
                    </div>
                </div>
            </div>

            <div v-if="leaveSubmission" :class="[leaveSubmissionStyles.container, 'p-4 border rounded-2xl mt-4']">
                <div class="flex items-center justify-between mb-3">
                    <div :class="[leaveSubmissionStyles.text, 'flex items-center gap-2']">
                        <FileText :size="16" />
                        <span class="text-[10px] font-bold uppercase">Leave Applied</span>
                    </div>
                    <span
                        :class="[leaveSubmissionStyles.badge, 'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase']">
                        {{ leaveSubmission.status }}
                    </span>
                </div>
                <div class="grid grid-cols-2 gap-4 items-center">
                    <div>
                        <p class="text-[10px] text-slate-400 uppercase font-medium">Leave Type</p>
                        <p class="text-sm font-bold text-slate-700">{{ leaveSubmission.type || '--' }}</p>
                    </div>
                    <div v-if="leaveSubmission.reason">
                        <p class="text-[10px] text-slate-400 uppercase font-medium">Reason</p>
                        <p class="text-sm text-slate-700">{{ leaveSubmission.reason }}</p>
                    </div>
                </div>
            </div>

            <div v-if="manualAttendanceSubmission"
                :class="[attendanceSubmissionStyles.container, 'p-4 border rounded-2xl mt-4']">
                <div class="flex items-center justify-between mb-3">
                    <div :class="[attendanceSubmissionStyles.text, 'flex items-center gap-2']">
                        <Fingerprint :size="16" />
                        <span class="text-[10px] font-bold uppercase">Manual Attendance Applied</span>
                    </div>
                    <span
                        :class="[attendanceSubmissionStyles.badge, 'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase']">
                        {{ manualAttendanceSubmission.status }}
                    </span>
                </div>
                <div class="grid grid-cols-2 gap-4 items-center">
                    <div>
                        <p class="text-[10px] text-slate-400 uppercase font-medium">Requested In</p>
                        <p class="text-sm font-bold text-slate-700">{{
                            isValid(parseISO(manualAttendanceSubmission.in_time))
                                ?
                                format(manualAttendanceSubmission.in_time, 'hh:mm a') : '--:--' }}</p>
                    </div>
                    <div>
                        <p class="text-[10px] text-slate-400 uppercase font-medium">Requested Out</p>
                        <p class="text-sm font-bold text-slate-700">{{
                            isValid(parseISO(manualAttendanceSubmission.out_time))
                                ?
                                format(manualAttendanceSubmission.out_time, 'hh:mm a') : '--:--' }}
                        </p>
                    </div>
                </div>
            </div>
        </template>
        <div class="flex gap-3 mt-6">
            <UModal v-model:open="isTimesheetModalOpen" title="Upload Timesheet"
                :ui="{ overlay: 'bg-slate-900/40 backdrop-blur-sm' }" :overlay="true">
                <UButton color="info" variant="subtle" size="lg" block class="cursor-pointer"
                    :disabled="areActionButtonsDisabled">
                    Upload Timesheet
                </UButton>
                <template #header>
                    <AttendanceModalUploadTimesheetHeader :day="day" @close="closeTimesheetModal" />
                </template>
                <template #body>
                    <AttendanceModalUploadTimesheetContent :day="day" @close="closeTimesheetModal"
                        @update-success="handleTimesheetUploadSuccess" />
                </template>
            </UModal>

            <UButton color="secondary" size="lg" block class="cursor-pointer"
                @click="isEditing ? handleUpdateSession() : isEditing = !isEditing"
                :disabled="areActionButtonsDisabled">
                {{ isSubmitting ? 'Updating...' : isEditing ? 'Update Session' : 'Edit Session' }}
            </UButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Clock, ArrowRight, Fingerprint, FileText, PartyPopper } from 'lucide-vue-next'
import { parseISO, isValid, format } from 'date-fns'
import { Time } from '@internationalized/date'
import { formatTimeFromISO, formatDateFromISO } from '~/utils/function'
import AttendanceModalUploadTimesheetHeader from '~/components/Attendance/Modal/UploadTimesheet/Header.vue'
import AttendanceModalUploadTimesheetContent from '~/components/Attendance/Modal/UploadTimesheet/Content.vue'

const props = defineProps<{
    day: any | null
}>()

const emit = defineEmits<{
    (e: 'update-success'): void
}>()

const isEditing = ref(false)
const inTime = shallowRef<Time | null>(null)
const outTime = shallowRef<Time | null>(null)
const isSubmitting = ref(false)

const isTimesheetModalOpen = ref(false)

const manualAttendanceSubmission = computed(() => {
    return props.day?.attendance_submission || null
})

const leaveSubmission = computed(() => {
    return props.day?.leave_submission || null
})

const isFutureDay = computed(() => props.day?.isFutureDay || false)

const areActionButtonsDisabled = computed(() => isFutureDay.value || manualAttendanceSubmission.value || leaveSubmission.value || isSubmitting.value)

function getSubmissionStyles(status: string | undefined) {
    const normalizedStatus = status?.toUpperCase()
    switch (normalizedStatus) {
        case 'APPROVED':
            return {
                container: 'bg-success-50 border-success-100',
                text: 'text-success-600',
                badge: 'bg-success-100 text-success-600'
            }
        case 'REJECTED':
        case 'CANCELLED':
            return {
                container: 'bg-rose-50 border-rose-100',
                text: 'text-rose-600',
                badge: 'bg-rose-100 text-rose-600'
            }
        default:
            return {
                container: 'bg-amber-50/50 border-amber-100',
                text: 'text-amber-600',
                badge: 'bg-amber-100 text-amber-600'
            }
    }
}

const attendanceSubmissionStyles = computed(() => {
    return getSubmissionStyles(manualAttendanceSubmission.value?.status)
})

const leaveSubmissionStyles = computed(() => {
    return getSubmissionStyles(leaveSubmission.value?.status)
})

const attendanceStore = useAttendanceStore()
const toast = useToast()

watch(
    () => isEditing.value,
    (enabled) => {
        if (!enabled || !props.day) return

        inTime.value = toTime(
            props.day.in_time || props.day.home_in_time
        )

        outTime.value = toTime(
            props.day.out_time || props.day.home_out_time
        )
    },
    { immediate: true }
)

function toTime(iso?: string): Time | null {
    if (!iso) return null
    const d = parseISO(iso)
    if (!isValid(d)) return null
    return new Time(d.getHours(), d.getMinutes(), 0)
}

const displayInTime = computed(() => {
    return formatTimeFromISO(props.day?.in_time || props.day?.home_in_time)
})

const displayOutTime = computed(() => {
    return formatTimeFromISO(props.day?.out_time || props.day?.home_out_time)
})

function formatTimeForApi(time: Time | null): string {
    if (!time) return ''
    const hour = time.hour
    const minute = String(time.minute).padStart(2, '0')
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${String(displayHour).padStart(2, '0')}:${minute} ${ampm}`
}

async function handleUpdateSession() {
    if (!inTime.value || !outTime.value) {
        toast.add({ title: 'Error', description: 'Please select both clock in and clock out times', color: 'error' })
        return
    }

    isSubmitting.value = true
    try {
        const formattedInTime = formatTimeForApi(inTime.value)
        const formattedOutTime = formatTimeForApi(outTime.value)

        await attendanceStore.updateAttendance(
            props.day.full_date || props.day.date,
            formattedInTime,
            formattedOutTime,
            props.day.is_working_from_home || false
        )

        isEditing.value = false
        toast.add({ title: 'Success', description: 'Attendance updated successfully', color: 'success' })
        emit('update-success')
    } catch (error: any) {
        toast.add({
            title: 'Error',
            description: error?.message || 'Failed to update attendance',
            color: 'error'
        })
    } finally {
        isSubmitting.value = false
    }
}

const closeTimesheetModal = () => {
    isTimesheetModalOpen.value = false
}

const handleTimesheetUploadSuccess = () => {
    isTimesheetModalOpen.value = false
    emit('update-success')
}
</script>