import { defineStore } from 'pinia'
import { getIconForHoliday, formatDayName, formatShortDate } from '~/utils/holidays'
import { extractErrorMessage } from '~/composables/useErrorMessage'

/** API enum: national | regional | religious | cultural | other */
export const HOLIDAY_TYPE_ENUM = ['national', 'regional', 'religious', 'cultural', 'other'] as const
export type HolidayType = (typeof HOLIDAY_TYPE_ENUM)[number]
export type HolidayStatus = 'Upcoming' | 'Passed'

export const HOLIDAY_TYPE_OPTIONS = HOLIDAY_TYPE_ENUM.map(t => ({
    label: t.charAt(0).toUpperCase() + t.slice(1),
    value: t
}))

/** Options for type dropdown including Restricted (sends as 'other' to API). */
export const HOLIDAY_TYPE_OPTIONS_WITH_RESTRICTED = [
    ...HOLIDAY_TYPE_OPTIONS,
    { label: 'Restricted', value: 'restricted' as const }
]

/** Map form value to API holiday_type ('restricted' → 'other'). */
export function toApiHolidayType(v: HolidayType | 'restricted'): HolidayType {
    return v === 'restricted' ? 'other' : v
}

export interface Holiday {
    id: number
    name: string
    date: string
    fullDate: string
    day: string
    type: HolidayType
    /** When true, UI shows "Restricted"; otherwise "Public". From API is_restricted or derived from type. */
    is_restricted: boolean
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

            const mappedHolidays = rawData.map(item => {
                const holidayDate = new Date(item.date)
                const status: HolidayStatus = holidayDate < today ? 'Passed' : 'Upcoming'

                const rawType = (item.holiday_type ?? '').toString().toLowerCase().trim()
                const type: HolidayType = HOLIDAY_TYPE_ENUM.includes(rawType as HolidayType) ? rawType as HolidayType : 'other'
                // Use API is_restricted when present; else treat regional/other as restricted so UI shows both labels
                const is_restricted =
                    typeof item.is_restricted === 'boolean'
                        ? item.is_restricted
                        : (type === 'regional' || type === 'other')
                return {
                    id: item.id,
                    name: item.name,
                    date: formatShortDate(item.date),
                    fullDate: item.date,
                    day: formatDayName(item.date),
                    type,
                    is_restricted,
                    icon: getIconForHoliday(item.name),
                    status: status
                }
            })
            holidays.value = mappedHolidays
            return mappedHolidays
        } catch (err: any) {
            error.value = extractErrorMessage(err, 'Failed to load holidays')
            const toast = useToast()
            toast.add({
                title: 'Error',
                description: error.value,
                color: 'error'
            })
            return []
        } finally {
            isLoading.value = false
        }
    }

    const setHolidays = (data: Holiday[]) => {
        holidays.value = data
    }

    const addHolidays = async (payloads: Array<{ name: string; date: string; holiday_type: HolidayType }>) => {
        if (payloads.length === 0) return
        isLoading.value = true
        error.value = null
        const toast = useToast()
        try {
            await useApi('/api/holidays/bulk-create/', {
                method: 'POST',
                body: payloads
            })
            await fetchHolidays()
            toast.add({
                title: 'Success',
                description: `${payloads.length} holiday${payloads.length === 1 ? '' : 's'} added successfully`,
                color: 'success'
            })
        } catch (err: any) {
            error.value = extractErrorMessage(err, 'Failed to add holidays')
            toast.add({
                title: 'Error',
                description: error.value,
                color: 'error'
            })
            throw err
        } finally {
            isLoading.value = false
        }
    }

    const updateHoliday = async (
        id: number,
        payload: {
            name: string
            date: string
            holiday_type: HolidayType
            description?: string
            country?: string
            region?: string
            is_active?: boolean
        }
    ) => {
        isLoading.value = true
        error.value = null
        const toast = useToast()
        try {
            const data = {
                name: payload.name,
                date: payload.date,
                holiday_type: payload.holiday_type,
                ...(payload.description !== undefined && { description: payload.description }),
                ...(payload.country !== undefined && { country: payload.country }),
                ...(payload.region !== undefined && { region: payload.region }),
                ...(payload.is_active !== undefined && { is_active: payload.is_active })
            }
            const response = await useApi<{ id: number; name: string; date: string; holiday_type: string }>(`/api/holidays/${id}/`, {
                method: 'PUT',
                body: data
            })
            await fetchHolidays()
            toast.add({
                title: 'Success',
                description: 'Holiday updated successfully',
                color: 'success'
            })
            return response
        } catch (err: any) {
            error.value = extractErrorMessage(err, 'Failed to update holiday')
            toast.add({
                title: 'Error',
                description: error.value,
                color: 'error'
            })
            throw err
        } finally {
            isLoading.value = false
        }
    }

    const deleteHoliday = async (id: number) => {
        error.value = null
        const toast = useToast()
        try {
            await useApi(`/api/holidays/${id}/`, {
                method: 'DELETE'
            })
            holidays.value = holidays.value.filter(h => h.id !== id)
            toast.add({
                title: 'Success',
                description: 'Holiday deleted successfully',
                color: 'success'
            })
        } catch (err: any) {
            error.value = extractErrorMessage(err, 'Failed to delete holiday')
            toast.add({
                title: 'Error',
                description: error.value,
                color: 'error'
            })
            throw err
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
        fetchHolidays,
        setHolidays,
        addHolidays,
        updateHoliday,
        deleteHoliday
    }
})