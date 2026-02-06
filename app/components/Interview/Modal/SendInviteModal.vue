<template>
    <UModal v-model:open="modelOpen" :overlay="true"
        :ui="{ overlay: 'bg-slate-900/40 backdrop-blur-sm', content: 'w-[90vw] sm:w-full sm:max-w-2xl' }" size="2xl">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <h3 class="text-lg font-semibold text-slate-800">Send Invite</h3>
                <UButton icon="i-heroicons-x-mark" variant="ghost" class="rounded-full cursor-pointer" @click="close" />
            </div>
        </template>

        <template #body>
            <UForm :schema="inviteSchema" :state="state" @submit="onSubmit" class="w-full">
                <div class="space-y-4">
                    <!-- Manual Email Inputs -->
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <label class="text-sm font-medium text-slate-700">Email Addresses</label>
                            <UButton icon="i-lucide-plus" size="xs" variant="ghost" color="primary"
                                @click="addEmailField" class="cursor-pointer">
                                Add Email
                            </UButton>
                        </div>

                        <div v-for="(email, index) in emailFields" :key="index" class="flex items-center gap-2">
                            <UFormField :name="`email_${index}`" class="w-full">
                                <UInput
                                    :model-value="emailFields[index]"
                                    type="email"
                                    size="xl"
                                    placeholder="Enter candidate email"
                                    color="secondary"
                                    variant="outline"
                                    :class="{ 'border-red-300': emailErrors[index] }"
                                    class="w-full"
                                    @update:model-value="updateEmailField(index, $event)"
                                />
                            </UFormField>
                            <UButton v-if="emailFields.length > 1" icon="i-lucide-x" size="sm" color="error" variant="ghost"
                                @click="removeEmailField(index)" class="cursor-pointer shrink-0" />
                        </div>
                    </div>

                    <!-- CSV Upload Section -->
                    <div class="border-t border-slate-200 pt-4">
                        <UFormField label="Upload CSV File" name="csvFile"
                            description="Upload a CSV file containing email addresses. Emails will be extracted and added to the list.">
                            <div v-if="!csvFile" class="relative">
                                <UInput type="file" icon="i-heroicons-paper-clip" accept=".csv" @change="handleCsvUpload"
                                    size="xl" color="secondary" variant="outline" class="cursor-pointer" />
                            </div>
                            <div v-else class="space-y-2">
                                <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <div class="flex items-center gap-2">
                                        <UIcon name="i-lucide-file-text" class="text-slate-400" />
                                        <span class="text-sm font-medium text-slate-700">{{ csvFileName }}</span>
                                    </div>
                                    <UButton icon="i-heroicons-x-mark" color="error" variant="ghost" size="xs"
                                        @click="removeCsvFile" class="cursor-pointer" />
                                </div>
                            </div>
                        </UFormField>

                        <!-- CSV Emails List -->
                        <div v-if="csvEmails.length > 0" class="mt-4 space-y-2">
                            <div class="flex items-center justify-between">
                                <p class="text-sm font-medium text-slate-700">
                                    Emails from CSV ({{ selectedCsvEmails.length }} selected)
                                </p>
                                <div class="flex gap-2">
                                    <UButton size="xs" variant="ghost" @click="selectAllCsvEmails"
                                        class="cursor-pointer text-xs">
                                        Select All
                                    </UButton>
                                    <UButton size="xs" variant="ghost" @click="deselectAllCsvEmails"
                                        class="cursor-pointer text-xs">
                                        Deselect All
                                    </UButton>
                                </div>
                            </div>
                            <div class="max-h-48 overflow-y-auto space-y-2 border border-slate-200 rounded-lg p-3">
                                <div v-for="(email, index) in csvEmails" :key="index"
                                    class="flex items-center gap-2 p-2 rounded hover:bg-slate-50 transition-colors">
                                    <input type="checkbox" :id="`csv-email-${index}`" v-model="selectedCsvEmails"
                                        :value="email"
                                        class="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer" />
                                    <label :for="`csv-email-${index}`" class="flex-1 text-sm text-slate-700 cursor-pointer">
                                        {{ email }}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Total Emails Summary -->
                    <div v-if="totalEmailsCount > 0" class="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                        <p class="text-sm font-medium text-indigo-700">
                            Total emails to send: <span class="font-bold">{{ totalEmailsCount }}</span>
                        </p>
                    </div>
                </div>

                <UButton type="submit" block size="xl" :loading="interviewStore.loading" :disabled="totalEmailsCount === 0"
                    class="mt-6">
                    Send Invite{{ totalEmailsCount > 1 ? 's' : '' }} ({{ totalEmailsCount }})
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
import type { InvitePayload } from '~/types/interview'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits(['update:open', 'close'])

const interviewStore = useInterviewStore()
const toast = useToast()

