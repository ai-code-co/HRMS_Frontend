<template>
    <div class="space-y-6 h-full flex flex-col">
        <p class="text-slate-500">Upload and manage policy documents here.</p>

        <div class="flex items-center gap-0.5 bg-slate-100 rounded-xl p-1 w-full sm:w-fit border border-slate-200 overflow-x-auto no-scrollbar">
            <button
                v-for="f in FILTER_OPTIONS"
                :key="f"
                type="button"
                class="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all cursor-pointer whitespace-nowrap shrink-0"
                :class="activeFilter === f
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'"
                @click="activeFilter = f"
            >
                {{ f }}
            </button>
        </div>

        <div v-if="filteredPolicies.length > 0"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-5">
            <SettingsPolicyCard v-for="p in filteredPolicies" :key="p.id" :policy="p" @view="openViewModal" @edit="openEditModal" @toggle-apply="handleToggleApply" @delete="openDeleteConfirm" />
        </div>
        <div v-else class="py-12 text-center">
            <UIcon name="i-lucide-file-question" class="size-12 text-slate-200 mb-2" />
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">No matching policies</p>
        </div>
    </div>
    <SettingsModalUploadPolicyModal v-model:open="store.uploadPolicyModalOpen" :policy="policyToEdit" @close="handleModalClose" @success="handleSuccess" class="w-full" />
    <SettingsModalViewPolicyModal v-model:open="viewModalOpen" :policy="policyToView" @close="policyToView = null" />

    <!-- Delete Confirmation Dialog -->
    <UIConfirmDialog
        v-model:open="deleteDialogOpen"
        title="Delete Policy"
        :message="`Are you sure you want to delete '${policyToDelete?.name}'? This action cannot be undone.`"
        confirm-label="Delete"
        cancel-label="Cancel"
        confirm-color="error"
        icon="i-lucide-trash-2"
        icon-bg="bg-red-100"
        icon-color="text-red-600"
        :loading="isDeleting"
        @confirm="confirmDelete"
        @cancel="cancelDelete"
    />

    <!-- Apply/Unapply Confirmation Dialog -->
    <UIConfirmDialog
        v-model:open="applyDialogOpen"
        :title="policyToToggle?.isApplied ? 'Unapply Policy' : 'Apply Policy'"
        :message="policyToToggle?.isApplied
            ? `Are you sure you want to unapply '${policyToToggle?.name}'?`
            : `Are you sure you want to apply '${policyToToggle?.name}'?`"
        :confirm-label="policyToToggle?.isApplied ? 'Unapply' : 'Apply'"
        cancel-label="Cancel"
        :confirm-color="policyToToggle?.isApplied ? 'warning' : 'primary'"
        :icon="policyToToggle?.isApplied ? 'i-lucide-x-circle' : 'i-lucide-check-circle'"
        :icon-bg="policyToToggle?.isApplied ? 'bg-yellow-100' : 'bg-green-100'"
        :icon-color="policyToToggle?.isApplied ? 'text-yellow-600' : 'text-green-600'"
        :loading="isApplying"
        @confirm="confirmToggleApply"
        @cancel="cancelToggleApply"
    />
</template>

<script setup lang="ts">
import type { PolicyItem } from './PolicyCard.vue'
import { onMounted } from 'vue'

const store = useSettingsStore()
const toast = useToast()

// Filter options
const FILTER_OPTIONS = ['All', 'Policy', 'Guideline', 'FAQ', 'Form', 'Other'] as const
type FilterType = typeof FILTER_OPTIONS[number]
const activeFilter = ref<FilterType>('All')


const policies = computed<PolicyItem[]>(() => store.policies as PolicyItem[])

const filteredPolicies = computed(() => {
    if (activeFilter.value === 'All') return policies.value
    return policies.value.filter(p => p.docType.toLowerCase() === activeFilter.value.toLowerCase())
})

onMounted(() => {
    store.fetchPolicyDocuments()
})

// View modal state
const viewModalOpen = ref(false)
const policyToView = ref<PolicyItem | null>(null)

function openViewModal(policy: PolicyItem) {
    policyToView.value = policy
    viewModalOpen.value = true
}

// Edit modal state
const policyToEdit = ref<PolicyItem | null>(null)

function openEditModal(policy: PolicyItem) {
    policyToEdit.value = policy
    store.uploadPolicyModalOpen = true
}

function handleModalClose() {
    policyToEdit.value = null
}

function handleSuccess(data?: { name: string; link?: string; docType: string }) {
    if (!data) {
        policyToEdit.value = null
        return
    }
    store.fetchPolicyDocuments()
    policyToEdit.value = null
}

// Apply/Unapply confirmation state
const applyDialogOpen = ref(false)
const policyToToggle = ref<PolicyItem | null>(null)
const isApplying = ref(false)

function handleToggleApply(policy: PolicyItem) {
    policyToToggle.value = policy
    applyDialogOpen.value = true
}

async function confirmToggleApply() {
    if (!policyToToggle.value) return

    isApplying.value = true
    try {
        const target = policyToToggle.value
        if (target.isApplied) {
            await store.unapplyPolicyDocument(target.id)
        } else {
            await store.applyPolicyDocument(target.id)
        }
        const policyItem = policies.value.find(p => p.id === target.id)
        if (policyItem) {
            toast.add({
                title: `Policy ${policyItem.isApplied ? 'Applied' : 'Unapplied'}`,
                description: `'${target.name}' has been ${policyItem.isApplied ? 'applied' : 'unapplied'}.`,
                color: policyItem.isApplied ? 'success' : 'warning'
            })
        }
        applyDialogOpen.value = false
        policyToToggle.value = null
    } catch {
        toast.add({ title: 'Failed to update policy', color: 'error' })
    } finally {
        isApplying.value = false
    }
}

function cancelToggleApply() {
    policyToToggle.value = null
}

// Delete confirmation state
const deleteDialogOpen = ref(false)
const policyToDelete = ref<PolicyItem | null>(null)
const isDeleting = ref(false)

function openDeleteConfirm(policy: PolicyItem) {
    if (policy.isApplied) {
        toast.add({
            title: 'Cannot delete applied policy',
            description: 'Unapply the policy first, then you can delete it.',
            color: 'error'
        })
        return
    }
    policyToDelete.value = policy
    deleteDialogOpen.value = true
}

async function confirmDelete() {
    if (!policyToDelete.value) return

    isDeleting.value = true
    try {
        await store.deletePolicyDocument(policyToDelete.value.id)
        toast.add({ title: `'${policyToDelete.value.name}' deleted successfully`, color: 'success' })
        policies.value = policies.value.filter(p => p.id !== policyToDelete.value?.id)
        deleteDialogOpen.value = false
        policyToDelete.value = null
    } catch {
        toast.add({ title: 'Failed to delete policy', color: 'error' })
    } finally {
        isDeleting.value = false
    }
}

function cancelDelete() {
    policyToDelete.value = null
}
</script>

