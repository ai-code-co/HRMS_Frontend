<template>
    <UModal v-model:open="modelOpen" :overlay="true"
        :ui="{ overlay: 'bg-slate-900/40 backdrop-blur-sm', content: 'w-[90vw] sm:w-full sm:max-w-2xl' }" size="2xl">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <h3 class="text-lg font-semibold text-slate-800">Edit Holiday</h3>
                <UButton icon="i-heroicons-x-mark" variant="ghost" class="rounded-full cursor-pointer" @click="close" />
            </div>
        </template>

        <template #body>
            <UForm @submit.prevent="onSubmit" class="w-full">
                <div class="space-y-4">
                    <UFormField label="Holiday Name" name="name">
                        <UInput v-model="state.name" size="xl" placeholder="e.g. Diwali, Christmas"
                            color="secondary" variant="outline" class="w-full" />
                    </UFormField>

                    <UFormField label="Date" name="date">
                        <UPopover class="w-full">
                            <UButton color="secondary" variant="outline" icon="i-lucide-calendar" block size="xl"
                                class="w-full justify-start">
                                {{ state.date ? df.format(state.date.toDate(getLocalTimeZone())) : 'Select date' }}
                            </UButton>
                            <template #content>
                                <UCalendar v-model="state.date" class="p-2" />
                            </template>
                        </UPopover>
                    </UFormField>

                    <UFormField label="Type" name="holiday_type">
                        <USelectMenu v-model="state.holiday_type" :items="typeOptions" size="xl"
                            value-key="value" placeholder="Select type" color="secondary" variant="outline" class="w-full" />
                    </UFormField>
                </div>

                <UButton type="submit" block size="xl" :loading="holidayStore.isLoading" class="mt-6">
                    Update Holiday
                </UButton>
            </UForm>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'
import { useHolidayStore, HOLIDAY_TYPE_OPTIONS_WITH_RESTRICTED, type HolidayType, toApiHolidayType } from '~/stores/holidays'
import type { Holiday } from '~/stores/holidays'

const props = defineProps<{
    open: boolean
    holiday: Holiday | null
}>()
const emit = defineEmits(['update:open', 'close'])

const holidayStore = useHolidayStore()
const df = new DateFormatter('en-US', { dateStyle: 'medium' })

function parseFullDateToCalendarDate(fullDate: string): CalendarDate {
    const [y, m, d] = fullDate.split('-').map(Number)
    return new CalendarDate(y, m, d)
}

const typeOptions = HOLIDAY_TYPE_OPTIONS_WITH_RESTRICTED

const state = ref<{
    name: string
    date: CalendarDate | null
    holiday_type: HolidayType | 'restricted'
}>({
    name: '',
    date: null,
    holiday_type: 'national'
})

const modelOpen = computed({
    get: () => props.open,
    set: (value: boolean) => emit('update:open', value)
})

watch(() => [props.open, props.holiday] as const, ([isOpen, holiday]) => {
    if (holiday && isOpen) {
        state.value = {
            name: holiday.name,
            date: parseFullDateToCalendarDate(holiday.fullDate),
            holiday_type: holiday.is_restricted ? 'restricted' : holiday.type
        }
    }
}, { immediate: true })

const close = () => {
    modelOpen.value = false
    emit('close')
}

function formatDateForApi(date: CalendarDate): string {
    const d = date.toDate(getLocalTimeZone())
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

async function onSubmit() {
    if (!props.holiday || !state.value.date) return

    try {
        await holidayStore.updateHoliday(props.holiday.id, {
            name: state.value.name.trim(),
            date: formatDateForApi(state.value.date),
            holiday_type: toApiHolidayType(state.value.holiday_type)
        })
        modelOpen.value = false
    } catch {
        // Error handled in store
    }
}
</script>
