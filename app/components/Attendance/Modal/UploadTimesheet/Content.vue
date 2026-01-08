<template>
    <UForm :schema="timeSheetSchema" :state="state" class="space-y-4 w-full" @submit="onSubmit">
        <div class="flex justify-between gap-4">
            <UFormField label="Clock In" name="clock_in" class="flex-1">
                <UInput v-model="state.clock_in" type="time" size="lg" icon="i-heroicons-clock" class="w-full" />
            </UFormField>

            <UFormField label="Clock Out" name="clock_out" class="flex-1 ">
                <UInput v-model="state.clock_out" type="time" size="lg" icon="i-heroicons-clock" class="w-full" />
            </UFormField>
        </div>

        <UFormField label="Comment" name="comment" :ui="{ wrapper: 'grid grid-cols-4 items-start gap-4' }">
            <div class="col-span-3">
                <UTextarea v-model="state.comment" :rows="5" class="w-full" />
            </div>
        </UFormField>

        <UFormField label="Screenshot" name="screenshot">
            <div class="col-span-3">
                <div v-if="!state.screenshot"
                    class="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-all"
                    @click="fileInput?.click()">
                    <UIcon name="i-heroicons-photo" class="w-8 h-8 text-gray-400 mb-1" />
                    <p class="text-xs text-gray-500 font-medium text-center">Click to upload screenshot</p>
                </div>
                <div v-else class="relative group">
                    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-sm bg-gray-100">
                        <img :src="previewUrl || undefined" alt="Preview" class="w-full h-40 object-contain bg-white" />

                        <div class="p-2 bg-white border-t border-gray-100 flex items-center justify-between">
                            <span class="text-xs text-gray-500 truncate max-w-50">
                                {{ state.screenshot.name }}
                            </span>
                            <UButton color="error" variant="soft" icon="i-heroicons-trash" size="xs" label="Remove"
                                class="cursor-pointer" @click="removeFile" />
                        </div>
                    </div>
                </div>
                <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="onFileChange" />
            </div>
        </UFormField>

        <div class="flex justify-end pt-4 w-full">
            <UButton type="submit" color="secondary" size="lg" :loading="isSubmitting" class="cursor-pointer">
                Submit
            </UButton>
        </div>
    </UForm>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const props = defineProps<{
    day: any | null
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'update-success'): void
}>()

const isSubmitting = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(null)

const attendanceStore = useAttendanceStore()
const toast = useToast()

const state = reactive({
    clock_in: '',
    clock_out: '',
    comment: '',
    screenshot: undefined as File | undefined
})

const timeSheetSchema = z.object({
    clock_in: z.string().min(1, "Required"),
    clock_out: z.string().min(1, "Required"),
    comment: z.string().min(5, "Comment is too short"),
    screenshot: z.instanceof(File).optional()
}).refine((data) => {
    if (data.clock_in && data.clock_out) {
        return data.clock_out > data.clock_in
    }
    return true
}, {
    message: "Clock out must be later than clock in",
    path: ["clock_out"]
})

type Schema = z.output<typeof timeSheetSchema>

function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement
    if (input.files?.[0]) {
        const file = input.files[0]
        state.screenshot = file
        previewUrl.value = URL.createObjectURL(file)
    }
}

function removeFile() {
    if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
    }
    state.screenshot = undefined
    previewUrl.value = null
    if (fileInput.value) fileInput.value.value = ''
}

function calculateTotalHours(clockIn: string, clockOut: string): string {
    if (!clockIn || !clockOut) return '0'
    
    const [inHours, inMinutes] = clockIn.split(':').map(Number)
    const [outHours, outMinutes] = clockOut.split(':').map(Number)
    
    const inTotalMinutes = (inHours ?? 0) * 60 + (inMinutes ?? 0)
    const outTotalMinutes = (outHours ?? 0) * 60 + (outMinutes ?? 0)
    
    const diffMinutes = outTotalMinutes - inTotalMinutes
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60
    
    const totalHours = hours + (minutes / 60)
    return totalHours.toFixed(1)
}

function formatTimeToAmPm(time24: string): string {
    if (!time24) return ''
    const [hours, minutes] = time24.split(':').map(Number)
    const ampm = (hours ?? 0) >= 12 ? 'PM' : 'AM'
    const displayHours = (hours ?? 0) % 12 || 12
    return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
    if (!props.day) {
        toast.add({ title: 'Error', description: 'Day information is missing', color: 'error' })
        return
    }

    isSubmitting.value = true
    try {
        const totalTime = calculateTotalHours(state.clock_in, state.clock_out)
        const homeInTime = formatTimeToAmPm(state.clock_in)
        const homeOutTime = formatTimeToAmPm(state.clock_out)

        // Upload screenshot if available and get public_id
        let screenshotPublicId: string | undefined
        if (state.screenshot) {
            const formData = new FormData()
            formData.append('image', state.screenshot)
            try {
                const uploadResponse = await useApi<{ public_id: string }>('/auth/upload-image/', {
                    method: 'POST',
                    body: formData,
                })
                screenshotPublicId = uploadResponse.public_id
            } catch (uploadError) {
                console.error('Failed to upload screenshot:', uploadError)
                toast.add({ 
                    title: 'Error', 
                    description: 'Failed to upload screenshot', 
                    color: 'error' 
                })
                isSubmitting.value = false
                return
            }
        }

        await attendanceStore.submitTimesheet(
            props.day.full_date || props.day.date,
            totalTime,
            state.comment,
            props.day.is_working_from_home || false,
            homeInTime,
            homeOutTime,
            screenshotPublicId
        )

        toast.add({ title: 'Success', description: 'Timesheet submitted successfully', color: 'success' })
        
        // Reset form
        state.clock_in = ''
        state.clock_out = ''
        state.comment = ''
        removeFile()
        
        // Emit events to close modals and refresh
        emit('update-success')
        emit('close')
    } catch (error: any) {
        console.error('Failed to submit timesheet:', error)
        toast.add({ 
            title: 'Error', 
            description: error?.message || 'Failed to submit timesheet', 
            color: 'error' 
        })
    } finally {
        isSubmitting.value = false
    }
}
</script>