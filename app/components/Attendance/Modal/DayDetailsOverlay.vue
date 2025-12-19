<template>
    <UDrawer v-if="device.isMobile" v-model:open="modelOpen" side="bottom" :overlay="true"
        :ui="{ overlay: 'bg-slate-900/40 backdrop-blur-sm' }">
        <template #header>
            <AttendanceModalDayDetailsHeader :day="day" @close="close" class="w-full" />
        </template>

        <template #body>
            <AttendanceModalDayDetailsContent :day="day" />
        </template>
    </UDrawer>
    <UModal v-else v-model:open="modelOpen" :overlay="true" :ui="{ overlay: 'bg-slate-900/40 backdrop-blur-sm' }">
        <template #header>
            <AttendanceModalDayDetailsHeader :day="day" @close="close" class="w-full" />
        </template>

        <template #body>
            <AttendanceModalDayDetailsContent :day="day" class="w-full" />
        </template>
    </UModal>
</template>

<script setup lang="ts">
import type { AttendanceDay } from '~/types/attendance'
import { computed } from 'vue'

const props = defineProps<{
    open: boolean
    day: AttendanceDay | null
}>()

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void
    (e: 'close'): void
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
</script>