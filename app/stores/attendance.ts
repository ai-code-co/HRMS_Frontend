import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
    startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, format, isSameMonth, isSameDay,
    addMonths, subMonths, addWeeks, subWeeks, getMonth, getYear
} from 'date-fns'

export const useAttendanceStore = defineStore('attendance', () => {
    const currentDate = ref(new Date())
    const viewMode = ref<'month' | 'week'>('month')
    const attendanceRecords = ref<Record<string, any>>({})
    const loading = ref(false)

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
            console.log('API Response:', response)
            const data = response?.data?.attendance || response.data || []

            data.forEach((item: any) => {
                const key = item.full_date || item.date
                if (key) newRecords[key] = item
            })

            attendanceRecords.value = newRecords
        } catch (error: any) {
            console.error('Fetch error:', error)
        } finally {
            loading.value = false
        }
    }
    function setViewMode(mode: 'month' | 'week') {
        viewMode.value = mode
        fetchAttendance()
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
        headerLabel,
        fetchAttendance,
        setViewMode,
        next,
        prev
    }
})