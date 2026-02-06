<template>
    <div class="min-h-screen bg-[#F8FAFC]">
        <main class="max-w-7xl mx-auto p-0 sm:p-6 space-y-6">
            <!-- Header -->
            <div class="flex justify-between items-end">
                <div>
                    <h2 class="text-2xl font-bold">Interview Management</h2>
                    <p class="text-sm text-slate-400">Manage jobs, candidates, and interviews</p>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div v-for="stat in stats" :key="stat.label"
                    class="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                    <div class="flex flex-col gap-4">
                        <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                            :class="`text-${stat.color}-600 bg-${stat.color}-50`">
                            <UIcon :name="stat.icon" />
                        </div>
                        <div>
                            <p class="text-[10px] font-bold uppercase text-slate-400">{{ stat.label }}</p>
                            <div class="flex items-end gap-2">
                                <span class="text-2xl font-black">{{ stat.count }}</span>
                                <span v-if="stat.subtext" class="text-xs text-slate-400">{{ stat.subtext }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabs Section -->
            <section class="space-y-4">
                <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0">
                    <div
                        class="flex flex-wrap items-center gap-0 sm:gap-1.5 bg-slate-100/60 p-1 rounded-xl w-full md:w-fit border border-slate-200">
                        <UButton v-for="tab in tabs" :key="tab.key" size="xs" variant="ghost" :class="[
                            'px-3 sm:px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer',
                            activeTab === tab.key ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'
                        ]" @click="activeTab = tab.key">
                            {{ tab.label }}
                        </UButton>
                    </div>

                    <UButton v-if="activeTab !== 'candidates'" :icon="currentTabAction.icon" size="lg"
                        class="hidden sm:flex rounded-lg cursor-pointer" @click="handleAddAction">
                        {{ currentTabAction.label }}
                    </UButton>
                    <UButton v-if="activeTab !== 'candidates'" :icon="currentTabAction.icon" size="xl"
                        class="sm:hidden fixed bottom-6 right-6 rounded-full shadow-lg z-50" @click="handleAddAction" />
                </div>

                <!-- Loading State -->
                <div v-if="loading" class="space-y-3">
                    <USkeleton v-for="i in 3" :key="i" class="h-20 w-full rounded-2xl" />
                </div>

                <!-- Jobs Tab -->
                <div v-else-if="activeTab === 'jobs'" class="space-y-3">
                    <div v-if="jobs.length === 0"
                        class="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                        <UIcon name="i-lucide-briefcase" class="text-3xl mb-2" />
                        <p class="text-sm font-medium">No jobs found</p>
                    </div>

                    <div v-else v-for="job in jobs" :key="job.id" @click="handleViewJob(job.id)"
                        class="bg-white border border-slate-200 p-5 rounded-[1.5rem] flex justify-between items-center cursor-pointer transition-all hover:border-indigo-300 hover:shadow-md">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <p class="font-bold text-sm">{{ job.title }}</p>
                                <UBadge :color="job.status === 'open' ? 'success' : 'neutral'" variant="soft" size="xs">
                                    {{ job.status }}
                                </UBadge>
                            </div>
                            <p class="text-xs text-slate-400 line-clamp-1">{{ job.description }}</p>
                            <div class="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                <span class="flex items-center gap-1">
                                    <UIcon name="i-lucide-calendar" class="w-3 h-3" />
                                    {{ formatDate(job.created_at) }}
                                </span>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs"
                                @click.stop="handleDeleteJob(job.id)" />
                        </div>
                    </div>
                </div>

                <!-- Candidates Tab -->
                <div v-else-if="activeTab === 'candidates'" class="space-y-3">
                    <div v-if="candidates.length === 0"
                        class="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                        <UIcon name="i-lucide-user-search" class="text-3xl mb-2" />
                        <p class="text-sm font-medium">No candidates found</p>
                    </div>

                    <div v-else v-for="candidate in candidates" :key="candidate.id"
                        @click="handleViewCandidate(candidate.id)"
                        class="bg-white border border-slate-200 p-5 rounded-[1.5rem] flex justify-between items-center cursor-pointer transition-all hover:border-indigo-300 hover:shadow-md">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span class="text-indigo-600 font-bold text-sm">{{ getInitials(candidate.name) }}</span>
                            </div>
                            <div>
                                <p class="font-bold text-sm">{{ candidate.name }}</p>
                                <p class="text-xs text-slate-400">{{ candidate.job?.title || 'No job assigned' }}</p>
                                <p class="text-[10px] text-slate-400">{{ candidate.email }}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-xs text-slate-400">{{ formatDate(candidate.created_at) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Invites Tab -->
                <div v-else-if="activeTab === 'invites'" class="space-y-3">
                    <div v-if="invites.length === 0"
                        class="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                        <UIcon name="i-lucide-calendar-check" class="text-3xl mb-2" />
                        <p class="text-sm font-medium">No interview invites found</p>
                    </div>

                    <div v-else v-for="invite in invites" :key="invite.id"
                        class="bg-white border border-slate-200 p-5 rounded-[1.5rem] flex justify-between items-center cursor-pointer transition-all hover:border-indigo-300 hover:shadow-md">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                <UIcon name="i-lucide-mail" class="text-indigo-600" />
                            </div>
                            <div>
                                <p class="font-bold text-sm">{{ invite.email }}</p>
                                <p class="text-xs text-slate-400">Sent: {{ formatDate(invite.created_at) }}</p>
                                <p class="text-[10px] text-slate-400" v-if="invite.expires_at">
                                    Expires: {{ formatDate(invite.expires_at) }}
                                </p>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="text-right">
                                <UBadge v-if="invite.has_applied" color="success" variant="soft" size="xs" class="mb-1">
                                    Applied
                                </UBadge>
                                <p v-if="invite.used_at" class="text-[10px] text-slate-400">
                                    Used: {{ formatDate(invite.used_at) }}
                                </p>
                            </div>
                            <div :class="inviteStatusClass(invite.status)"
                                class="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase">
                                {{ invite.status }}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        <!-- Modals -->
        <AddJobModal v-model:open="isAddJobModalOpen" @close="isAddJobModalOpen = false" />
        <SendInviteModal v-model:open="isSendInviteModalOpen" @close="isSendInviteModalOpen = false" />
        <ConfirmDialog v-model:open="deleteConfirmOpen" title="Delete Job"
            message="Are you sure you want to delete this job? This action cannot be undone." confirm-label="Delete"
            cancel-label="Cancel" confirm-color="error" :loading="deletingJob" @confirm="handleConfirmDeleteJob"
            @cancel="handleCancelDeleteJob" />
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useInterviewStore } from '~/stores/interview'
import type { InviteStatus } from '~/types/interview'
import AddJobModal from '~/components/Interview/Modal/AddJobModal.vue'
import SendInviteModal from '~/components/Interview/Modal/SendInviteModal.vue'
import ConfirmDialog from '~/components/UI/ConfirmDialog.vue'

