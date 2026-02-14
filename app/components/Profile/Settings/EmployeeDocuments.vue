<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useEmployeeStore } from '~/stores/employee'
import {
    DOCUMENT_TYPE_OPTIONS,
    REQUIRED_DOCUMENT_TYPES,
    formatFileSize,
    getDocumentLabel,
    normalizeDocumentType,
} from '~/utils/employeeDocuments'

const employeeStore = useEmployeeStore()
const { employee, employeeDocuments, documentsLoading } = storeToRefs(employeeStore)
const { selectedEmployeeId } = useEmployeeContext()

type DocumentItem = {
    id: string | number
    name: string
    type: string
    url?: string
    uploadedAt?: string
    publicId?: string
    resourceType?: string
}

const documentTypeOptions = DOCUMENT_TYPE_OPTIONS
const requiredDocumentTypes = REQUIRED_DOCUMENT_TYPES

const rawDocuments = computed(() => {
    const listFromApi = employeeDocuments.value
    if (Array.isArray(listFromApi) && listFromApi.length > 0) {
        return listFromApi
    }
    const emp = employee.value
    const data = emp?.documents
        ?? (emp as any)?.employee_documents
        ?? (emp as any)?.doc_links
        ?? []
    return Array.isArray(data) ? data : []
})

const documents = computed<DocumentItem[]>(() => {
    return rawDocuments.value.map((doc: any, index: number) => ({
        id: doc.id ?? doc.document_id ?? doc.pk ?? doc.documentId ?? doc.doc_id ?? `${index}`,
        name: doc.name ?? doc.document_name ?? doc.title ?? 'Document',
        type: normalizeDocumentType(doc.type ?? doc.document_type ?? doc.doc_type ?? 'Other'),
        url: doc.url ?? doc.link ?? doc.file_url ?? doc.document_url ?? doc.path ?? '',
        uploadedAt: doc.uploaded_at ?? doc.created_at ?? '',
        publicId: doc.public_id,
        resourceType: doc.resource_type,
    }))
})

const formatDate = (value?: string) => {
    if (!value) return ''
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return ''
    return parsed.toLocaleDateString()
}

watch(
    () => employee.value?.id,
    (id) => {
        if (!id) return
        employeeStore.fetchEmployeeDocuments(id)
    },
    { immediate: true }
)

const uploadedDocumentTypes = computed(() =>
    documents.value.map(doc => normalizeDocumentType(doc.type))
)

const requiredDocumentsUploadedCount = computed(() =>
    REQUIRED_DOCUMENT_TYPES.filter(type => uploadedDocumentTypes.value.includes(type)).length
)

const isDocumentUploaded = (type: string) => uploadedDocumentTypes.value.includes(type)

const selectedUploadedType = ref<string | null>(null)
const selectedUploadedDocument = computed(() => {
    if (!selectedUploadedType.value) return null
    return documents.value.find(doc => normalizeDocumentType(doc.type) === selectedUploadedType.value) ?? null
})

const isImageUrl = (url: string) => {
    const clean = url.split('?')[0].toLowerCase()
    return ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'].some(ext => clean.endsWith(ext))
}

const getFileIcon = (doc: { url?: string }) => {
    if (doc.url && isImageUrl(doc.url)) return 'i-heroicons-photo'
    return 'i-heroicons-document'
}

const selectedDocumentType = ref('')
const pendingFile = ref<File | null>(null)
const pendingPreviewUrl = ref<string | null>(null)
const pendingIsImage = ref(false)
const documentInputKey = ref(0)
const isUploading = ref(false)
const viewModalOpen = ref(false)
const viewFileUrl = ref<string | null>(null)
const viewFileIsImage = ref(false)
const deleteDialogOpen = ref(false)
const docToDelete = ref<DocumentItem | null>(null)
const isDeleting = ref(false)

const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0] ?? null
    if (pendingPreviewUrl.value) {
        URL.revokeObjectURL(pendingPreviewUrl.value)
        pendingPreviewUrl.value = null
    }
    pendingFile.value = file
    if (file) {
        pendingIsImage.value = file.type.startsWith('image/')
        pendingPreviewUrl.value = pendingIsImage.value ? URL.createObjectURL(file) : null
    } else {
        pendingIsImage.value = false
    }
}

const resetUploadState = () => {
    if (pendingPreviewUrl.value) {
        URL.revokeObjectURL(pendingPreviewUrl.value)
        pendingPreviewUrl.value = null
    }
    selectedDocumentType.value = ''
    pendingFile.value = null
    pendingIsImage.value = false
    documentInputKey.value += 1
}

const hidePendingPreview = () => {
    resetUploadState()
}

const hideSelectedPreview = () => {
    selectedUploadedType.value = null
}

