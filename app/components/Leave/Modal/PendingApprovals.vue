<template>
    <UModal v-model:open="modelOpen" :overlay="true" :ui="{
        overlay: 'bg-slate-900/40 backdrop-blur-sm',
        content: 'w-[95vw] sm:w-full sm:max-w-2xl rounded-xl overflow-hidden max-h-[90vh]'
    }">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                    <div class="p-2 rounded-lg flex items-center bg-amber-100">
                        <UIcon name="i-lucide-inbox" class="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-slate-900">Pending Approvals</h3>
                        <p class="text-xs text-slate-500 font-medium">{{ pendingRequests.length }} request{{ pendingRequests.length !== 1 ? 's' : '' }} awaiting review</p>
                    </div>
                </div>
                <UButton color="secondary" variant="ghost" icon="i-heroicons-x-mark-20-solid"
                    class="-my-1 rounded-full cursor-pointer" @click="close" />
            </div>
        </template>

        <template #body>
            <div class="space-y-4 max-h-[60vh] overflow-y-auto px-1">
                <!-- Loading State -->
                <div v-if="loading" class="space-y-3">
                    <USkeleton v-for="i in 3" :key="i" class="h-24 w-full rounded-xl" />
                </div>

                <!-- Empty State -->
                <div v-else-if="pendingRequests.length === 0"
                    class="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                    <UIcon name="i-lucide-check-circle" class="text-4xl mb-3 text-emerald-400" />
                    <p class="text-sm font-medium">All caught up!</p>
                    <p class="text-xs text-slate-400 mt-1">No pending leave requests to review</p>
                </div>

                <!-- Pending Requests List -->
                <div v-else class="space-y-3">
                    <div v-for="request in pendingRequests" :key="request.id"
                        @click="openLeaveDetails(request)"
                        class="bg-white border border-slate-200 p-4 rounded-xl cursor-pointer transition-all hover:border-indigo-300 hover:shadow-md">
                        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                            <!-- Employee & Leave Info -->
                            <div class="flex items-center gap-3 min-w-0">
                                <!-- Employee Photo -->
                                <div class="w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 border-slate-100">
                                    <img v-if="request.employee_details?.photo"
                                        :src="getPhotoUrl(request.employee_details.photo)"
                                        :alt="request.employee_details.full_name"
                                        class="w-full h-full object-cover" />
                                    <div v-else class="w-full h-full bg-indigo-100 flex items-center justify-center">
                                        <span class="text-indigo-600 font-bold text-sm">{{ getInitials(request.employee_details?.full_name) }}</span>
                                    </div>
                                </div>
                                <div class="min-w-0">
                                    <!-- Employee Name -->
                                    <p class="font-bold text-sm truncate">{{ request.employee_details?.full_name }}</p>
                                    <!-- Leave Type -->
                                    <div class="flex items-center gap-2">
                                        <p class="text-xs text-slate-500">{{ request.leave_type }}</p>
                                        <UBadge v-if="request.is_restricted" color="secondary" variant="soft" size="xs" class="bg-purple-100 text-purple-700">RH</UBadge>
                                    </div>
                                    <!-- Dates -->
                                    <p class="text-[10px] text-slate-400">
                                        {{ formatDate(request.from_date) }} — {{ formatDate(request.to_date) }}
                                        <span class="text-slate-500">({{ request.no_of_days }}d, {{ request.day_status }})</span>
                                    </p>
                                </div>
                            </div>

                            <!-- Quick Actions -->
                            <div class="flex items-center gap-2 shrink-0">
                                <!-- Document indicator -->
                                <div v-if="request.doc_link_url"
                                    class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50">
                                    <UIcon name="i-lucide-file-check" class="w-4 h-4 text-blue-600" />
                                </div>
                                <UButton icon="i-lucide-check" color="success" variant="soft" size="sm"
                                    class="cursor-pointer rounded-full"
                                    @click.stop="handleAction(request, 'Approved')" />
                                <UButton icon="i-lucide-x" color="error" variant="soft" size="sm"
                                    class="cursor-pointer rounded-full"
                                    @click.stop="handleAction(request, 'Rejected')" />
                            </div>
                        </div>

                        <!-- Reason Preview -->
                        <div v-if="request.reason" class="mt-3 pt-3 border-t border-slate-100">
                            <p class="text-xs text-slate-500 line-clamp-2">
                                <span class="font-semibold">Reason:</span> {{ request.reason }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <template #footer>
            <div class="flex w-full">
                <UButton block color="neutral" variant="outline" size="lg" class="flex-1" @click="close">
                    Close
                </UButton>
            </div>
        </template>
    </UModal>

    <!-- View Leave Details Modal -->
    <LeaveModalViewLeaveAdmin
        v-model:open="isViewModalOpen"
        :leave="selectedLeave"
        @approve="(id) => handleAction(getLeaveById(id), 'Approved')"
        @reject="(id) => handleAction(getLeaveById(id), 'Rejected')"
    />

    <!-- Approve Confirmation Dialog -->
    <UIConfirmDialog
        v-model:open="isApproveDialogOpen"
        title="Approve Leave Request"
        :message="`Approve ${actionLeave?.leave_type} request for ${actionLeave?.no_of_days} day(s)?`"
        confirm-label="Approve"
        cancel-label="Cancel"
        confirm-color="success"
        icon="i-lucide-check-circle"
        icon-bg="bg-emerald-100"
        icon-color="text-emerald-600"
        :loading="actionLoading"
        @confirm="confirmApprove"
    />

    <!-- Reject Confirmation Dialog -->
    <UIConfirmDialog
        v-model:open="isRejectDialogOpen"
        title="Reject Leave Request"
        confirm-label="Reject"
        cancel-label="Cancel"
        confirm-color="error"
        icon="i-lucide-x-circle"
        icon-bg="bg-rose-100"
        icon-color="text-rose-600"
        :loading="actionLoading"
        @confirm="confirmReject"
    >
        <div class="space-y-3">
            <p class="text-sm text-slate-600">
                Reject {{ actionLeave?.leave_type }} request for {{ actionLeave?.no_of_days }} day(s)?
            </p>
            <div class="space-y-1">
                <label class="text-xs font-semibold text-slate-500 uppercase">
                    Rejection Reason <span class="text-rose-500">*</span>
                </label>
                <UTextarea
                    v-model="rejectionReason"
                    placeholder="Please provide a reason for rejection..."
                    :rows="3"
                    class="w-full"
                />
                <p v-if="showRejectError && !rejectionReason.trim()" class="text-xs text-rose-500">
                    Rejection reason is required
                </p>
            </div>
        </div>
    </UIConfirmDialog>
</template>

<script setup lang="ts">
import { useLeaveStore } from '~/stores/leaves'
import { storeToRefs } from 'pinia'
import type { PendingLeaveRequestAPI } from '~/types/leaves'

const props = defineProps<{
    open: boolean
}>()

const emit = defineEmits(['update:open'])

const leaveStore = useLeaveStore()
const { pendingLeaveRequests: pendingRequests, loading } = storeToRefs(leaveStore)

const isViewModalOpen = ref(false)
const isApproveDialogOpen = ref(false)
const isRejectDialogOpen = ref(false)
const selectedLeave = ref<any>(null)
const actionLeave = ref<PendingLeaveRequestAPI | null>(null)
const actionLoading = ref(false)
const rejectionReason = ref('')
const showRejectError = ref(false)

const modelOpen = computed({
    get: () => props.open,
    set: (value: boolean) => emit('update:open', value)
})

// Fetch pending leaves when modal opens
watch(() => props.open, async (isOpen) => {
    if (isOpen) {
        await leaveStore.fetchPendingLeaves(true)
    }
})

// Reset rejection reason when dialog closes
watch(isRejectDialogOpen, (isOpen) => {
    if (!isOpen) {
        rejectionReason.value = ''
        showRejectError.value = false
    }
})

const close = () => {
    modelOpen.value = false
}

const getLeaveById = (id: number) => {
    return pendingRequests.value.find(r => r.id === id)
}

const openLeaveDetails = (leave: PendingLeaveRequestAPI) => {
    selectedLeave.value = {
        id: leave.id,
        type: leave.leave_type,
        startDate: leave.from_date,
        endDate: leave.to_date,
        duration: `${leave.no_of_days} Days`,
        status: leave.status.toLowerCase(),
        appliedDate: leave.created_at,
        reason: leave.reason,
        doc_link_url: leave.doc_link_url,
        employee_name: leave.employee_details?.full_name || 'Employee',
        employee_photo: leave.employee_details?.photo,
        employee_id: leave.employee_details?.employee_id,
        day_status: leave.day_status,
        is_restricted: leave.is_restricted,
        restricted_holiday_details: leave.restricted_holiday_details,
    }
    isViewModalOpen.value = true
}

const handleAction = (leave: PendingLeaveRequestAPI | undefined, action: 'Approved' | 'Rejected') => {
    if (!leave) return
    actionLeave.value = leave
    // Close view modal first to prevent z-index stacking issues
    isViewModalOpen.value = false
    if (action === 'Approved') {
        isApproveDialogOpen.value = true
    } else {
        isRejectDialogOpen.value = true
    }
}

const confirmApprove = async () => {
    if (!actionLeave.value) return
    actionLoading.value = true
    try {
        await leaveStore.updateLeaveWithReason(actionLeave.value.id, 'Approved', '')
        isApproveDialogOpen.value = false
        actionLeave.value = null
    } finally {
        actionLoading.value = false
    }
}

const confirmReject = async () => {
    if (!actionLeave.value) return
    if (!rejectionReason.value.trim()) {
        showRejectError.value = true
        return
    }
    actionLoading.value = true
    try {
        await leaveStore.updateLeaveWithReason(actionLeave.value.id, 'Rejected', rejectionReason.value.trim())
        isRejectDialogOpen.value = false
        actionLeave.value = null
        rejectionReason.value = ''
    } finally {
        actionLoading.value = false
    }
}

const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const getPhotoUrl = (photo: string | null) => {
    if (!photo) return ''
    if (photo.startsWith('http')) return photo
    return `https://res.cloudinary.com/dhlyvqdoi/image/upload/${photo}`
}

const getInitials = (name: string | undefined) => {
    if (!name) return '?'
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}
</script>