const route = useRoute()
const interviewStore = useInterviewStore()
const router = useRouter()
const { jobsList: jobs, candidatesList: candidates, invitesList: invites, isLoading: loading } = storeToRefs(interviewStore)

const validTabs = ['jobs', 'candidates', 'invites'] as const
const activeTab = ref<'jobs' | 'candidates' | 'invites'>('jobs')

// Restore tab from query when navigating back from candidate/job page
watch(() => route.query.tab, (tab) => {
    if (tab && validTabs.includes(tab as any)) {
        activeTab.value = tab as 'jobs' | 'candidates' | 'invites'
    }
}, { immediate: true })
const hasInitialized = ref(false)
const isAddJobModalOpen = ref(false)
const isSendInviteModalOpen = ref(false)
const deleteConfirmOpen = ref(false)
const jobToDeleteId = ref<string | null>(null)
const deletingJob = ref(false)

const tabs = [
    { key: 'jobs', label: 'Jobs' },
    { key: 'candidates', label: 'Candidates' },
    { key: 'invites', label: 'Invites' }
] as const

// Fetch all data on mount
const { data: interviewData } = await useAsyncData('interview-data', async () => {
    const showLoader = hasInitialized.value
    hasInitialized.value = true
    const [jobsData, candidatesData, invitesData] = await Promise.all([
        interviewStore.fetchJobs(showLoader),
        interviewStore.fetchCandidates(showLoader),
        interviewStore.fetchInvites(showLoader)
    ])
    return { jobs: jobsData, candidates: candidatesData, invites: invitesData }
})

