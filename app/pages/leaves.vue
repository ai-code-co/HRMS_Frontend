<template>
    <div class="min-h-screen bg-[#F8FAFC]">
        <main class="max-w-7xl mx-auto p-0 sm:p-6 space-y-10">
            <div class="flex justify-between items-end">
                <div>
                    <h2 class="text-2xl font-bold">Leave Overview</h2>
                    <p class="text-sm text-slate-500">Manage your allocations</p>
                </div>
                <div class="flex items-center gap-3">
                    <!-- Employee Leave Overview Button (Admin/HR only) -->
                    <UButton v-if="isSuperUser && !isViewingOther" icon="i-lucide-users"
                        label="Leave Overview" size="lg" color="primary" variant="soft"
                        class="hidden sm:flex rounded-lg cursor-pointer" @click="isBalancesModalOpen = true" />
                    <!-- Pending Approvals Button (Admin/HR only) -->
                    <UButton v-if="isSuperUser && !isViewingOther" icon="i-lucide-inbox"
                        :label="`Pending (${pendingLeaveCount})`" size="lg" color="warning" variant="soft"
                        class="hidden sm:flex rounded-lg cursor-pointer" @click="isPendingModalOpen = true" />
                    <UButton v-if="!isViewingOther" icon="i-lucide-plus" size="md"
                        class="hidden sm:flex rounded-lg cursor-pointer" @click="isApplyModalOpen = true"
                        title="Apply Leave" />
                </div>
                <!-- Mobile: Employee Leave Overview FAB for Admin -->
                <UButton v-if="isSuperUser && !isViewingOther" icon="i-lucide-users" size="xl" color="primary"
                    class="sm:hidden fixed bottom-34 right-6 rounded-full shadow-lg z-50"
                    @click="isBalancesModalOpen = true" />
                <!-- Mobile: Pending Approvals FAB for Admin -->
                <UButton v-if="isSuperUser && !isViewingOther" icon="i-lucide-inbox" size="xl" color="warning"
                    class="sm:hidden fixed bottom-20 right-6 rounded-full shadow-lg z-50"
                    @click="isPendingModalOpen = true">
                    <UBadge v-if="pendingLeaveCount > 0" color="error" size="xs"
                        class="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center">
                        {{ pendingLeaveCount }}
                    </UBadge>
                </UButton>
                <UButton v-if="!isViewingOther" icon="i-lucide-plus" size="md"
                    class="sm:hidden fixed bottom-6 right-6 rounded-full shadow-lg z-50"
                    @click="isApplyModalOpen = true" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div v-for="b in balances" :key="b.type"
                    class="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                    <div class="flex flex-col gap-4">
                        <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100"
                            :class="`text-${b.color}-600 bg-${b.color}-50`">
                            <UIcon :name="b.icon" />
                        </div>
                        <div>
                            <p class="text-[10px] font-bold uppercase text-slate-400">{{ b.type }}</p>
                            <div class="flex items-end gap-2">
                                <span class="text-2xl font-black">{{ b.available }}</span>
                                <span class="text-xs text-slate-400">/ {{ b.total }} Left</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <section class="space-y-4">
                <div
                    class="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0 justify-between">
                    <h3 class="font-bold">Application History</h3>
                    <div
                        class="flex flex-wrap items-center gap-0 sm:gap-1.5 bg-slate-100/60 p-1 rounded-xl w-full md:w-fit border border-slate-200">
                        <UButton v-for="f in ['All', 'Approved', 'Pending', 'Rejected', 'Cancelled']" :key="f" size="xs"
                            variant="ghost" :class="[
                                'px-3 sm:px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer',
                                activeFilter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'
                            ]" @click="activeFilter = f">
                            {{ f }}
                        </UButton>
                    </div>
                </div>

                <div v-if="loading" class="space-y-3">
                    <USkeleton v-for="i in 3" :key="i" class="h-20 w-full rounded-2xl" />
                </div>
                <div v-else-if="filteredRequests.length === 0"
                    class="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                    <UIcon name="i-lucide-inbox" class="text-3xl mb-2" />
                    <p class="text-sm font-medium">No {{ activeFilter.toLowerCase() }} Leaves found</p>
                </div>

                <div v-else class="space-y-3">
                    <div v-for="r in filteredRequests" :key="r.id" @click="openLeaveDetails(r)"
                        class="bg-white border border-slate-200 p-5 rounded-[1.5rem] flex justify-between items-center cursor-pointer transition-all hover:border-indigo-300 hover:shadow-md">
                        <div>
                            <p class="font-bold text-sm">{{ r.type }}</p>
                            <p class="text-xs text-slate-400">{{ r.startDate }} — {{ r.endDate }}</p>
                        </div>
                        <div class="flex gap-2">
                            <!-- Desktop/Tablet: Full Badge -->
                            <UBadge v-if="r.doc_link_url" color="info" variant="soft" size="xs" icon="lucide:file-check"
                                class="justify-end px-4 rounded-full hidden sm:flex">
                                Document Uploaded
                            </UBadge>

                            <!-- Mobile: Icon Only -->
                            <div v-if="r.doc_link_url"
                                class="flex sm:hidden items-center justify-center w-6 h-6 rounded-full bg-blue-100">
                                <UIcon name="i-lucide-file-check" class="w-4 h-4 text-blue-600" />
                            </div>

                            <!-- Desktop/Tablet: Full Status Badge -->
                            <UBadge :class="{
                                'bg-emerald-50 text-emerald-600': r.status === 'approved',
                                'bg-amber-50 text-amber-600': r.status === 'pending',
                                'bg-rose-50 text-rose-600': r.status === 'rejected' || r.status === 'cancelled',
                            }" class="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase hidden sm:block">
                                {{ r.status }}
                            </UBadge>

                            <!-- Mobile: Status Dot -->
                            <div class="flex sm:hidden items-center gap-2">
                                <div :class="{
                                    'bg-emerald-500': r.status === 'approved',
                                    'bg-amber-500': r.status === 'pending',
                                    'bg-rose-500': r.status === 'rejected' || r.status === 'cancelled',
                                }" class="w-2 h-2 rounded-full"></div>
                            </div>

                            <UButton v-if="r.status === 'pending' && !isViewingOther" @click.stop="cancelLeave(r.id)"
                                class="cursor-pointer rounded-full px-1.5 sm:px-2.5" color="error">
                                <UIcon name="i-lucide-x" />
                            </UButton>
                        </div>
                    </div>
                </div>
            </section>
            <LeaveModalApplyLeave v-model:open="isApplyModalOpen" class="w-full" />
            <LeaveModalViewLeave v-model:open="isViewModalOpen" :leave="selectedLeave" @cancel="handleLeaveCancel"
                class="w-full" />

            <!-- Pending Approvals Modal (Admin/HR only) -->
            <LeaveModalPendingApprovals v-if="isSuperUser" v-model:open="isPendingModalOpen" />

            <!-- Employee Leave Balances Modal (Admin/HR only) -->
            <LeaveModalEmployeeBalances v-if="isSuperUser" v-model:open="isBalancesModalOpen" />
        </main>
    </div>
