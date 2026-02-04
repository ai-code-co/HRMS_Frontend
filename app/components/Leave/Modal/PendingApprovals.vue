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
                            <!-- Employee Info -->
                            <div class="flex items-center gap-3 min-w-0">
                                <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                    <span class="text-indigo-600 font-bold text-xs">{{ getInitials(request.employee_name) }}</span>
                                </div>
                                <div class="min-w-0">
                                    <p class="font-bold text-sm truncate">{{ request.employee_name }}</p>
                                    <p class="text-xs text-slate-400">{{ request.leave_type }}</p>
                                    <p class="text-[10px] text-slate-400">
                                        {{ formatDate(request.from_date) }} — {{ formatDate(request.to_date) }}
                                        <span class="ml-1 text-slate-500">({{ request.no_of_days }} {{ request.no_of_days === 1 ? 'day' : 'days' }})</span>
                                    </p>
                                </div>
                            </div>

                            <!-- Quick Actions -->
                            <div class="flex items-center gap-2 flex-shrink-0">
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

    <!-- Approve/Reject Confirmation Modal -->
    <LeaveModalManageLeaveAction
        v-model:open="isActionModalOpen"
        :leave="actionLeave"
        :action="actionType"
        :loading="actionLoading"
        @confirm="confirmAction"
    />
</template>

<script setup lang="ts">
import { useLeaveStore } from '~/stores/leaves'
import { storeToRefs } from 'pinia'
import type { AllLeaveRequestAPI } from '~/types/leaves'

const props = defineProps<{
    open: boolean
}>()

const emit = defineEmits(['update:open'])

const leaveStore = useLeaveStore()
const { pendingLeaveRequests: pendingRequests, loading } = storeToRefs(leaveStore)

const isViewModalOpen = ref(false)
const isActionModalOpen = ref(false)
const selectedLeave = ref<any>(null)
const actionLeave = ref<AllLeaveRequestAPI | null>(null)
const actionType = ref<'Approved' | 'Rejected'>('Approved')
const actionLoading = ref(false)

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

const close = () => {
    modelOpen.value = false
}

const getLeaveById = (id: number) => {
    return pendingRequests.value.find(r => r.id === id)
}

const openLeaveDetails = (leave: AllLeaveRequestAPI) => {
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
        employee_name: leave.employee_name,
    }
    isViewModalOpen.value = true
}

const handleAction = (leave: AllLeaveRequestAPI | undefined, action: 'Approved' | 'Rejected') => {
    if (!leave) return
    actionLeave.value = leave
    actionType.value = action
    isActionModalOpen.value = true
}

const confirmAction = async (data: { id: number; action: string; notes: string }) => {
    actionLoading.value = true
    try {
        await leaveStore.updateLeaveWithReason(data.id, data.action, data.notes)
        isActionModalOpen.value = false
        isViewModalOpen.value = false
        actionLeave.value = null
        // Refresh pending list
        await leaveStore.fetchPendingLeaves()
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

const getInitials = (name: string) => {
    if (!name) return '?'
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}
</script>
