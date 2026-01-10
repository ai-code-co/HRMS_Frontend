import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
    startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, format, isSameMonth, isSameDay,
    addMonths, subMonths, addWeeks, subWeeks, getMonth, getYear
} from 'date-fns'
import { extractErrorMessage } from '~/composables/useErrorMessage'

export const useAttendanceStore = defineStore('attendance', () => {
    const currentDate = ref(new Date())
    const viewMode = ref<'month' | 'week'>('month')
    const attendanceRecords = ref<Record<string, any>>({})
    const loading = ref(false)
    const { showLoader, hideLoader } = useGlobalLoader()

    const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
    const weekOptions = { weekStartsOn: 1 as const }

    const calendarInterval = computed(() => {
        const date = currentDate.value
        if (viewMode.value === 'month') {
            const start = startOfWeek(startOfMonth(date), weekOptions)
            const end = endOfWeek(endOfMonth(date), weekOptions)
            return { start, end }
        } else {
            const start = startOfWeek(date, weekOptions)
            const end = endOfWeek(date, weekOptions)
            return { start, end }
        }
    })

    const headerLabel = computed(() => {
        if (viewMode.value === 'month') {
            return format(currentDate.value, 'MMMM yyyy')
        } else {
            const { start, end } = calendarInterval.value
            return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
        }
    })

    const calendarDays = computed(() => {
        const { start, end } = calendarInterval.value
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        return eachDayOfInterval({ start, end }).map(date => {
            const dateKey = format(date, 'yyyy-MM-dd')
            const dayDate = new Date(date)
            dayDate.setHours(0, 0, 0, 0)

            return {
                date,
                dateKey,
                isCurrentMonth: isSameMonth(date, currentDate.value),
                isToday: isSameDay(date, new Date()),
                isFutureDay: dayDate > today,
                record: attendanceRecords.value[dateKey] || null
            }
        })
    })

    function isDayOpenable(day: { record: any; isFutureDay: boolean }): boolean {
        if (!day.record) return false

        if (day.isFutureDay) {
            const dayType = day.record?.day_type?.toUpperCase().replace(/\s+/g, '_')
            const leaveSubmission = day.record?.leave_submission
            const isLeaveCancelled = leaveSubmission?.status?.toLowerCase() === 'cancelled'

            return ['HOLIDAY', 'WEEKEND_OFF'].includes(dayType) ||
                (leaveSubmission && !isLeaveCancelled) ||
                day.record?.attendance_submission
        }

        return true
    }

    async function fetchAttendance(showGlobalLoader = false) {
        loading.value = true
        const toast = useToast()
        if (showGlobalLoader && import.meta.client) {
            showLoader()
        }
        try {
            let endpoint = ''
            let params: Record<string, any> = {}

            if (viewMode.value === 'month') {
                endpoint = '/api/attendance/monthly/'
                params = {
                    month: getMonth(currentDate.value) + 1,
                    year: getYear(currentDate.value)
                }
            } else {
                endpoint = '/api/attendance/weekly/'
                params = {
                    week_start: format(startOfWeek(currentDate.value, weekOptions), 'yyyy-MM-dd')
                }
            }

            const response = await useApi(endpoint, { params })

            const newRecords: Record<string, any> = {}
            const data = response?.data?.attendance || response.data || []

            data.forEach((item: any) => {
                const key = item.full_date || item.date
                if (key) newRecords[key] = item
            })

            attendanceRecords.value = newRecords
            return newRecords
        } catch (error: any) {
            toast.add({
                title: 'Error',
                description: extractErrorMessage(error, 'Failed to fetch attendance'),
                color: 'error'
            })
            return {}
        } finally {
            loading.value = false
            if (showGlobalLoader && import.meta.client) {
                hideLoader()
            }
        }
    }

    function setAttendanceRecords(records: Record<string, any>) {
        attendanceRecords.value = records
    }
    function setViewMode(mode: 'month' | 'week') {
        viewMode.value = mode
        fetchAttendance(true)
    }

    function next() {
        currentDate.value = viewMode.value === 'month'
            ? addMonths(currentDate.value, 1)
            : addWeeks(currentDate.value, 1)
        fetchAttendance(true)
    }

    function prev() {
        currentDate.value = viewMode.value === 'month'
            ? subMonths(currentDate.value, 1)
            : subWeeks(currentDate.value, 1)
        fetchAttendance(true)
    }

    async function updateAttendance(
        date: string,
        inTime: string,
        outTime: string,
        isWorkingFromHome: boolean = false
    ) {
        try {
            const payload = {
                date,
                in_time: inTime,
                out_time: outTime,
                is_working_from_home: isWorkingFromHome
            }

            const response = await useApi('/api/attendance/manual-update/', {
                method: 'POST',
                body: payload
            })

            if (response?.data) {
                const key = response.data.full_date || date
                attendanceRecords.value[key] = {
                    ...attendanceRecords.value[key],
                    ...response.data
                }
            }

            return response
        } catch (error: any) {
            const toast = useToast()
            toast.add({
                title: 'Error',
                description: extractErrorMessage(error, 'Failed to update attendance'),
                color: 'error'
            })
            throw error
        }
    }

    async function submitTimesheet(
        date: string,
        totalTime: string,
        comments: string,
        isWorkingFromHome: boolean,
        homeInTime?: string,
        homeOutTime?: string,
        screenshotPublicId?: string
    ) {
        const toast = useToast()
        try {
            const formData = new FormData()
            formData.append('date', date)
            formData.append('total_time', totalTime)
            formData.append('comments', comments)
            formData.append('is_working_from_home', String(isWorkingFromHome))

            if (homeInTime) {
                formData.append('home_in_time', homeInTime)
            }
            if (homeOutTime) {
                formData.append('home_out_time', homeOutTime)
            }
            if (screenshotPublicId) {
                formData.append('tracker_screenshot', screenshotPublicId)
            }

            const response = await useApi('/api/attendance/submit-timesheet/', {
                method: 'POST',
                body: formData
            })

            // Update the attendanceRecords with the response data if available
            if (response?.data) {
                const key = response.data.date || date
                attendanceRecords.value[key] = {
                    ...attendanceRecords.value[key],
                    ...response.data
                }
            }
            toast.add({ title: 'Success', description: 'Timesheet submitted successfully', color: 'success' })
            return response
        } catch (error: any) {
            toast.add({
                title: 'Error',
                description: extractErrorMessage(error, 'Failed to submit timesheet'),
                color: 'error'
            })
            throw error
        }
    }

    return {
        currentDate,
        viewMode,
        weekdays,
        calendarDays,
        loading,
        headerLabel,
        fetchAttendance,
        setAttendanceRecords,
        setViewMode,
        next,
        prev,
        updateAttendance,
        submitTimesheet,
        isDayOpenable
    }
})