</template>

<script setup lang="ts">
import { useLeaveStore } from '~/stores/leaves'
import { storeToRefs } from 'pinia'
import type { PendingLeaveRequestAPI } from '~/types/leaves'

const leaveStore = useLeaveStore()
const { loading, leaveBalances, leaveRequests, pendingLeaveCount } = storeToRefs(leaveStore)
const isApplyModalOpen = ref(false)
const isViewModalOpen = ref(false)
const isPendingModalOpen = ref(false)
const isBalancesModalOpen = ref(false)
const selectedLeave = ref<any>(null)
const { selectedEmployeeId, isViewingOther } = useEmployeeContext()
const { isSuperUser } = useRoleAccess()
const hasInitialized = ref(false)


// Fetch data - always fetch personal leaves, plus pending leaves for admins
const { data: leaveData } = await useAsyncData('leave-data', async () => {
    const showLoader = hasInitialized.value
    hasInitialized.value = true

    // Fetch personal leaves (or selected employee's leaves)
    const [requests, balances] = await Promise.all([
        leaveStore.fetchLeaves(showLoader, selectedEmployeeId.value),
        leaveStore.fetchLeaveBalances(showLoader, selectedEmployeeId.value)
    ])

    // For superusers, also fetch pending leaves
    let pendingRequests: PendingLeaveRequestAPI[] = []
    if (isSuperUser.value && !selectedEmployeeId.value) {
        pendingRequests = await leaveStore.fetchPendingLeaves()
    }

    return { requests, balances, pendingRequests }
}, {
    watch: [selectedEmployeeId]
})

// Hydrate store when data is available
watch(leaveData, (data) => {
    if (data) {
        leaveStore.setLeaveData(data.requests, data.balances, data.pendingRequests)
    }
}, { immediate: true })

// Fetch pending leaves on client-side for superusers (auth state may not be available during SSR)
onMounted(async () => {
    if (isSuperUser.value && !selectedEmployeeId.value && pendingLeaveCount.value === 0) {
        await leaveStore.fetchPendingLeaves()
    }
})

// UI configuration for leave types
const leaveTypeConfig: Record<string, { icon: string; color: string }> = {
    'Annual Leave': { icon: 'i-lucide-calendar', color: 'indigo' },
    'Sick Leave': { icon: 'i-lucide-thermometer', color: 'rose' },
    'Casual Leave': { icon: 'i-lucide-coffee', color: 'amber' },
    'Maternity Leave': { icon: 'i-lucide-baby', color: 'emerald' },
}

// Transform balances for UI
const balances = computed(() => {
    return Object.entries(leaveBalances.value).map(([type, data]: [string, any]) => ({
        type,
        total: data.allocated + (data.carried_forward || 0),
        used: data.used,
        available: data.available,
        icon: leaveTypeConfig[type]?.icon || 'i-lucide-info',
        color: leaveTypeConfig[type]?.color || 'blue'
    }))
})

// Transform requests for UI
const requests = computed(() => {
    return leaveRequests.value.map(r => ({
        id: r.id,
        type: r.leave_type,
        startDate: r.from_date,
        endDate: r.to_date,
        duration: `${r.no_of_days} Days`,
        status: r.status.toLowerCase() as import('~/types/leaves').LeaveStatus,
        appliedDate: r.created_at,
        reason: r.reason,
        doc_link_url: r.doc_link_url,
    }))
})

const activeFilter = ref('All')
const filteredRequests = computed(() =>
    activeFilter.value === 'All'
        ? requests.value
        : requests.value.filter(r => r.status === activeFilter.value.toLowerCase())
)

const cancelLeave = async (id: number) => {
    await leaveStore.updateLeave(id, 'Cancelled')
}

const openLeaveDetails = (leave: any) => {
    selectedLeave.value = leave
    isViewModalOpen.value = true
}

const handleLeaveCancel = async (id: number) => {
    const status = 'Cancelled'
    await leaveStore.updateLeave(id, status)
    selectedLeave.value = null
}
</script>