const emailFields = ref<string[]>([''])
const emailErrors = ref<Record<number, boolean>>({})
const csvFile = ref<File | null>(null)
const csvFileName = ref('')
const csvEmails = ref<string[]>([])
const selectedCsvEmails = ref<string[]>([])

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const inviteSchema = z.object({
    emails: z.array(z.string().email('Invalid email address')).min(1, 'At least one email is required')
})

type InviteFormSchema = z.output<typeof inviteSchema>

const modelOpen = computed({
    get: () => props.open,
    set: (value: boolean) => emit('update:open', value)
})

// Get all valid emails
const getAllValidEmails = (): string[] => {
    const validManualEmails = emailFields.value
        .filter(email => email.trim() && emailRegex.test(email.trim()))
        .map(email => email.trim())
    return [...validManualEmails, ...selectedCsvEmails.value]
}

// Computed total emails count (depends on emailFields so it updates when fields change)
const totalEmailsCount = computed(() => {
    return getAllValidEmails().length
})

// State for form validation - sync with actual emails
const state = ref({
    emails: [] as string[]
})

// Watch email fields and CSV selections to update state
watch([emailFields, selectedCsvEmails], () => {
    state.value.emails = getAllValidEmails()
}, { deep: true, immediate: true })

const addEmailField = () => {
    emailFields.value = [...emailFields.value, '']
}

const updateEmailField = (index: number, value: string) => {
    const next = [...emailFields.value]
    next[index] = value
    emailFields.value = next
}

const removeEmailField = (index: number) => {
    if (emailFields.value.length > 1) {
        emailFields.value = emailFields.value.filter((_, i) => i !== index)
        const nextErrors = { ...emailErrors.value }
        delete nextErrors[index]
        emailErrors.value = nextErrors
    }
}

const handleCsvUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    if (!file) return

    if (!file.name.endsWith('.csv')) {
        toast.add({
            title: 'Error',
            description: 'Please upload a CSV file',
            color: 'error'
        })
        return
    }

    csvFile.value = file
    csvFileName.value = file.name

    try {
        const text = await file.text()
        const emails = parseCsvEmails(text)
        
        if (emails.length === 0) {
            toast.add({
                title: 'Warning',
                description: 'No valid emails found in the CSV file',
                color: 'warning'
            })
            return
        }

        csvEmails.value = emails
        selectedCsvEmails.value = [...emails] // Select all by default

        toast.add({
            title: 'Success',
            description: `Found ${emails.length} email(s) in CSV file`,
            color: 'success'
        })
    } catch (err: any) {
        toast.add({
            title: 'Error',
            description: 'Failed to parse CSV file',
            color: 'error'
        })
        csvFile.value = null
        csvFileName.value = ''
    }
}

const parseCsvEmails = (csvText: string): string[] => {
    const emails: string[] = []
    const lines = csvText.split('\n')

    for (const line of lines) {
        const trimmedLine = line.trim()
        if (!trimmedLine) continue

        // Split by comma and handle quoted values
        const values = trimmedLine.split(',').map(v => v.trim().replace(/^"|"$/g, ''))

        for (const value of values) {
            const trimmedValue = value.trim()
            // Check if it's a valid email
            if (trimmedValue && emailRegex.test(trimmedValue)) {
                // Avoid duplicates
                if (!emails.includes(trimmedValue)) {
                    emails.push(trimmedValue)
                }
            }
        }
    }

    return emails
}

const removeCsvFile = () => {
    csvFile.value = null
    csvFileName.value = ''
    csvEmails.value = []
    selectedCsvEmails.value = []
}

const selectAllCsvEmails = () => {
    selectedCsvEmails.value = [...csvEmails.value]
}

const deselectAllCsvEmails = () => {
    selectedCsvEmails.value = []
}

watch(() => props.open, (isOpen) => {
    if (!isOpen) {
        // Reset form when modal closes
        emailFields.value = ['']
        emailErrors.value = {}
        csvFile.value = null
        csvFileName.value = ''
        csvEmails.value = []
        selectedCsvEmails.value = []
        state.value = { emails: [] }
    }
})

const close = () => {
    modelOpen.value = false
    emit('close')
}

async function onSubmit(event: FormSubmitEvent<any>) {
    try {
        const allEmails = getAllValidEmails()

        if (allEmails.length === 0) {
            toast.add({
                title: 'Error',
                description: 'Please enter at least one valid email address',
                color: 'error'
            })
            return
        }

        // Hardcoded issued_by as per requirements
        const payload: InvitePayload = {
            emails: allEmails,
            issued_by: '834a82fc-f116-4726-bcbb-5984fd113c3e'
        }

        await interviewStore.createInvite(payload)
        modelOpen.value = false
    } catch (err: any) {
        // Error is already handled in the store
    }
}
</script>
