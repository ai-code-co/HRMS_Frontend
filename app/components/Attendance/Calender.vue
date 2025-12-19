<template>
    <div class="flex h-screen bg-white overflow-hidden font-sans text-slate-900">
        <div class="flex-1 flex flex-col overflow-hidden">
            <main class="flex-1 overflow-y-auto">
                <div class="grid grid-cols-7 border border-slate-300 bg-white sticky top-0">
                    <div v-for="d in weekdays" :key="d" class="py-2 text-center text-[10px] font-bold text-slate-500 bg-slate-100">
                        {{ d }}
                    </div>
                </div>
                <div class="grid grid-cols-7 auto-rows-fr">
                    <div v-for="day in displayedData" :key="day.day" @click="() => { selectedDay = day; isOpen = true }"
                        class="min-h-30 border-b border-r border-slate-300 p-2 cursor-pointer hover:bg-slate-50 flex flex-col justify-between nth-[7n+1]:border-l">
                        <div class="flex justify-center mb-1">
                            <span class="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold"
                                :class="day.isCurrent ? 'bg-indigo-600 text-white' : 'text-slate-500'">
                                {{ day.day }}
                            </span>
                        </div>

                        <template v-if="day.status === 'working'">
                            <div class="text-[8px] sm:text-[11px]">
                                <div class="flex items-center gap-2 px-1 sm:px-2 py-1 rounded font-bold justify-center sm:justify-start"
                                    :class="day.totalHours >= DAILY_TARGET
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-rose-50 text-rose-700'">
                                    <Clock class="hidden sm:flex" :size="10" />
                                    {{ day.totalFormatted }}
                                </div>

                                <div class="hidden sm:flex text-slate-400 mt-1 justify-center">
                                    {{ day.inTime }} - {{ day.outTime }}
                                </div>
                            </div>
                        </template>

                        <template v-else>
                            <div class="h-full flex items-center justify-center text-slate-300 text-xs font-bold">
                                {{ day.status === 'holiday' ? 'Holiday' : 'Off' }}
                            </div>
                        </template>
                    </div>
                </div>
            </main>
        </div>
        <AttendanceModalDayDetailsOverlay v-model:open="isOpen" :day="selectedDay" @close="close" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Clock } from 'lucide-vue-next'
import type { AttendanceDay } from '~/types/attendance'

type ViewType = 'month' | 'week'

const DAILY_TARGET = 9
const YEAR = 2025
const MONTH = 11

const view = ref<ViewType>('month')
const currentWeekIndex = ref(2)
const selectedDay = ref<AttendanceDay | null>(null)
const isOpen = ref(false)

const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const attendanceData = ref<AttendanceDay[]>([])

function buildBaseCalendar(): AttendanceDay[] {
    const result: AttendanceDay[] = []
    let saturdayCount = 0

    const firstDay = new Date(YEAR, MONTH, 1)
    const lastDay = new Date(YEAR, MONTH + 1, 0)

    const daysInMonth = lastDay.getDate()
    const startDayIndex = firstDay.getDay()

    for (let i = startDayIndex; i > 0; i--) {
        const date = new Date(YEAR, MONTH, 1 - i)
        result.push({
            day: date.getDate(),
            date,
            dateStr: date.toDateString(),
            totalHours: 0,
            totalFormatted: '',
            status: 'off',
            isLate: false,
            isOutsideMonth: true
        })
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(YEAR, MONTH, day)
        const dow = date.getDay()

        let status: AttendanceDay['status'] = 'working'

        if (dow === 0) status = 'weekend'
        if (dow === 6) {
            saturdayCount++
            status = saturdayCount % 2 ? 'off' : 'working'
        }

        if (day === 25) status = 'holiday'

        result.push({
            day,
            date,
            dateStr: date.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            }),
            totalHours: status === 'working' ? 8 : 0,
            totalFormatted: status === 'working' ? '8h 0m' : '',
            inTime: status === 'working' ? '09:30 AM' : undefined,
            outTime: status === 'working' ? '06:30 PM' : undefined,
            status,
            isLate: false,
            isCurrent: date.toDateString() === new Date().toDateString()
        })
    }

    while (result.length % 7 !== 0) {
        const date = new Date(YEAR, MONTH, daysInMonth + (result.length % 7))
        result.push({
            day: date.getDate(),
            date,
            dateStr: date.toDateString(),
            totalHours: 0,
            totalFormatted: '',
            status: 'off',
            isLate: false,
            isOutsideMonth: true
        })
    }

    return result
}

attendanceData.value = buildBaseCalendar()
onMounted(() => {
    attendanceData.value.forEach(day => {
        if (day.status === 'working') {
            const totalHours = 7.5 + Math.random() * 3
            const h = Math.floor(totalHours)
            const m = Math.floor((totalHours - h) * 60)

            day.totalHours = totalHours
            day.totalFormatted = `${h}h ${m}m`
        }
    })
})

const weeks = computed(() => {
    const w: AttendanceDay[][] = []
    for (let i = 0; i < attendanceData.value.length; i += 7) {
        w.push(attendanceData.value.slice(i, i + 7))
    }
    return w
})

const displayedData = computed(() =>
    view.value === 'month'
        ? attendanceData.value
        : weeks.value[currentWeekIndex.value] || []
)

function close() {
    isOpen.value = false
    selectedDay.value = null
}
</script>
