<template>
    <UModal v-model:open="modelOpen" :overlay="true" :ui="{ overlay: 'bg-slate-900/40 backdrop-blur-sm' }">
        <template #header>
            <AttendanceModalUpdateWorkingHoursHeader @close="close"/>
        </template>

        <template #body>
            <AttendanceModalUpdateWorkingHoursContent
                :selectedEmployee="selectedEmployee"
                @close="close"
                @update-success="handleUpdateSuccess"
            />
        </template>
    </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
    open: boolean
    selectedEmployee?: object | null
}>()

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void
    (e: 'close'): void
    (e: 'update-success'): void
}>()

const device = useDevice()

const modelOpen = computed({
    get: () => props.open,
    set: (value: boolean) => emit('update:open', value)
})

const close = () => {
    emit('update:open', false)
    emit('close')
}

const handleUpdateSuccess = () => {
    // Emit the event to parent (attendance.vue page)
    emit('update-success')
    // Close the modal
    close()
}
</script>