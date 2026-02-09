<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useEmployeeStore } from '~/stores/employee'

const employeeStore = useEmployeeStore()
const { employee } = storeToRefs(employeeStore)

type DocumentItem = {
    id: string | number
    name: string
    type: string
    url?: string
    uploadedAt?: string
}

const rawDocuments = computed(() => {
    const data = (employee.value as any)?.documents
        ?? (employee.value as any)?.employee_documents
        ?? (employee.value as any)?.doc_links
        ?? []
    return Array.isArray(data) ? data : []
})

const documents = computed<DocumentItem[]>(() => {
    return rawDocuments.value.map((doc: any, index: number) => ({
        id: doc.id ?? `${index}`,
        name: doc.name ?? doc.document_name ?? doc.title ?? 'Document',
        type: doc.type ?? doc.document_type ?? doc.doc_type ?? 'Other',
        url: doc.url ?? doc.link ?? doc.file_url ?? doc.document_url ?? doc.path ?? '',
        uploadedAt: doc.uploaded_at ?? doc.created_at ?? ''
    }))
})

const formatDate = (value?: string) => {
    if (!value) return ''
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return ''
    return parsed.toLocaleDateString()
}
</script>

<template>
    <section class="w-full max-w-5xl space-y-4">
        <div class="flex items-center justify-between">
            <div>
                <h4 class="text-lg font-bold text-slate-800">Uploaded Documents</h4>
                <p class="text-xs text-slate-500">View documents uploaded for your profile.</p>
            </div>
            <span class="text-xs text-slate-400">{{ documents.length }} total</span>
        </div>

        <div v-if="documents.length === 0"
            class="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
                <UIcon name="i-heroicons-document-text" class="h-6 w-6 text-slate-400" />
            </div>
            <p class="text-sm font-semibold text-slate-700">No documents uploaded yet</p>
            <p class="text-xs text-slate-500">Uploaded documents will appear here.</p>
        </div>

        <div v-else class="space-y-3">
            <div v-for="doc in documents" :key="doc.id"
                class="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                <div class="flex items-start gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                        <UIcon name="i-heroicons-document-text" class="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <p class="text-sm font-semibold text-slate-800">{{ doc.name }}</p>
                        <p class="text-xs text-slate-500">
                            <span class="mr-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                                {{ doc.type }}
                            </span>
                            <span v-if="formatDate(doc.uploadedAt)" class="text-slate-400">
                                Uploaded {{ formatDate(doc.uploadedAt) }}
                            </span>
                        </p>
                    </div>
                </div>

                <div class="flex items-center gap-2">
                    <UButton v-if="doc.url" :to="doc.url" target="_blank" size="sm" color="primary" variant="soft"
                        icon="i-heroicons-arrow-top-right-on-square" class="cursor-pointer">
                        Open
                    </UButton>
                    <UButton v-else size="sm" color="neutral" variant="ghost" disabled>
                        No file
                    </UButton>
                </div>
            </div>
        </div>
    </section>
</template>