if (import.meta.client && interviewData.value) {
    interviewStore.setInterviewData(
        interviewData.value.jobs,
        interviewData.value.candidates,
        interviewData.value.invites
    )
}

// Stats computed
const stats = computed(() => [
    {
        label: 'Open Jobs',
        count: interviewStore.openJobs.length,
        subtext: `of ${jobs.value.length} total`,
        icon: 'i-lucide-briefcase',
        color: 'indigo'
    },
    {
        label: 'Total Candidates',
        count: candidates.value.length,
        icon: 'i-lucide-users',
        color: 'emerald'
    },
    {
        label: 'Pending Invites',
        count: interviewStore.pendingInvites.length,
        subtext: `of ${invites.value.length} total`,
        icon: 'i-lucide-calendar-clock',
        color: 'amber'
    }
])

// Current tab action button config
const currentTabAction = computed(() => {
    switch (activeTab.value) {
        case 'jobs':
            return { label: 'Add Job', icon: 'i-lucide-plus' }
        case 'candidates':
            return { label: 'Add Candidate', icon: 'i-lucide-user-plus' }
        case 'invites':
            return { label: 'Send Invite', icon: 'i-lucide-send' }
        default:
            return { label: 'Add', icon: 'i-lucide-plus' }
    }
})

const handleAddAction = () => {
    if (activeTab.value === 'jobs') {
        isAddJobModalOpen.value = true
    } else if (activeTab.value === 'invites') {
        isSendInviteModalOpen.value = true
    } else {
        const toast = useToast()
        toast.add({
            title: 'Coming Soon',
            description: `${currentTabAction.value.label} functionality will be added soon`,
            color: 'info'
        })
    }
}

const handleDeleteJob = (jobId: string) => {
    jobToDeleteId.value = jobId
    deleteConfirmOpen.value = true
}

const handleConfirmDeleteJob = async () => {
    if (!jobToDeleteId.value) return
    deletingJob.value = true
    try {
        await interviewStore.deleteJob(jobToDeleteId.value)
        deleteConfirmOpen.value = false
        jobToDeleteId.value = null
    } finally {
        deletingJob.value = false
    }
}

const handleCancelDeleteJob = () => {
    jobToDeleteId.value = null
}

const handleViewJob = (jobId: string) => {
    router.push({ path: `/jobs/${jobId}`, query: { tab: activeTab.value } }).catch((err) => {
        if (err?.name === 'NavigationDuplicated' || err?.name === 'NavigationAborted') return
        console.error('Navigation failed:', err)
    })
}

const handleViewCandidate = (candidateId: string) => {
    router.push({ path: `/candidates/${candidateId}`, query: { tab: activeTab.value } }).catch((err) => {
        if (err?.name === 'NavigationDuplicated' || err?.name === 'NavigationAborted') return
        console.error('Navigation failed:', err)
    })
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
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}


const inviteStatusClass = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === 'pending') {
        return 'bg-amber-50 text-amber-600'
    } else if (statusLower === 'used') {
        return 'bg-emerald-50 text-emerald-600'
    } else if (statusLower === 'accepted') {
        return 'bg-emerald-50 text-emerald-600'
    } else if (statusLower === 'declined') {
        return 'bg-rose-50 text-rose-600'
    } else if (statusLower === 'expired') {
        return 'bg-slate-50 text-slate-600'
    }
    return 'bg-slate-50 text-slate-600'
}
</script>
