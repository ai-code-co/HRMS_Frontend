<template>
    <div class="flex h-screen bg-white overflow-hidden font-sans text-slate-900">
        <div class="flex-1 flex flex-col overflow-hidden">

            <!-- Calendar -->
            <main class="flex-1 overflow-y-auto">
                <div class="grid grid-cols-7 border-b">
                    <div v-for="d in weekdays" :key="d" class="py-2 text-center text-xs font-bold text-slate-500">{{ d
                    }}</div>
                </div>

                <div class="grid grid-cols-7 auto-rows-fr">
                    <div v-for="day in displayedData" :key="day.day" @click="selectedDay = day"
                        class="min-h-[120px] border-r border-b p-2 hover:bg-slate-50 cursor-pointer">
                        <div class="flex justify-center mb-1">
                            <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                :class="day.isCurrent ? 'bg-indigo-600 text-white' : 'text-slate-500'">
                                {{ day.day }}
                            </span>
                        </div>

                        <div v-if="day.status === 'working'" class="space-y-1">
                            <UBadge :color="day.totalHours >= DAILY_TARGET ? 'emerald' : 'rose'" size="xs">
                                {{ day.totalFormatted }}
                            </UBadge>
                            <div class="text-[10px] text-slate-400">{{ day.inTime }}</div>
                        </div>
                        <div v-else class="h-full flex items-center justify-center text-slate-300 text-xs font-bold">
                            {{ day.status === 'holiday' ? 'Holiday' : 'Off' }}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface AttendanceDay {
    day: number
    dateStr: string
    inTime?: string
    outTime?: string
    totalHours: number
    totalFormatted?: string
    status: 'working' | 'off' | 'holiday' | 'weekend'
    isLate: boolean
    isCurrent?: boolean
}

type ViewType = 'month' | 'week'

const sidebarOpen = ref(true)
const view = ref<ViewType>('month')
const currentWeekIndex = ref(2)
const selectedDay = ref<AttendanceDay | null>(null)

const DAILY_TARGET = 9

const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const attendanceData = computed<AttendanceDay[]>(() => {
    const data: AttendanceDay[] = []
    for (let i = 1; i <= 31; i++) {
        data.push({
            day: i,
            dateStr: `${i} Dec 2025`,
            totalHours: Math.random() * 10,
            totalFormatted: '8h 30m',
            status: i % 7 === 0 ? 'weekend' : 'working',
            isLate: false,
            isCurrent: i === 18
        })
    }
    return data
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

const headerTitle = computed(() =>
    view.value === 'month' ? 'December 2025' : `Week ${currentWeekIndex.value + 1}`
)

function resetToToday() {
    view.value = 'month'
    currentWeekIndex.value = 2
}
</script>
