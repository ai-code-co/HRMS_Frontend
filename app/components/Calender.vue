<template>
    <div class="flex h-screen bg-white overflow-hidden font-sans text-slate-900">
        <!-- Main -->
        <div class="flex-1 flex flex-col overflow-hidden">
            <!-- Calendar -->
            <main class="flex-1 overflow-y-auto">
                <!-- Weekdays -->
                <div class="grid grid-cols-7 border-b border-r border-slate-300 bg-white sticky top-0">
                    <div v-for="d in weekdays" :key="d" class="py-2 text-center text-[10px] font-bold text-slate-500">
                        {{ d }}
                    </div>
                </div>

                <!-- Cells -->
                <div class="grid grid-cols-7 auto-rows-fr">
                    <div v-for="day in displayedData" :key="day.day" @click="selectedDay = day"
                        class="min-h-[120px] border-b border-r border-slate-300 p-2 cursor-pointer hover:bg-slate-50 flex flex-col justify-between">
                        <div class="flex justify-center mb-1">
                            <span class="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold"
                                :class="day.isCurrent ? 'bg-indigo-600 text-white' : 'text-slate-500'">
                                {{ day.day }}
                            </span>
                        </div>

                        <template v-if="day.status === 'working'">
                            <div>
                                <div class="flex items-center gap-2 px-2 py-1 rounded text-[10px] font-bold" :class="day.totalHours >= DAILY_TARGET
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-rose-50 text-rose-700'">
                                    <Clock size="10" />
                                    {{ day.totalFormatted }}
                                </div>

                                <div class="text-[9px] text-slate-400 mt-1">
                                    {{ day.inTime }}
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

        <!-- Modal -->
        <transition name="fade">
            <div v-if="selectedDay" class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
                @click.self="selectedDay = null">
                <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm">
                    <div class="p-4 border-b flex justify-between items-center">
                        <span class="text-xs font-bold">{{ selectedDay.dateStr }}</span>
                        <XCircle class="cursor-pointer" @click="selectedDay = null" />
                    </div>

                    <div class="p-6">
                        <h3 class="text-lg font-bold">Attendance Session</h3>

                        <p v-if="selectedDay.status === 'working'" class="mt-2 text-sm">
                            {{ selectedDay.inTime }} – {{ selectedDay.outTime }}
                        </p>

                        <p v-else class="italic text-slate-400 mt-6 text-center">
                            No activity recorded
                        </p>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Clock, XCircle } from 'lucide-vue-next'

type ViewType = 'month' | 'week'

interface AttendanceDay {
    day: number
    date: Date
    dateStr: string
    inTime?: string
    outTime?: string
    totalHours: number
    totalFormatted?: string
    status: 'working' | 'off' | 'holiday' | 'weekend'
    isLate: boolean
    isCurrent?: boolean
    isOutsideMonth?: boolean
}

const DAILY_TARGET = 9
const YEAR = 2025
const MONTH = 11

const sidebarOpen = ref(true)
const view = ref<ViewType>('month')
const currentWeekIndex = ref(2)
const selectedDay = ref<AttendanceDay | null>(null)

const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const attendanceData = computed<AttendanceDay[]>(() => {
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

        let totalHours = 0
        let totalFormatted, inTime, outTime

        if (status === 'working') {
            totalHours = 7.5 + Math.random() * 3
            const h = Math.floor(totalHours)
            const m = Math.floor((totalHours - h) * 60)
            totalFormatted = `${h}h ${m}m`
            inTime = '09:30 AM'
            outTime = '06:30 PM'
        }

        result.push({
            day,
            date,
            dateStr: date.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            }),
            inTime,
            outTime,
            totalHours,
            totalFormatted,
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
            status: 'off',
            isLate: false,
            isOutsideMonth: true
        })
    }

    return result
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


function resetToToday() {
    view.value = 'month'
    currentWeekIndex.value = Math.floor(attendanceData.value.findIndex(d => d.isCurrent) / 7)
}

function prevWeek() {
    if (view.value === 'week' && currentWeekIndex.value > 0) {
        currentWeekIndex.value--
    }
}

function nextWeek() {
    if (view.value === 'week' && currentWeekIndex.value < weeks.value.length - 1) {
        currentWeekIndex.value++
    }
}
</script>
