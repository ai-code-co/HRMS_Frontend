import { defineStore } from 'pinia'

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
    const filter = ref<'all' | 'public' | 'restricted'>('all')
    const searchQuery = ref('')
    const holidays = ref<Holiday[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const getIcon = (name: string): string => {
        const n = name.toLowerCase()
        if (n.includes('year')) return 'i-lucide-music'
        if (n.includes('republic') || n.includes('independence')) return 'i-lucide-sparkles'
        if (n.includes('christmas')) return 'i-lucide-calendar'
        if (n.includes('gandhi') || n.includes('foundation')) return 'i-lucide-heart'
        return 'i-lucide-map-pin'
    }

    const getDayName = (dateStr: string) => {
        return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(dateStr))
    }

    const formatShortDate = (dateStr: string) => {
        const d = new Date(dateStr)
        const month = d.toLocaleString('default', { month: 'short' })
        const day = d.getDate().toString().padStart(2, '0')
        return `${month} ${day}`
    }
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
                    day: getDayName(item.date),
                    type: item.holiday_type?.toLowerCase() === 'restricted' ? 'Restricted' : 'Public',
                    icon: getIcon(item.name),
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
    const filteredHolidays = computed(() =>
        holidays.value.filter(h => {
            const matchesFilter = filter.value === 'all' || h.type.toLowerCase() === filter.value
            const matchesSearch = h.name.toLowerCase().includes(searchQuery.value.toLowerCase())
            return matchesFilter && matchesSearch
        })
    )

    const nextHoliday = computed(() => {
        return holidays.value.find(h => h.status === 'Upcoming')
    })

    return {
        filter,
        searchQuery,
        holidays,
        isLoading,
        error,
        filteredHolidays,
        nextHoliday,
        fetchHolidays
    }
})