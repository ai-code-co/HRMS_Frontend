<template>
    <template v-if="record">
        <UDrawer v-if="device.isMobile" v-model:open="modelOpen" side="bottom" :overlay="true"
            :ui="{ overlay: 'bg-slate-900/40 backdrop-blur-sm' }">
            <template #header>
                <AttendanceModalDayDetailsHeader :day="record" @close="close" class="w-full" />
            </template>

            <template #body>
                <AttendanceModalDayDetailsContent :day="record" @update-success="handleUpdateSuccess" />
            </template>
        </UDrawer>

        <UModal v-else v-model:open="modelOpen" :overlay="true" :ui="{ overlay: 'bg-slate-900/40 backdrop-blur-sm' }">
            <template #header>
                <AttendanceModalDayDetailsHeader :day="record" @close="close" class="w-full" />
            </template>

            <template #body>
                <AttendanceModalDayDetailsContent :day="record" @update-success="handleUpdateSuccess" class="w-full" />
            </template>
        </UModal>
    </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    open: boolean
    record: any | null
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