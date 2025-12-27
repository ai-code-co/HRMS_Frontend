import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
    startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, format, isSameMonth, isSameDay,
    addMonths, subMonths, addWeeks, subWeeks
} from 'date-fns'

export const useAttendanceStore = defineStore('attendance', () => {
    // --- State ---
    const currentDate = ref(new Date())
    const viewMode = ref<'month' | 'week'>('month')
    const attendanceRecords = ref<Record<string, any>>({}) // Keyed by "full_date" (e.g., "2025-12-24")
    const loading = ref(false)

    // Configuration for Monday start
    const weekOptions = { weekStartsOn: 1 as const }

    // --- Getters (Computed) ---

    /**
     * Calculates the start and end of the visible calendar grid.
     * In month view, it includes padding days from prev/next months to fill the 7-column rows.
     */
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

    /**
     * The label shown in the header (e.g., "Dec 2025")
     */
    const monthLabel = computed(() => format(currentDate.value, 'MMM yyyy'))

    /**
     * Generates the array of days to be rendered in the grid.
     * Maps each date to its corresponding record from the backend.
     */
    const calendarDays = computed(() => {
        const { start, end } = calendarInterval.value

        return eachDayOfInterval({ start, end }).map(date => {
            const dateKey = format(date, 'yyyy-MM-dd')
            return {
                date,
                dateKey,
                isCurrentMonth: isSameMonth(date, currentDate.value),
                isToday: isSameDay(date, new Date()),
                // Matches the "full_date" field from your JSON
                record: attendanceRecords.value[dateKey] || null
            }
        })
    })

    // --- Actions ---

    /**
     * Fetches attendance from the backend using the calculated grid range.
     */
    async function fetchAttendance() {
        loading.value = true
        try {
            const startDateStr = format(calendarInterval.value.start, 'yyyy-MM-dd')
            const endDateStr = format(calendarInterval.value.end, 'yyyy-MM-dd')

            // Using your custom useApi composable
            const response = await useApi('/api/attendance/my-attendance/', {
                params: {
                    'start_date': startDateStr,
                    'end_date': endDateStr
                }
            })

            const newRecords: Record<string, any> = {}

            /**
             * Based on your response structure:
             * { results: { data: [ ... ] } }
             */
            if (response?.results?.data) {
                response.results.data.forEach((item: any) => {
                    // We use item.full_date (e.g. "2025-12-24") as the key
                    // This allows O(1) lookup in the calendarDays computed property
                    newRecords[item.full_date] = item
                })
            }

            attendanceRecords.value = newRecords
        } catch (error) {
            console.error('Failed to fetch attendance:', error)
            // Optional: Clear records or keep old ones on error
            attendanceRecords.value = {}
        } finally {
            loading.value = false
        }
    }

    /**
     * Navigation: Move to next Month/Week
     */
    function next() {
        currentDate.value = viewMode.value === 'month'
            ? addMonths(currentDate.value, 1)
            : addWeeks(currentDate.value, 1)
        fetchAttendance()
    }

    /**
     * Navigation: Move to previous Month/Week
     */
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