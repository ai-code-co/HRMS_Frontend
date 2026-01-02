import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
    startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, format, isSameMonth, isSameDay,
    addMonths, subMonths, addWeeks, subWeeks
} from 'date-fns'

export const useAttendanceStore = defineStore('attendance', () => {
    const currentDate = ref(new Date())
    const viewMode = ref<'month' | 'week'>('month')
    const attendanceRecords = ref<Record<string, any>>({})
    const loading = ref(false)

    const weekOptions = { weekStartsOn: 1 as const }
    const calendarInterval = computed(() => {
        const date = currentDate.value
        let start, end

        if (viewMode.value === 'month') {
            start = startOfWeek(startOfMonth(date), weekOptions)
            end = endOfWeek(endOfMonth(date), weekOptions)
        } else {
            start = startOfWeek(date, weekOptions)
            end = endOfWeek(date, weekOptions)
        }

        return { start, end }
    })

    const monthLabel = computed(() => format(currentDate.value, 'MMM yyyy'))

    const calendarDays = computed(() => {
        const { start, end } = calendarInterval.value

        return eachDayOfInterval({ start, end }).map(date => {
            const dateKey = format(date, 'yyyy-MM-dd')
            return {
                date,
                dateKey,
                isCurrentMonth: isSameMonth(date, currentDate.value),
                isToday: isSameDay(date, new Date()),
                record: attendanceRecords.value[dateKey] || null
            }
        })
    })

    async function fetchAttendance() {
        loading.value = true
        try {
            const startDateStr = format(calendarInterval.value.start, 'yyyy-MM-dd')
            const endDateStr = format(calendarInterval.value.end, 'yyyy-MM-dd')

            const response = await useApi('/api/attendance/my-attendance/', {
                params: {
                    'start_date': startDateStr,
                    'end_date': endDateStr
                }
            })

            const newRecords: Record<string, any> = {}
            if (response?.results?.data) {
                response.results.data.forEach((item: any) => {
                    newRecords[item.full_date] = item
                })
            }

            attendanceRecords.value = newRecords
        } catch (error: any) {
            const toast = useToast()
            toast.add({
                title: 'Error',
                description: error?.message || 'Failed to fetch attendance records',
                color: 'error'
            })
        } finally {
            loading.value = false
        }
    }

    function next() {
        currentDate.value = viewMode.value === 'month'
            ? addMonths(currentDate.value, 1)
            : addWeeks(currentDate.value, 1)
        fetchAttendance()
    }

    function prev() {
        currentDate.value = viewMode.value === 'month'
            ? subMonths(currentDate.value, 1)
            : subWeeks(currentDate.value, 1)
        fetchAttendance()
    }

    return {
        currentDate,
        viewMode,
        calendarDays,
        loading,
        monthLabel,
        fetchAttendance,
        next,
        prev
    }
})