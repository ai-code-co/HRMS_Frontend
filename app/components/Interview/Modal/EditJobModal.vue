<template>
    <UModal v-model:open="modelOpen" :overlay="true"
        :ui="{ overlay: 'bg-slate-900/40 backdrop-blur-sm', content: 'w-[90vw] sm:w-full sm:max-w-2xl' }" size="2xl">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <h3 class="text-lg font-semibold text-slate-800">Edit Job</h3>
                <UButton icon="i-heroicons-x-mark" variant="ghost" class="rounded-full cursor-pointer" @click="close" />
            </div>
        </template>

        <template #body>
            <UForm :schema="jobSchema" :state="state" @submit="onSubmit" class="w-full">
                <div class="space-y-4">
                    <UFormField label="Job Title" name="title">
                        <UInput v-model="state.title" size="xl" placeholder="Enter job title"
                            color="secondary" variant="outline" />
                    </UFormField>

                    <UFormField label="Description" name="description">
                        <UTextarea v-model="state.description" :rows="6" size="xl" placeholder="Enter job description"
                            class="w-full" color="secondary" variant="outline" />
                    </UFormField>

                    <UFormField label="Status" name="status">
                        <USelectMenu v-model="state.status" :items="statusOptions" size="xl"
                            placeholder="Select status" color="secondary" variant="outline" class="w-full" />
                    </UFormField>
                </div>

                <UButton type="submit" block size="xl" :loading="interviewStore.loading" class="mt-6">
                    Update Job
                </UButton>
            </UForm>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import { useInterviewStore } from '~/stores/interview'
import type { Job, JobStatus } from '~/types/interview'

const props = defineProps<{ 
    open: boolean
    job: Job | null
}>()
const emit = defineEmits(['update:open', 'close'])

const interviewStore = useInterviewStore()
const toast = useToast()

const jobSchema = z.object({
    title: z.string().min(1, 'Job title is required'),
    description: z.string().min(1, 'Job description is required'),
    status: z.enum(['open', 'closed'], { required_error: 'Status is required' })
})

type JobFormSchema = z.output<typeof jobSchema>

const state = ref<JobFormSchema>({
    title: '',
    description: '',
    status: 'open'
})

const statusOptions = [
    { label: 'Open', value: 'open' },
    { label: 'Closed', value: 'closed' }
]

const modelOpen = computed({
    get: () => props.open,
    set: (value: boolean) => emit('update:open', value)
})

watch(() => props.job, (job) => {
    if (job) {
        state.value = {
            title: job.title,
            description: job.description,
            status: job.status
        }
    }
}, { immediate: true })

watch(() => props.open, (isOpen) => {
    if (!isOpen && props.job) {
        // Reset form when modal closes
        state.value = {
            title: props.job.title,
            description: props.job.description,
            status: props.job.status
        }
    }
})

const close = () => {
    modelOpen.value = false
    emit('close')
}

async function onSubmit(event: FormSubmitEvent<JobFormSchema>) {
    if (!props.job) return
    
    try {
        await interviewStore.updateJob(props.job.id, event.data)
        modelOpen.value = false
    } catch (err: any) {
        // Error is already handled in the store
    }
}
</script>