const openViewDocument = (doc: { file: File }) => {
    if (viewFileUrl.value && viewFileUrl.value.startsWith('blob:')) {
        URL.revokeObjectURL(viewFileUrl.value)
    }
    viewFileUrl.value = URL.createObjectURL(doc.file)
    viewFileIsImage.value = doc.file.type.startsWith('image/')
    viewModalOpen.value = true
}

const openViewDocumentFromUrl = (url: string) => {
    if (viewFileUrl.value && viewFileUrl.value.startsWith('blob:')) {
        URL.revokeObjectURL(viewFileUrl.value)
    }
    viewFileUrl.value = url
    viewFileIsImage.value = isImageUrl(url)
    viewModalOpen.value = true
}

const closeViewDocument = () => {
    viewModalOpen.value = false
    if (viewFileUrl.value && viewFileUrl.value.startsWith('blob:')) {
        URL.revokeObjectURL(viewFileUrl.value)
    }
    viewFileUrl.value = null
    viewFileIsImage.value = false
}

const requestDeleteDocument = (doc: DocumentItem) => {
    docToDelete.value = doc
    deleteDialogOpen.value = true
}

const cancelDeleteDocument = () => {
    docToDelete.value = null
}

const confirmDeleteDocument = async () => {
    if (!docToDelete.value || isDeleting.value) return
    const toast = useToast()
    const documentId = docToDelete.value.id
    if (documentId === undefined || documentId === null || documentId === '') {
        toast.add({ title: 'Cannot delete', description: 'Document id is missing', color: 'error' })
        return
    }
    isDeleting.value = true
    try {
        await employeeStore.deleteEmployeeDocument(documentId)
        deleteDialogOpen.value = false
        docToDelete.value = null
    } catch {
        // error already handled by store
    } finally {
        isDeleting.value = false
    }
}

const viewDocument = (doc: DocumentItem) => {
    if (!doc.url) return
    openViewDocumentFromUrl(doc.url)
}


const uploadDocument = async () => {
    const toast = useToast()
    const normalizedType = normalizeDocumentType(selectedDocumentType.value)
    if (!normalizedType) {
        toast.add({ title: 'Select document type', description: 'Please choose a document type', color: 'error' })
        return
    }
    if (!pendingFile.value) {
        toast.add({ title: 'Select a file', description: 'Please choose a file to upload', color: 'error' })
        return
    }
    if (isUploading.value) return

    isUploading.value = true
    try {
        const uploadResponse = await employeeStore.uploadEmployeeFile(pendingFile.value)
        await employeeStore.updatePersonalDetails(
            {
                documents: [{
                    document_type: normalizedType,
                    document_name: pendingFile.value.name,
                    document_url: uploadResponse.url,
                    public_id: uploadResponse.public_id,
                    resource_type: uploadResponse.resource_type,
                }],
            },
            selectedEmployeeId.value ?? undefined
        )
        toast.add({ title: 'Uploaded', description: 'Document uploaded successfully', color: 'success' })
        resetUploadState()
    } catch {
        // error already handled by store
    } finally {
        isUploading.value = false
    }
}
</script>

