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

const emit = defineEmits<{
    (e: 'close'): void
}>()

const isSubmitting = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(null)

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

async function onSubmit(event: FormSubmitEvent<Schema>) {
    isSubmitting.value = true
    try {
        await new Promise(r => setTimeout(r, 1000))
        emit('close')
    } catch (err) {
        console.error(err)
    } finally {
        isSubmitting.value = false
    }
}
</script>