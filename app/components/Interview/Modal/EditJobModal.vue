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
                        <UTextarea v-model="state.description" :rows="4" size="xl" placeholder="Enter job description"
                            class="w-full" color="secondary" variant="outline" />
                    </UFormField>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <UFormField label="Openings" name="openings">
                            <UInput v-model.number="state.openings" type="number" min="1" size="xl"
                                placeholder="e.g. 3" color="secondary" variant="outline" />
                        </UFormField>
                        <UFormField label="Applicants" name="applicants">
                            <UInput v-model.number="state.applicants" type="number" min="0" size="xl"
                                placeholder="e.g. 12" color="secondary" variant="outline" />
                        </UFormField>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <UFormField label="Job type" name="job_type">
                            <USelectMenu v-model="state.job_type" :items="jobTypeOptions" size="xl"
                                value-key="value" placeholder="Select job type" color="secondary" variant="outline"
                                class="w-full" />
                        </UFormField>
                        <UFormField label="Experience" name="experience">
                            <UInput v-model="state.experience" size="xl" placeholder="e.g. 2-5 years"
                                color="secondary" variant="outline" />
                        </UFormField>
                    </div>

                    <UFormField label="Status" name="status">
                        <USelectMenu v-model="state.status" :items="statusOptions" size="xl" value-key="value"
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
import type { Job, JobStatus, JobType } from '~/types/interview'

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
    status: z.enum(['open', 'closed'], { required_error: 'Status is required' }),
    openings: z.number().int().min(1).default(3),
    applicants: z.number().int().min(0).default(0),
    job_type: z.enum(['Remote', 'Hybrid', 'Onsite']).default('Remote'),
    experience: z.string().min(1, 'Experience is required').default('2-5 years')
})

type JobFormSchema = z.output<typeof jobSchema>

const state = ref<JobFormSchema>({
    title: '',
    description: '',
    status: 'open',
    openings: 3,
    applicants: 0,
    job_type: 'Remote',
    experience: '2-5 years'
})

const statusOptions = [
    { label: 'Open', value: 'open' },
    { label: 'Closed', value: 'closed' }
]

const jobTypeOptions = [
    { label: 'Remote', value: 'Remote' },
    { label: 'Hybrid', value: 'Hybrid' },
    { label: 'Onsite', value: 'Onsite' }
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
            status: job.status,
            openings: job.openings ?? 3,
            applicants: job.applicants ?? 0,
            job_type: (job.job_type ?? 'Remote') as JobType,
            experience: job.experience ?? '2-5 years'
        }
    }
}, { immediate: true })

watch(() => props.open, (isOpen) => {
    if (!isOpen && props.job) {
        state.value = {
            title: props.job.title,
            description: props.job.description,
            status: props.job.status,
            openings: props.job.openings ?? 3,
            applicants: props.job.applicants ?? 0,
            job_type: (props.job.job_type ?? 'Remote') as JobType,
            experience: props.job.experience ?? '2-5 years'
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
        await interviewStore.updateJob(props.job.id, {
            title: event.data.title,
            description: event.data.description,
            status: event.data.status,
            openings: event.data.openings,
            applicants: event.data.applicants,
            job_type: event.data.job_type,
            experience: event.data.experience
        })
        modelOpen.value = false
    } catch (err: any) {
        // Error is already handled in the store
    }
}
</script>
