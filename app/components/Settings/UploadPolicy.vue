<template>
    <div class="space-y-6 h-full flex flex-col">
        <p class="text-slate-500">Upload and manage policy documents here.</p>

        <div class="flex items-center gap-0.5 bg-slate-100 rounded-xl p-1 w-fit border border-slate-200">
            <button
                v-for="f in FILTER_OPTIONS"
                :key="f"
                type="button"
                class="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all cursor-pointer"
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

const store = useSettingsStore()
const toast = useToast()

// Filter options
const FILTER_OPTIONS = ['All', 'Policy', 'Guideline', 'FAQ', 'Form', 'Other'] as const
type FilterType = typeof FILTER_OPTIONS[number]
const activeFilter = ref<FilterType>('All')

const VISIBILITY_MAP: Record<string, PolicyItem['visibility']> = {
    policy: 'Policy',
    guideline: 'Guideline',
    faq: 'FAQ',
    form: 'Form',
    other: 'Other'
}

// Demo data - TODO: Replace with API call
const policies = ref<PolicyItem[]>([
    { id: '1', name: 'Leave Policy', docType: 'policy', visibility: 'Policy', date: 'Jan 05', day: 'Monday', isApplied: true, link: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: '2', name: 'Code of Conduct', docType: 'guideline', visibility: 'Guideline', date: 'Feb 12', day: 'Wednesday', isApplied: true, link: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: '3', name: 'HR Handbook', docType: 'policy', visibility: 'Policy', date: 'Mar 21', day: 'Friday', isApplied: false, link: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: '4', name: 'Privacy Policy', docType: 'policy', visibility: 'Policy', date: 'Apr 18', day: 'Thursday', isApplied: true, link: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: '5', name: 'Expense Reimbursement FAQ', docType: 'faq', visibility: 'FAQ', date: 'May 09', day: 'Saturday', isApplied: false, link: 'https://example.com/expense-faq' },
    { id: '6', name: 'Travel & Expense Policy', docType: 'policy', visibility: 'Policy', date: 'Jun 14', day: 'Friday', isApplied: true, link: 'https://example.com/travel' },
    { id: '7', name: 'Remote Work Guidelines', docType: 'guideline', visibility: 'Guideline', date: 'Jul 02', day: 'Tuesday', isApplied: false, link: 'https://example.com/remote-work' },
    { id: '8', name: 'Security Awareness FAQ', docType: 'faq', visibility: 'Policy', date: 'Aug 19', day: 'Monday', isApplied: true, link: 'https://example.com/security-faq' },
    { id: '9', name: 'IT Asset Form', docType: 'form', visibility: 'Form', date: 'Sep 07', day: 'Thursday', isApplied: false, link: 'https://forms.example.com/it-asset' },
    { id: '10', name: 'Vendor Onboarding Checklist', docType: 'other', visibility: 'Other', date: 'Oct 23', day: 'Wednesday', isApplied: true, link: 'https://example.com/vendor-checklist' },
])

const filteredPolicies = computed(() => {
    if (activeFilter.value === 'All') return policies.value
    return policies.value.filter(p => p.docType.toLowerCase() === activeFilter.value.toLowerCase())
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

    if (policyToEdit.value) {
        const index = policies.value.findIndex(p => p.id === policyToEdit.value?.id)
        if (index !== -1) {
            const current = policies.value[index]!
            policies.value[index] = { ...current, name: data.name, link: data.link, docType: data.docType, visibility: VISIBILITY_MAP[data.docType] || 'Policy' }
        }
    } else {
        policies.value.unshift({
            id: String(Date.now()),
            name: data.name,
            link: data.link,
            docType: data.docType,
            visibility: VISIBILITY_MAP[data.docType] || 'Policy',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
            day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
            isApplied: false
        })
    }
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
        await new Promise(resolve => setTimeout(resolve, 600)) // TODO: Replace with API call
        const policyItem = policies.value.find(p => p.id === policyToToggle.value?.id)
        if (policyItem) {
            policyItem.isApplied = !policyItem.isApplied
            toast.add({
                title: `Policy ${policyItem.isApplied ? 'Applied' : 'Unapplied'}`,
                description: `'${policyToToggle.value.name}' has been ${policyItem.isApplied ? 'applied' : 'unapplied'}.`,
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
        await new Promise(resolve => setTimeout(resolve, 600)) // TODO: Replace with API call
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

