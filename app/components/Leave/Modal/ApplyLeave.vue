<template>
    <UModal v-model:open="modelOpen" :overlay="true" :ui="{ overlay: 'bg-slate-900/40 backdrop-blur-sm' }" size="2xl">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <h3 class="text-lg font-semibold text-slate-800">Apply Leave</h3>
                <UButton icon="i-heroicons-x-mark" variant="ghost" class="rounded-full cursor-pointer" @click="close" />
            </div>
        </template>

        <template #body>
            <UForm :schema="leaveSchema" :state="state" @submit="onSubmit" class="w-full">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div class="space-y-2 flex gap-2 flex-col">
                        <div class="">
                            <p class="text-sm font-medium">From</p>
                            <UPopover>
                                <UButton color="secondary" variant="outline" icon="i-lucide-calendar" block
                                    class="justify-start">
                                    {{ state.from_date ? df.format(state.from_date.toDate(getLocalTimeZone()))
                                        : 'Selecta date' }}
                                </UButton>
                                <template #content>
                                    <UCalendar v-model="state.from_date" class="p-2" />
                                </template>
                            </UPopover>
                        </div>

                        <UFormField label="Leave Type" name="leave_type">
                            <USelectMenu v-model="state.leave_type" :items="Object.keys(leaveStore.balancesRaw)"
                                size="xl" placeholder="Select leave type" color="secondary" variant="outline"
                                class="w-full" />
                        </UFormField>
                        <UFormField v-if="state.leave_type === 'rh'" label="Select Restricted Holiday"
                            name="holiday_id">
                            <USelectMenu v-model="rh" :items="['dusshera', 'Eid']" size="xl"
                                placeholder="Which holiday?" color="primary" class="w-full">
                                <!-- <template #label>
                                    {{ selectedRHName || 'Select Holiday' }}
                                </template> -->
                            </USelectMenu>
                        </UFormField>

                    </div>

                    <div class="space-y-3">
                        <div class="">
                            <p class="text-sm font-medium">To</p>
                            <UPopover>
                                <UButton color="secondary" variant="outline" icon="i-lucide-calendar" block
                                    class="justify-start">
                                    {{ state.to_date ? df.format(state.to_date.toDate(getLocalTimeZone()))
                                        : 'Select a date'
                                    }}
                                </UButton>
                                <template #content>
                                    <UCalendar v-model="state.to_date" class="p-2" />
                                </template>
                            </UPopover>
                        </div>

                        <UFormField label="No of Days" name="no_of_days">
                            <UInput :model-value="calculatedDays" readonly size="xl" icon="i-heroicons-calendar-days"
                                color="secondary" variant="outline" />
                            <div class="flex gap-2 mt-3">
                                <UButton size="sm" @click="state.is_first_half = !state.is_first_half">
                                    First Half
                                </UButton>
                                <UButton size="sm" @click="state.is_second_half = !state.is_second_half">
                                    Second Half
                                </UButton>
                            </div>
                        </UFormField>
                    </div>
                </div>
                <UFormField label="Supporting Document"
                    :description="uploadedFileName ? `Attached: ${uploadedFileName}` : 'Select an image to upload'"
                    class="my-3">
                    <div class="relative">
                        <UInput type="file" icon="i-heroicons-paper-clip" accept="image/*" :disabled="isUploading"
                            @change="handleFileUpload" size="xl" color="secondary" variant="outline">
                            <template #trailing v-if="isUploading">
                                <UIcon name="i-heroicons-arrow-path" class="animate-spin w-5 h-5 text-primary" />
                            </template>
                            <template #trailing v-else-if="state.doc_link">
                                <UIcon name="i-heroicons-check-badge" class="w-5 h-5 text-green-500" />
                            </template>
                        </UInput>
                    </div>
                    <p v-if="isUploading" class="text-xs text-primary mt-1 animate-pulse">
                        Uploading to server...
                    </p>
                </UFormField>
                <UFormField label="Reason" name="reason" class="w-full mb-3">
                    <UTextarea v-model="state.reason" :rows="4" size="xl" placeholder="Brief reason for leave"
                        class="w-full" color="secondary" variant="outline" />
                </UFormField>
                <UButton type="submit" block size="xl" :loading="leaveStore.loading">
                    Apply Leave
                </UButton>
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
const rh = ref<any>('');
const isUploading = ref(false)
const uploadedFileName = ref('')

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
    is_second_half: false,
    doc_link: undefined as string | undefined,
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
            is_second_half: false,
            doc_link: undefined,
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

const handleFileUpload = async (event: Event) => {
    const file = event.target.files?.[0]
    if (!file) return
    isUploading.value = true
    uploadedFileName.value = file.name
    const formData = new FormData()
    formData.append('image', file)

    try {
        const response = await useApi<{ public_id: string }>('/auth/upload-image/', {
            method: 'POST',
            body: formData,
        })

        state.value.doc_link = response.public_id;
        toast.add({ title: 'File uploaded successfully', color: 'success', icon: 'i-heroicons-check-circle' })
    } catch (err) {
        uploadedFileName.value = ''
        toast.add({ title: 'Upload failed', color: 'error', icon: 'i-heroicons-exclamation-triangle' })
    } finally {
        isUploading.value = false
    }
}

async function onSubmit(event: FormSubmitEvent<any>) {
    try {
        const payload = {
            ...event.data,
            from_date: format(state.value.from_date.toDate(getLocalTimeZone()), 'yyyy-MM-dd'),
            to_date: format(state.value.to_date.toDate(getLocalTimeZone()), 'yyyy-MM-dd'),
            no_of_days: calculatedDays.value,
            day_status: 'Full Day',
            action: 'apply_leave',
        }
        await leaveStore.applyLeave(payload)
        toast.add({ title: 'Success', description: 'Leave application submitted', color: 'success' })
        modelOpen.value = false
    } catch (err: any) {
        toast.add({ title: 'Error', description: err?.data?.message || 'Submission failed', color: 'error' })
    }
}
</script>