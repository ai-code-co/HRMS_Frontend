import { defineStore } from 'pinia'
import { getIconForHoliday, formatDayName, formatShortDate } from '~/utils/holidays'

export type HolidayType = 'Public' | 'Restricted'
export type HolidayStatus = 'Upcoming' | 'Passed'

export interface Holiday {
    id: number
    name: string
    date: string
    fullDate: string
    day: string
    type: HolidayType
    icon: string
    status: HolidayStatus
}

export const useHolidayStore = defineStore('holidays', () => {
    const holidays = ref<Holiday[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const fetchHolidays = async () => {
        isLoading.value = true
        error.value = null

        try {
            const response = await useApi<{ results: any[] }>('/api/holidays/')
            const rawData = response.results

            const today = new Date()
            today.setHours(0, 0, 0, 0)

            holidays.value = rawData.map(item => {
                const holidayDate = new Date(item.date)
                const status: HolidayStatus = holidayDate < today ? 'Passed' : 'Upcoming'

                return {
                    id: item.id,
                    name: item.name,
                    date: formatShortDate(item.date),
                    fullDate: item.date,
                    day: formatDayName(item.date),
                    type: item.holiday_type?.toLowerCase() === 'restricted' ? 'Restricted' : 'Public',
                    icon: getIconForHoliday(item.name),
                    status: status
                }
            })
        } catch (err: any) {
            error.value = err?.message || 'Failed to load holidays'
            const toast = useToast()
            toast.add({
                title: 'Error',
                description: error.value,
                color: 'red'
            })
        } finally {
            isLoading.value = false
        }
    }

    const nextHoliday = computed(() => {
        return holidays.value.find(h => h.status === 'Upcoming')
    })

    return {
        holidays,
        isLoading,
        error,
        nextHoliday,
        fetchHolidays
    }
})