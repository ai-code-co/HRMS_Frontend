<template>
    <div class="min-h-screen bg-white flex items-center justify-center p-4">
        <!-- Global Page Loading Overlay -->
        <Transition name="fade">
            <div v-if="isPageLoading"
                class="fixed inset-0 bg-white/50 z-50 flex items-center justify-center backdrop-blur-sm">
                <div class="flex flex-col items-center gap-3">
                    <UIcon name="i-lucide-loader-2" class="w-10 h-10 text-indigo-600 animate-spin" />
                </div>
            </div>
        </Transition>

        <div class="w-full max-w-2xl rounded-xl bg-white border border-slate-200 shadow-xl p-6 sm:p-8">
            <!-- Invalid or missing token -->
            <div v-if="!token" class="text-center space-y-4">
                <h1 class="text-xl font-semibold text-white">Invalid link</h1>
                <p class="text-slate-400 text-sm">
                    This application link is missing or invalid. Please use the link from your invitation email.
                </p>
            </div>

            <!-- Loading invite -->
            <div v-else-if="inviteLoading" class="flex flex-col items-center justify-center py-12 space-y-4">
                <UIcon name="i-lucide-loader-2" class="size-8 text-primary-400 animate-spin" />
                <p class="text-slate-400 text-sm">Loading your invitation...</p>
            </div>

            <!-- Invite error (expired / invalid / already used token) -->
            <div v-else-if="inviteError" class="text-center">
                <div class="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto">
                    <UIcon name="i-lucide-triangle-alert" class="size-10 text-amber-500" />
                </div>
                <div class="space-y-2 mt-1">
                    <p class="text-slate-500 text-sm">
                        This application link has already been used or has expired. Please request a new invitation.
                    </p>
                </div>
            </div>

            <!-- Application form -->
            <template v-else>
                <div class="mb-6">
                    <h1 class="text-xl font-semibold text-slate-800">Application Form</h1>
                    <p class="text-slate-600 text-sm mt-1">
                        Please fill out the form below to submit your application
                    </p>
                </div>

                <UForm :schema="applySchema" :state="state" @submit="onSubmit" class="space-y-5">
                    <!-- Email (from invitation) - read-only -->
                    <UFormField name="email">
                        <template #label>
                            <span class="font-medium">Email (from invitation)</span>
                        </template>
                        <UInput
                            :model-value="state.email"
                            type="email"
                            size="xl"
                            variant="outline"
                            disabled
                            class="w-full bg-slate-100 text-slate-600 cursor-not-allowed"
                        />
                    </UFormField>

                    <!-- Full Name -->
                    <UFormField name="full_name" required>
                        <template #label>
                            <span class="text-slate-700 font-medium">Full Name</span>
                        </template>
                        <UInput
                            v-model="state.full_name"
                            type="text"
                            size="xl"
                            placeholder="Enter your full name"
                            color="neutral"
                            variant="outline"
                            class="w-full bg-slate-50 border-slate-300 placeholder-slate-500 text-slate-800 outline-none ring-0 focus:ring-0 focus:ring-transparent focus:outline-none focus:border-primary-500 focus:border-2"
                        />
                    </UFormField>

                    <!-- Phone (optional) -->
                    <UFormField name="phone">
                        <template #label>
                            <span class="text-slate-700 font-medium">Phone Number (optional)</span>
                        </template>
                        <UInput
                            v-model="state.phone"
                            type="text"
                            inputmode="numeric"
                            pattern="[0-9]+"
                            maxlength="10"
                            @keypress="handleNumericKeyPress"
                            @input="handlePhoneInput"
                            size="xl"
                            placeholder="Enter your phone number (optional)"
                            color="neutral"
                            variant="outline"
                            class="w-full bg-slate-50 border-slate-300 placeholder-slate-500 text-slate-800 outline-none ring-0 focus:ring-0 focus:ring-transparent focus:outline-none focus:border-primary-500 focus:border-2"
                        />
                    </UFormField>

                    <!-- Select Position -->
                    <UFormField name="job_id" required>
                        <template #label>
                            <span class="text-slate-700 font-medium">Select Position</span>
                        </template>
                        <USelectMenu
                            v-model="state.job_id"
                            :items="jobOptions"
                            value-key="value"
                            size="xl"
                            placeholder="Select a job position"
                            class="w-full"
                            color="neutral"
                            variant="outline"
                            :ui="{
                                trigger: 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-500 focus:border-primary-500 focus:border-2 focus:ring-0 focus:ring-transparent focus:outline-none',
                                option: { color: 'neutral' }
                            }"
                        />
                    </UFormField>

                    <!-- Resume -->
                    <UFormField name="resume" required>
                        <template #label>
                            <span class="text-slate-700 font-medium">Resume</span>
                        </template>
                        <div class="space-y-1">
                            <input
                                ref="resumeInputRef"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                class="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-200 file:text-slate-800 file:cursor-pointer hover:file:bg-slate-300 cursor-pointer"
                                @change="onResumeChange"
                            />
                            <p class="text-slate-600 text-xs">
                                Accepted formats: PDF, DOC, DOCX (Max size: 5MB)
                            </p>
                            <p v-if="resumeError" class="text-red-600 text-xs">{{ resumeError }}</p>
                        </div>
                    </UFormField>

                    <UButton
                        type="submit"
                        size="xl"
                        class="w-full d-flex justify-center cursor-pointer"
                        :loading="submitting"
                    >
                        Submit Application
                    </UButton>
                </UForm>
            </template>
        </div>
    </div>
</template>

