<script setup lang="ts">
const store = useAttendanceStore()

const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

onMounted(() => {
    store.fetchAttendance()
})

const isModalOpen = ref(false)
const selectedRecord = ref(null)

function openDetails(day: any) {
    if (day.record) {
        selectedRecord.value = day.record
        isModalOpen.value = true
    }
}
</script>

<template>
    <div class="flex flex-col h-screen bg-white">
        <AttendanceHeader />
        <main class="flex-1 overflow-y-auto relative">
            <div v-if="store.loading" class="absolute inset-0 z-50 bg-white/60 flex items-center justify-center">
                <UIcon name="i-lucide-loader-2" class="animate-spin text-indigo-600" size="32" />
            </div>
            <div class="grid grid-cols-7 sticky top-0 z-10 border-b border-slate-200">
                <div v-for="d in weekdays" :key="d"
                    class="py-3 text-center text-[10px] font-bold text-slate-400 bg-slate-50">
                    {{ d }}
                </div>
            </div>
            <div class="grid grid-cols-7 border-l border-slate-200">
                <AttendanceDayCell v-for="day in store.calendarDays" :key="day.dateKey" :day="day"
                    @click="openDetails(day)" />
            </div>
        </main>
        <AttendanceModalDayDetailsOverlay v-model:open="isModalOpen" :record="selectedRecord" />
    </div>
</template>