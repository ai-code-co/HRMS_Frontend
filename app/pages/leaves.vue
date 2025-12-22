<script setup lang="ts">
import { ref, computed } from 'vue'
import { colorMap } from '~/utils/colorMap'

interface LeaveRequest {
    id: string
    type: string
    startDate: string
    endDate: string
    duration: string
    status: 'approved' | 'pending' | 'rejected'
    reason: string
    appliedDate: string
}

interface LeaveBalance {
    type: string
    total: number
    used: number
    color: keyof typeof colorMap
    icon: string
}

const isApplyModalOpen = ref(false)
const activeFilter = ref('All')

const balances: LeaveBalance[] = [
    { type: 'Annual Leave', total: 24, used: 8, color: 'indigo', icon: 'i-lucide-plane' },
    { type: 'Sick Leave', total: 12, used: 2, color: 'rose', icon: 'i-lucide-heart' },
    { type: 'Casual Leave', total: 10, used: 4, color: 'amber', icon: 'i-lucide-umbrella' },
    { type: 'Study Leave', total: 5, used: 0, color: 'emerald', icon: 'i-lucide-file-text' }
]

const requests: LeaveRequest[] = [
    { id: '1', type: 'Annual Leave', startDate: 'Dec 20, 2025', endDate: 'Dec 25, 2025', duration: '5 Days', status: 'approved', reason: 'Family vacation', appliedDate: 'Nov 12, 2025' },
    { id: '2', type: 'Sick Leave', startDate: 'Nov 05, 2025', endDate: 'Nov 06, 2025', duration: '2 Days', status: 'approved', reason: 'Fever and flu', appliedDate: 'Nov 05, 2025' },
    { id: '3', type: 'Casual Leave', startDate: 'Jan 12, 2026', endDate: 'Jan 12, 2026', duration: '1 Day', status: 'pending', reason: 'Personal errands', appliedDate: 'Dec 01, 2025' },
    { id: '4', type: 'Annual Leave', startDate: 'Feb 10, 2026', endDate: 'Feb 15, 2026', duration: '6 Days', status: 'rejected', reason: 'Project crunch period', appliedDate: 'Dec 05, 2025' }
]

const filteredRequests = computed(() =>
    activeFilter.value === 'All'
        ? requests
        : requests.filter(r => r.status === activeFilter.value.toLowerCase())
)
</script>

<template>
    <div class="min-h-screen bg-[#F8FAFC] text-slate-900">
        <main class="max-w-7xl mx-auto p-4 sm:p-6 space-y-10">
            <section>
                <h2 class="text-xl sm:text-2xl font-bold mb-1">
                    Leave Overview
                </h2>
                <p class="text-sm text-slate-400 mb-6">
                    Manage your annual and special leave allocations
                </p>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div v-for="b in balances" :key="b.type"
                        class="bg-white border border-slate-100 rounded-4xl p-6 shadow-sm">
                        <div class="flex flex-col gap-4">
                            <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                                :class="[colorMap[b.color].iconBg, colorMap[b.color].iconText]">
                                <UIcon :name="b.icon" />
                            </div>

                            <div>
                                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    {{ b.type }}
                                </p>
                                <div class="flex items-end gap-2">
                                    <span class="text-2xl font-black">
                                        {{ b.total - b.used }}
                                    </span>
                                    <span class="text-xs text-slate-400">
                                        / {{ b.total }} Days Left
                                    </span>
                                </div>
                            </div>

                            <div class="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                <div class="h-full rounded-full" :class="colorMap[b.color].bar"
                                    :style="{ width: `${((b.total - b.used) / b.total) * 100}%` }" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section class="space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h3 class="text-base sm:text-lg font-bold">
                        Application History
                    </h3>

                    <div class="flex gap-2 bg-white border border-slate-100 rounded-xl p-1
                   overflow-x-auto no-scrollbar">
                        <button v-for="f in ['All', 'Approved', 'Pending', 'Rejected']" :key="f"
                            class="px-4 py-1.5 text-[10px] font-bold rounded-lg whitespace-nowrap" :class="activeFilter === f
                                ? 'bg-slate-900 text-white'
                                : 'text-slate-500 hover:bg-slate-50'" @click="activeFilter = f">
                            {{ f }}
                        </button>
                    </div>
                </div>

                <div class="space-y-3">
                    <div v-for="r in filteredRequests" :key="r.id" class="bg-white border border-slate-100 rounded-[1.5rem]
                   p-4 sm:p-5 flex flex-col sm:flex-row
                   sm:items-center sm:justify-between gap-4">
                        <div>
                            <p class="font-bold text-sm sm:text-base">
                                {{ r.type }}
                            </p>
                            <p class="text-xs text-slate-400">
                                {{ r.startDate }} — {{ r.endDate }}
                            </p>
                            <div class="mt-2 sm:hidden space-y-1 text-xs text-slate-500">
                                <div>
                                    <span class="font-bold">Duration:</span> {{ r.duration }}
                                </div>
                                <div>
                                    <span class="font-bold">Applied:</span> {{ r.appliedDate }}
                                </div>
                            </div>
                        </div>
                        <div class="self-start sm:self-auto px-4 py-1.5 rounded-full
                     text-[10px] font-bold uppercase tracking-widest" :class="{
                        'bg-emerald-50 text-emerald-600': r.status === 'approved',
                        'bg-amber-50 text-amber-600': r.status === 'pending',
                        'bg-rose-50 text-rose-600': r.status === 'rejected'
                    }">
                            {{ r.status }}
                        </div>
                    </div>
                </div>
            </section>
        </main>
        <button @click="isApplyModalOpen = true" class="fixed bottom-6 right-6 sm:hidden
             w-14 h-14 rounded-full bg-indigo-600 text-white
             shadow-2xl flex items-center justify-center">
            <UIcon name="i-lucide-plus" size="24" />
        </button>
    </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}

.no-scrollbar {
    scrollbar-width: none;
    -ms-overflow-style: none;
}
</style>