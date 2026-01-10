<template>
    <div class="flex flex-col h-screen bg-white">
        <AttendanceHeader/>
        <main class="flex-1 overflow-y-auto relative">
            <div class="hidden sm:grid grid-cols-7 sticky top-0 z-10 border-b border-slate-200">
                <div v-for="d in attendanceStore.weekdays" :key="d"
                    class="py-3 text-center text-[10px] font-bold text-slate-400 bg-slate-50">
                    {{ d }}
                </div>
            </div>
            <div class="grid grid-cols-3 sm:grid-cols-7 border-l border-slate-200" :key="attendanceStore.viewMode">
                <AttendanceDayCell v-for="day in attendanceStore.calendarDays" :key="day.dateKey" :day="day"
                    @click="openDetails(day)" />
            </div>
        </main>
        <AttendanceModalDayDetailsOverlay v-model:open="isModalOpen" :record="selectedRecord" @update-success="handleUpdateSuccess" />
    </div>
</template>
<script setup lang="ts">
const attendanceStore = useAttendanceStore()

const { data: attendanceData } = await useAsyncData('attendance', () => {
    return attendanceStore.fetchAttendance()
})

if (import.meta.client && attendanceData.value) {
    attendanceStore.setAttendanceRecords(attendanceData.value)
}

const isModalOpen = ref(false)
const selectedRecord = ref<any>(null)

function openDetails(day: any) {
    if (!attendanceStore.isDayOpenable(day)) return

    selectedRecord.value = { ...day.record, isFutureDay: day.isFutureDay }
    isModalOpen.value = true
}

function handleUpdateSuccess() {
    attendanceStore.fetchAttendance()
}
</script>
