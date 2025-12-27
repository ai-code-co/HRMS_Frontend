<template>
    <UModal v-model:open="modelOpen" :ui="{ width: 'sm:max-w-4xl', rounded: 'rounded-2xl' }">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <h3 class="text-lg font-semibold text-slate-800">Apply Leave</h3>
                <UButton icon="i-heroicons-x-mark" variant="ghost" color="gray" @click="close" />
            </div>
        </template>

        <template #body>
            <UForm :schema="leaveSchema" :state="state" @submit="onSubmit"
                class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="space-y-2 flex gap-2 flex-col">
                    <div class="flex gap-2">
                        <p class="text-sm font-medium text-slate-500 w-16">From</p>
                        <UPopover>
                            <UButton color="secondary" variant="outline" icon="i-lucide-calendar" block
                                class="justify-start">
                                {{ state.from_date ? df.format(state.from_date.toDate(getLocalTimeZone())) : 'Select adate' }}
                            </UButton>
                            <template #content>
                                <UCalendar v-model="state.from_date" class="p-2" />
                            </template>
                        </UPopover>
                    </div>

                    <div class="flex gap-2">
                        <p class="text-sm font-medium text-slate-500 w-16">To</p>
                        <UPopover>
                            <UButton color="secondary" variant="outline" icon="i-lucide-calendar" block
                                class="justify-start">
                                {{ state.to_date ? df.format(state.to_date.toDate(getLocalTimeZone())) : 'Select a date'
                                }}
                            </UButton>
                            <template #content>
                                <UCalendar v-model="state.to_date" class="p-2" />
                            </template>
                        </UPopover>
                    </div>
                </div>

                <div class="space-y-6">
                    <UFormGroup label="Leave Type" name="leave_type">
                        <USelectMenu v-model="state.leave_type" :options="Object.keys(leaveStore.balancesRaw)" size="xl"
                            placeholder="Select leave type" />
                    </UFormGroup>

                    <UFormGroup label="Duration" name="no_of_days">
                        <UInput :model-value="calculatedDays" readonly size="xl" icon="i-heroicons-calendar-days" />
                        <div class="flex gap-2 mt-3">
                            <UButton size="sm" :variant="state.is_first_half ? 'solid' : 'outline'"
                                :color="state.is_first_half ? 'primary' : 'gray'"
                                @click="state.is_first_half = !state.is_first_half">
                                First Half
                            </UButton>
                            <UButton size="sm" :variant="state.is_second_half ? 'solid' : 'outline'"
                                :color="state.is_second_half ? 'primary' : 'gray'"
                                @click="state.is_second_half = !state.is_second_half">
                                Second Half
                            </UButton>
                        </div>
                    </UFormGroup>

                    <UFormGroup label="Reason" name="reason">
                        <UTextarea v-model="state.reason" :rows="4" size="xl" placeholder="Brief reason for leave" />
                    </UFormGroup>

                    <UButton type="submit" block size="xl" :loading="leaveStore.loading">
                        Submit Application
                    </UButton>
                </div>
            </UForm>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { format } from 'date-fns'
import { leaveSchema } from '~/schemas/Leaves/apply/schema'
import type { FormSubmitEvent } from '#ui/types'
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits(['update:open', 'close'])

const leaveStore = useLeaveStore()
const toast = useToast()

const df = new DateFormatter('en-US', { dateStyle: 'medium' })

const today = () => {
    const d = new Date()
    return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

const state = ref({
    leave_type: '',
    from_date: today(),
    to_date: today(),
    reason: '',
    is_first_half: false,
    is_second_half: false
})

const modelOpen = computed({
    get: () => props.open,
    set: (value: boolean) => emit('update:open', value)
})

const close = () => {
    modelOpen.value = false
    emit('close')
}

watch(() => props.open, (open) => {
    if (open) {
        state.value = {
            leave_type: '',
            from_date: today(),
            to_date: today(),
            reason: '',
            is_first_half: false,
            is_second_half: false
        }
    }
})

const calculatedDays = computed(() => {
    if (!state.value.from_date || !state.value.to_date) return 0

    const start = state.value.from_date.toDate(getLocalTimeZone())
    const end = state.value.to_date.toDate(getLocalTimeZone())

    const diff = end.getTime() - start.getTime()
    let days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1

    if (state.value.is_first_half) days -= 0.5
    if (state.value.is_second_half) days -= 0.5

    return days > 0 ? days : 0
})

async function onSubmit(event: FormSubmitEvent<any>) {
    try {
        const payload = {
            ...event.data,
            from_date: format(state.value.from_date.toDate(getLocalTimeZone()), 'yyyy-MM-dd'),
            to_date: format(state.value.to_date.toDate(getLocalTimeZone()), 'yyyy-MM-dd'),
            no_of_days: calculatedDays.value
        }

        await leaveStore.applyLeave(payload)
        toast.add({ title: 'Success', description: 'Leave application submitted', color: 'success' })
        modelOpen.value = false
    } catch (err: any) {
        toast.add({ title: 'Error', description: err?.data?.message || 'Submission failed', color: 'error' })
    }
}
</script>