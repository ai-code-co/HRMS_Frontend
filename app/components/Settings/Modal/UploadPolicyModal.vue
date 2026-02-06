<template>
    <UModal v-model:open="modelOpen" :overlay="true"
        :ui="{ overlay: 'bg-slate-900/40 backdrop-blur-sm', content: 'w-[90vw] sm:w-full sm:max-w-2xl' }" size="2xl">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <h3 class="text-lg font-semibold text-slate-800">{{ isEditMode ? 'Edit Policy Document' : 'Add Policy Document' }}</h3>
                <UButton icon="i-heroicons-x-mark" variant="ghost" class="rounded-full cursor-pointer" @click="close" />
            </div>
        </template>

        <template #body>
            <UForm :schema="policySchema" :state="state" @submit="onSubmit" class="w-full">
                <div class="space-y-4">
                    <UFormField label="Document Name" name="document_name" class="w-full">
                        <UInput v-model="state.document_name" size="xl" placeholder="Enter document name"
                            color="secondary" variant="outline" class="w-full" />
                    </UFormField>

                    <UFormField label="Link" name="link" class="w-full">
                        <UInput v-model="state.link" size="xl" placeholder="Enter the link here..."
                            color="secondary" variant="outline" class="w-full" />
                    </UFormField>

                    <UFormField label="Document Type" name="doc_type">
                        <USelectMenu v-model="state.doc_type" :items="docTypeOptions" size="xl" value-key="value" option-attribute="label"
                            placeholder="Select document type" color="secondary" variant="outline" class="w-full" />
                    </UFormField>
                </div>

                <UButton type="submit" block size="xl" :loading="isSubmitting"
                    color="primary"
                    class="mt-6 font-bold rounded-xl cursor-pointer">
                    {{ isEditMode ? 'Update Policy' : 'Add Policy' }}
                </UButton>
            </UForm>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import type { PolicyItem } from '../PolicyCard.vue'
import { useSettingsStore } from '~/stores/settings'

const props = defineProps<{
    open: boolean
    policy?: PolicyItem | null
}>()
const emit = defineEmits(['update:open', 'close', 'success'])

const toast = useToast()
const isSubmitting = ref(false)
const isEditMode = computed(() => !!props.policy)
const settingsStore = useSettingsStore()

const policySchema = z.object({
    document_name: z.string().min(1, 'Document name is required'),
    link: z.string().url('Please enter a valid URL'),
    doc_type: z.preprocess(
        (val) => (typeof val === 'object' && val !== null && 'value' in val ? (val as { value: string }).value : val),
        z.string().min(1, 'Document type is required'),
    ),
})

type PolicyFormSchema = z.output<typeof policySchema>

const state = ref<PolicyFormSchema>({
    document_name: '',
    link: '',
    doc_type: '',
})

const docTypeOptions = [
    { label: 'Policy', value: 'policy' },
    { label: 'Guideline', value: 'guideline' },
    { label: 'FAQ', value: 'faq' },
    { label: 'Form', value: 'form' },
    { label: 'Other', value: 'other' },
]

const modelOpen = computed({
    get: () => props.open,
    set: (value: boolean) => emit('update:open', value),
})

watch(() => props.open, (isOpen) => {
    if (isOpen) {
        if (props.policy) {
            // Edit mode: pre-fill form
            state.value = {
                document_name: props.policy.name,
                link: props.policy.link || '',
                doc_type: props.policy.docType,
            }
        } else {
            // Add mode: reset form
            state.value = {
                document_name: '',
                link: '',
                doc_type: '',
            }
        }
    }
})

function close() {
    modelOpen.value = false
    emit('close')
}

async function onSubmit(event: FormSubmitEvent<PolicyFormSchema>) {
    isSubmitting.value = true
    try {
        if (!isEditMode.value) {
            await settingsStore.createPolicyDocument(event.data)
        } else {
            await settingsStore.updatePolicyDocument(props.policy?.id ?? '', event.data)
        }

        toast.add({
            title: isEditMode.value ? 'Policy document updated' : 'Policy document added',
            color: 'success'
        })

        emit('success', {
            name: event.data.document_name,
            link: event.data.link,
            docType: event.data.doc_type
        })
        close()
    } catch {
        toast.add({
            title: isEditMode.value ? 'Failed to update document' : 'Failed to add document',
            color: 'error'
        })
    } finally {
        isSubmitting.value = false
    }
}
</script>
