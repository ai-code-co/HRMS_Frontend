<template>
    <div class="min-h-screen bg-[#F8FAFC]">
        <main class="max-w-7xl mx-auto p-6 space-y-10">
            <div class="flex justify-between items-end">
                <div>
                    <h2 class="text-2xl font-bold">Leave Overview</h2>
                    <p class="text-sm text-slate-400">Manage your allocations</p>
                </div>
                <UButton icon="i-lucide-plus" size="lg" class="hidden sm:flex rounded-lg cursor-pointer"
                    @click="isApplyModalOpen = true">
                    Apply Leave
                </UButton>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div v-for="b in balances" :key="b.type"
                    class="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm">
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
                <div class="flex justify-between items-center">
                    <h3 class="font-bold">Application History</h3>
                    <div class="flex items-center gap-1.5 bg-slate-100/60 p-1 rounded-xl w-fit border border-slate-200">
                        <UButton v-for="f in ['All', 'Approved', 'Pending', 'Rejected']" :key="f" size="xs"
                            variant="ghost" :class="[
                                'px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer',
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
                    <div v-for="r in filteredRequests" :key="r.id"
                        class="bg-white border border-slate-200 p-5 rounded-[1.5rem] flex justify-between items-center">
                        <div>
                            <p class="font-bold text-sm">{{ r.type }}</p>
                            <p class="text-xs text-slate-400">{{ r.startDate }} — {{ r.endDate }}</p>
                        </div>
                        <div class="flex gap-2">
                            <div :class="{
                                'bg-emerald-50 text-emerald-600': r.status === 'approved',
                                'bg-amber-50 text-amber-600': r.status === 'pending',
                                'bg-rose-50 text-rose-600': r.status === 'rejected' || r.status === 'cancelled',
                            }" class="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase">
                                {{ r.status }}
                            </div>
                            <UButton v-if="r.status === 'pending'" @click="cancelLeave(r.id)"
                                class="cursor-pointer rounded-full" color="error">
                                <UIcon name="i-lucide-x" />
                            </UButton>
                        </div>
                    </div>
                </div>
            </section>
        </main>
        <LeaveModalApplyLeave v-model:open="isApplyModalOpen" class="w-full" />
    </div>
</template>

<script setup lang="ts">
import { useLeaveStore } from '~/stores/leaves'
import { storeToRefs } from 'pinia'

const leaveStore = useLeaveStore()
const { loading } = storeToRefs(leaveStore)
const isApplyModalOpen = ref(false)
await useAsyncData('leave-data', async () => {
    await Promise.all([
        leaveStore.fetchLeaves(),
        leaveStore.fetchLeaveBalances()
    ])
})

const balances = computed(() => leaveStore.uiBalances)
const requests = computed(() => leaveStore.uiRequests)

const activeFilter = ref('All')
const filteredRequests = computed(() =>
    activeFilter.value === 'All'
        ? requests.value
        : requests.value.filter(r => r.status === activeFilter.value.toLowerCase())
)

const cancelLeave = async (id: number,) => {
    const status = 'Cancelled'
    await leaveStore.updateLeave(id, status)
}
</script>