<style scoped>
/* Input focus: same blue as Submit Application button (primary) */
:deep(input:focus),
:deep(button[role="combobox"]:focus) {
    border: 2px solid #3b82f6 !important;
    outline: none !important;
    box-shadow: none !important;
}
:deep([data-slot="input"]:focus-within),
:deep([data-slot="input"]:focus-within > *) {
    border: 2px solid #3b82f6 !important;
    outline: none !important;
    box-shadow: 0 0 0 0 transparent !important;
    --tw-ring-shadow: 0 0 0 0 transparent !important;
    --tw-ring-color: transparent !important;
}

/* Fade transition for loader overlay */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>

<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import type { Job } from '~/types/interview'

const INTERVIEW_API_BASE = 'https://ai-interviewer-py.onrender.com/'
const MAX_RESUME_BYTES = 5 * 1024 * 1024 // 5MB
const ACCEPTED_RESUME_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

definePageMeta({
    layout: false,
})

const route = useRoute()
const toast = useToast()
const { isLoading: isPageLoading } = useGlobalLoader()

const token = computed(() => (route.params.id as string)?.trim() || '')

// Invite data (email from token)
const inviteEmail = ref<string | null>(null)
const inviteLoading = ref(true)
const inviteError = ref(false)

// Jobs for position dropdown
const jobs = ref<Job[]>([])
const jobOptions = computed(() =>
    jobs.value
        .filter((j) => j.status === 'open')
        .map((j) => ({ value: j.id, label: j.title }))
)

// Form state
const state = reactive({
    email: '',
    full_name: '',
    phone: '',
    job_id: '' as string,
    resume: null as File | null,
})

const resumeInputRef = ref<HTMLInputElement | null>(null)
const resumeError = ref('')
const submitting = ref(false)

const applySchema = z.object({
    email: z.string().email(),
    full_name: z.string().min(1, 'Full name is required'),
    phone: z.string().length(10, 'Phone must be 10 digits').optional().or(z.literal('')),
    job_id: z.string().min(1, 'Please select a position'),
})

type ApplySchema = z.output<typeof applySchema>

// Validate resume file separately (not in zod for File type)
function validateResume(file: File | null): boolean {
    resumeError.value = ''
    if (!file) {
        resumeError.value = 'Resume is required'
        return false
    }
    if (file.size > MAX_RESUME_BYTES) {
        resumeError.value = 'File size must be 5MB or less'
        return false
    }
    if (!ACCEPTED_RESUME_TYPES.includes(file.type)) {
        resumeError.value = 'Accepted formats: PDF, DOC, DOCX'
        return false
    }
    return true
}

function onResumeChange(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0] ?? null
    state.resume = file
    validateResume(file)
}

const handleNumericKeyPress = (e: KeyboardEvent) => {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter']
    const isNumber = /^[0-9]$/.test(e.key)
    if (!isNumber && !allowedKeys.includes(e.key)) {
        e.preventDefault()
    }
}

const handlePhoneInput = (e: Event) => {
    const target = e.target as HTMLInputElement
    const digitsOnly = target.value.replace(/\D+/g, '').slice(0, 10)
    if (digitsOnly !== state.phone) state.phone = digitsOnly
}

// Fetch invite by token (backend: validate token and return email)
async function fetchInviteByToken() {
    if (!token.value) {
        inviteLoading.value = false
        return
    }
    inviteLoading.value = true
    inviteError.value = false
    try {
        const data = await useInterviewApi<{ email?: string; expired?: boolean; used?: boolean; already_used?: boolean; valid?: boolean }>('/api/apply/validate', {
            method: 'GET',
            params: { token: token.value },
        })
        const isExpiredOrUsed = data.expired === true || data.used === true || data.already_used === true || data.valid === false
        if (isExpiredOrUsed || !data.email) {
            inviteError.value = true
        } else {
            inviteEmail.value = data.email
            state.email = data.email
        }
    } catch {
        inviteError.value = true
    } finally {
        inviteLoading.value = false
    }
}

// Fetch open jobs for position dropdown
async function fetchJobs() {
    try {
        const list = await useInterviewApi<Job[]>('/api/jobs')
        jobs.value = Array.isArray(list) ? list : []
    } catch {
        jobs.value = []
    }
}

async function onSubmit(event: FormSubmitEvent<ApplySchema>) {
    if (!validateResume(state.resume)) return
    if (!token.value) return

    submitting.value = true
    try {
        const formData = new FormData()
        formData.append('token_form', token.value)
        formData.append('name', state.full_name)
        formData.append('email', state.email)
        formData.append('job_id', state.job_id)
        if (state.phone?.trim()) formData.append('phone', state.phone.trim())
        if (state.resume) formData.append('resume', state.resume)

        await $fetch('/api/apply/submit', {
            baseURL: INTERVIEW_API_BASE,
            method: 'POST',
            body: formData,
        })

        toast.add({
            title: 'Application submitted',
            description: 'Thank you for applying. We will be in touch soon.',
            color: 'success',
        })

        state.full_name = ''
        state.phone = ''
        state.job_id = ''
        state.resume = null
        if (resumeInputRef.value) resumeInputRef.value.value = ''
        resumeError.value = ''
    } catch (err: any) {
        const message = err?.data?.message || err?.message || 'Failed to submit application'
        toast.add({
            title: 'Error',
            description: message,
            color: 'error',
        })
    } finally {
        submitting.value = false
    }
}

onMounted(() => {
    if (token.value) {
        fetchInviteByToken()
        fetchJobs()
    } else {
        inviteLoading.value = false
    }
})

watch(token, (t) => {
    if (t) {
        inviteError.value = false
        inviteLoading.value = true
        fetchInviteByToken()
        fetchJobs()
    } else {
        inviteLoading.value = false
    }
})
</script>
