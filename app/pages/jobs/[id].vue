<script setup lang="ts">
import { computed, ref } from 'vue'
import { useInterviewStore } from '~/stores/interview'
import type { Job } from '~/types/interview'
import EditJobModal from '~/components/Interview/Modal/EditJobModal.vue'

const route = useRoute()
const router = useRouter()
const interviewStore = useInterviewStore()
const isEditJobModalOpen = ref(false)

const jobId = computed(() => route.params.id as string)

// Fetch job details — GET /api/jobs/{id}
const { data: jobData, pending: loading } = await useAsyncData(
    `job-${jobId.value}`,
    async () => interviewStore.fetchJobById(jobId.value),
    { watch: [jobId] }
)

const job = computed(() => jobData.value ?? null)

const handleBack = () => {
    const tab = route.query.tab as string | undefined
    router.push(tab ? { path: '/interview', query: { tab } } : '/interview')
}

const handleCloseEditModal = () => {
    isEditJobModalOpen.value = false
}

const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

/** "Posted X days ago" or "Posted X weeks ago" if > 7 days */
const postedAgo = (dateString: string | null) => {
    if (!dateString) return 'Posted -'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (days <= 0) return 'Posted today'
    if (days === 1) return 'Posted 1 day ago'
    if (days <= 7) return `Posted ${days} days ago`
    const weeks = Math.floor(days / 7)
    return weeks === 1 ? 'Posted 1 week ago' : `Posted ${weeks} weeks ago`
}

// Job meta: use API fields when available, else defaults
const jobMeta = computed(() => {
    const j = job.value
    if (!j) return { openings: 3, applicants: 0, jobType: 'Remote' as const, experience: '2-5 years' }
    return {
        openings: j.openings ?? 3,
        applicants: j.applicants ?? 0,
        jobType: (j.job_type ?? 'Remote') as 'Remote' | 'Hybrid' | 'Onsite',
        experience: j.experience ?? '2-5 years'
    }
})
</script>

<template>
    <div class="min-h-screen bg-[#F8FAFC] p-3 md:p-6 flex flex-col gap-8">
        <!-- Back Button -->
        <div class="flex items-center gap-4">
            <UButton icon="i-lucide-arrow-left" variant="ghost" size="sm" @click="handleBack" class="text-slate-600">
                Back to Interviews
            </UButton>
        </div>

        <template v-if="loading">
            <div class="space-y-6">
                <USkeleton class="h-48 w-full" />
                <USkeleton class="h-64 w-full" />
            </div>
        </template>

        <template v-else-if="job">
            <!-- Job summary header -->
            <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 class="text-xl font-bold text-slate-800">{{ job.title }}</h1>
                        <p class="text-xs text-slate-400 my-1">
                            {{ postedAgo(job.created_at) }}
                        </p>
                        <UBadge :color="job.status === 'open' ? 'success' : 'neutral'" variant="soft" size="lg" class="capitalize">
                            {{ job.status }}
                        </UBadge>
                    </div>
                    <div class="flex items-center gap-2">
                        <UButton icon="i-lucide-edit" color="primary" variant="soft" size="sm" class="cursor-pointer"
                            @click="isEditJobModalOpen = true">
                            Edit
                        </UButton>
                    </div>
                </div>
            </div>

            <EditJobModal v-model:open="isEditJobModalOpen" :job="job" @close="handleCloseEditModal" />

            <!-- Job Details -->
            <div class="space-y-6">
                <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                    <h3 class="text-lg font-bold text-slate-800 mb-4">Job Details</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div>
                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Openings</p>
                            <p class="text-sm font-bold text-slate-700">{{ jobMeta.openings }}</p>
                        </div>
                        <div>
                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Applicants</p>
                            <p class="text-sm font-bold text-slate-700">{{ jobMeta.applicants }}</p>
                        </div>
                        <div>
                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Job type</p>
                            <p class="text-sm font-bold text-slate-700">{{ jobMeta.jobType }}</p>
                        </div>
                        <div>
                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Experience</p>
                            <p class="text-sm font-bold text-slate-700">{{ jobMeta.experience }}</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Title</p>
                            <p class="text-sm font-bold text-slate-700">{{ job.title }}</p>
                        </div>
                        <div class="md:col-span-2">
                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Description</p>
                            <p class="text-sm text-slate-700">{{ job.description || '-' }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <template v-else>
            <div class="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                <UIcon name="i-lucide-briefcase-off" class="text-3xl mb-2" />
                <p class="text-sm font-medium">Job not found</p>
            </div>
        </template>
    </div>
</template>