<template>
    <section class="w-full max-w-5xl space-y-6">
        <div class="min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div class="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
                <div class="min-w-0 space-y-4">
                    <div>
                        <p class="text-xs font-semibold text-slate-500 mb-2">Document Type</p>
                        <USelectMenu v-model="selectedDocumentType" :items="documentTypeOptions" size="lg"
                            placeholder="Select document type" color="secondary" variant="outline"
                            class="w-full" value-key="value" />
                    </div>
                    <div>
                        <p class="text-xs font-semibold text-slate-500 mb-2">Upload Document</p>
                        <UInput :key="documentInputKey" type="file" icon="i-heroicons-paper-clip"
                            accept=".pdf,.doc,.docx,image/*" @change="handleFileChange"
                            size="lg" color="secondary" variant="outline" class="w-full" />
                        <p class="mt-1 text-[11px] text-slate-400">PDF, DOC, DOCX, JPG, PNG</p>
                        <div v-if="pendingFile" class="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                            <div v-if="pendingIsImage && pendingPreviewUrl"
                                class="mb-3 rounded-lg border border-slate-200 bg-white p-3">
                                <p class="text-xs font-semibold uppercase text-slate-500 mb-2">Preview</p>
                                <div class="relative overflow-hidden rounded-md border border-slate-200 bg-black">
                                    <img :src="pendingPreviewUrl" :alt="pendingFile.name"
                                        class="h-40 w-full object-contain bg-black" />
                                    <button type="button"
                                        class="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md"
                                        @click="hidePendingPreview">
                                        <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <UIcon :name="pendingIsImage ? 'i-heroicons-photo' : 'i-heroicons-document'"
                                        class="h-5 w-5 text-slate-500" />
                                    <div>
                                        <p class="text-sm font-semibold text-slate-700">
                                            {{ pendingFile.name }}
                                        </p>
                                        <p class="text-xs text-slate-500">
                                            {{ formatFileSize(pendingFile.size) }}
                                        </p>
                                    </div>
                                </div>
                                <div v-if="!pendingIsImage" class="flex items-center gap-2">
                                    <button type="button"
                                        class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600"
                                        @click="pendingFile && openViewDocument({ file: pendingFile })">
                                        <UIcon name="i-heroicons-eye" class="h-4 w-4" />
                                    </button>
                                    <button type="button"
                                        class="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600"
                                        @click="hidePendingPreview">
                                        <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div class="mt-3 flex items-center justify-end">
                                <UButton color="primary" size="sm" class="cursor-pointer" :loading="isUploading"
                                    :disabled="isUploading" @click="uploadDocument">
                                    {{ isUploading ? 'Uploading...' : 'Upload Document' }}
                                </UButton>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="min-w-0 h-60 rounded-xl border border-slate-200 bg-white p-4 flex flex-col overflow-hidden">
                    <div class="mb-3 flex shrink-0 min-w-0 items-center justify-between gap-2">
                        <p class="text-sm font-semibold text-slate-700">Required Documents</p>
                    </div>
                    <div class="min-h-0 min-w-0 flex-1 space-y-2 overflow-y-auto rounded-b-lg pl-0.5 pr-2 pb-2 pt-0.5">
                        <button v-for="(docType, index) in documentTypeOptions" :key="docType.value" type="button"
                            class="flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-left transition"
                            :class="[
                                isDocumentUploaded(docType.value) ? 'cursor-pointer' : 'cursor-default',
                                selectedUploadedType === docType.value
                                    ? 'bg-indigo-50 ring-1 ring-indigo-200'
                                    : 'hover:bg-slate-50'
                            ]"
                            @click="isDocumentUploaded(docType.value) && (selectedUploadedType = docType.value)">
                            <div class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
                                :class="isDocumentUploaded(docType.value)
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-100 text-slate-400'">
                                <UIcon v-if="isDocumentUploaded(docType.value)" name="i-heroicons-check" class="h-4 w-4" />
                                <span v-else>{{ index + 1 }}</span>
                            </div>
                            <div class="flex items-center gap-1">
                                <p class="text-sm"
                                    :class="isDocumentUploaded(docType.value) ? 'text-slate-700' : 'text-slate-400'">
                                    {{ docType.label }}
                                </p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>

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
                class="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:items-center cursor-pointer hover:border-slate-200 hover:shadow-md transition"
                @click="viewDocument(doc)">
                <div class="flex min-w-0 flex-1 items-start gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                        <UIcon :name="getFileIcon(doc)" class="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <div class="space-y-1">
                            <p class="text-xs text-slate-500">
                                <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                                    {{ getDocumentLabel(doc.type) }}
                                </span>
                            </p>
                            <p v-if="formatDate(doc.uploadedAt)" class="text-xs text-slate-400">
                                Uploaded {{ formatDate(doc.uploadedAt) }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="flex shrink-0 items-center gap-2" @click.stop>
                    <UButton size="xs" color="error" variant="soft" icon="i-heroicons-trash"
                        class="rounded-full shrink-0 cursor-pointer" aria-label="Delete document"
                        @click="requestDeleteDocument(doc)" />
                </div>
            </div>
        </div>
    </section>

    <UModal v-model:open="viewModalOpen" :overlay="true"
        :ui="{ overlay: 'bg-slate-900/40 backdrop-blur-sm', content: 'w-[95vw] sm:w-full sm:max-w-4xl h-[80vh]' }">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <h3 class="text-lg font-semibold text-slate-800">View Document</h3>
                <UButton icon="i-heroicons-x-mark" variant="ghost" class="rounded-full cursor-pointer"
                    @click="closeViewDocument" />
            </div>
        </template>
        <template #body>
            <div class="w-full h-[calc(80vh-80px)] bg-slate-100 rounded-lg overflow-hidden">
                <img v-if="viewFileUrl && viewFileIsImage" :src="viewFileUrl" alt="Preview"
                    class="w-full h-full object-contain bg-black" />
                <iframe v-else-if="viewFileUrl" :src="viewFileUrl" class="w-full h-full border-0" />
                <div v-else class="flex items-center justify-center h-full text-slate-500">
                    No file available
                </div>
            </div>
        </template>
    </UModal>

    <UIConfirmDialog
        v-model:open="deleteDialogOpen"
        title="Delete Document"
        :message="`Are you sure you want to delete '${docToDelete?.name ?? 'this document'}'? This action cannot be undone.`"
        confirm-label="Delete"
        cancel-label="Cancel"
        confirm-color="error"
        icon="i-lucide-trash-2"
        icon-bg="bg-red-100"
        icon-color="text-red-600"
        :loading="isDeleting"
        @confirm="confirmDeleteDocument"
        @cancel="cancelDeleteDocument"
    />
</template>
