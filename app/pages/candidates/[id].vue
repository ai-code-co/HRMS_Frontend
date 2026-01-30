<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import CandidateSummary from '~/components/Interview/CandidateSummary.vue'
import { useInterviewStore } from '~/stores/interview'
import type { CandidateDetail } from '~/types/interview'

const route = useRoute()
const router = useRouter()
const interviewStore = useInterviewStore()
const { selectedCandidate, isLoading: loading } = storeToRefs(interviewStore)
const hasInitialized = ref(false)
const updatingStatus = ref(false)
const customMessage = ref('')

const candidateId = computed(() => route.params.id as string)

// Fetch candidate details
const { data: candidateData } = await useAsyncData(`candidate-${candidateId.value}`, async () => {
    const showLoader = hasInitialized.value
    hasInitialized.value = true
    return await interviewStore.fetchCandidateById(candidateId.value)
}, {
    watch: [candidateId]
})

if (import.meta.client && candidateData.value) {
    // Data is already set in store by fetchCandidateById
}

const handleBack = () => {
    const tab = route.query.tab as string | undefined
    router.push(tab ? { path: '/interview', query: { tab } } : '/interview')
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

const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    switch (statusLower) {
        case 'approved':
            return 'bg-emerald-50 text-emerald-600 border border-emerald-100'
        case 'rejected':
            return 'bg-red-50 text-red-600 border border-red-100'
        case 'reviewing':
        case 'pending':
            return 'bg-amber-50 text-amber-600 border border-amber-100'
        default:
            return 'bg-slate-50 text-slate-600 border border-slate-100'
    }
}

const handleStatusUpdate = async (status: 'APPROVED' | 'REJECTED' | 'PENDING') => {
    if (!selectedCandidate.value?.id || updatingStatus.value) return
    updatingStatus.value = true
    try {
        await interviewStore.updateCandidateStatus(selectedCandidate.value.id, {
            status,
            ...(customMessage.value?.trim() && { customMessage: customMessage.value.trim() })
        })
        customMessage.value = ''
    } finally {
        updatingStatus.value = false
    }
}

const hasInterview = computed(() => !!selectedCandidate.value?.interview)

const getRecommendationColor = (recommendation: string) => {
    const recLower = recommendation.toLowerCase()
    if (recLower.includes('strong')) return 'text-emerald-600'
    if (recLower.includes('good')) return 'text-blue-600'
    if (recLower.includes('partial')) return 'text-amber-600'
    return 'text-red-600'
}
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

        <template v-else-if="selectedCandidate">
            <CandidateSummary :candidate="selectedCandidate" />

            <!-- Candidate Details Sections -->
            <div class="space-y-6">
                <!-- Job Information -->
                <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-bold text-slate-800">Job Information</h3>
                        <UButton v-if="selectedCandidate.job?.id" icon="i-lucide-external-link" variant="link"
                            color="primary" size="sm" class="cursor-pointer"
                            @click="router.push(`/jobs/${selectedCandidate.job.id}`)">
                            View Job
                        </UButton>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Applied For
                            </p>
                            <p class="text-sm font-bold text-slate-700">{{ selectedCandidate.job?.title ?? '-' }}</p>
                        </div>
                    </div>
                </div>

                <!-- Documents -->
                <div v-if="selectedCandidate.documents && selectedCandidate.documents.length > 0"
                    class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                    <h3 class="text-lg font-bold text-slate-800 mb-4">Documents</h3>
                    <div class="space-y-3">
                        <div v-for="doc in selectedCandidate.documents" :key="doc.id"
                            class="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div class="flex items-center gap-3">
                                <UIcon name="i-lucide-file" class="text-slate-400" />
                                <div>
                                    <p class="text-sm font-medium text-slate-700">Document</p>
                                    <p class="text-xs text-slate-400">{{ formatDate(doc.uploaded_at) }}</p>
                                </div>
                            </div>
                            <UButton v-if="doc.url" icon="i-lucide-download" variant="ghost" size="xs"
                                @click="window.open(doc.url, '_blank')" />
                        </div>
                    </div>
                </div>

                <!-- AI Evaluation -->
                <div v-if="selectedCandidate.evaluation"
                    class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                    <h3 class="text-lg font-bold text-slate-800 mb-4">AI Evaluation</h3>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Score</p>
                                <p class="text-2xl font-black text-slate-800">{{ selectedCandidate.evaluation.score }}%
                                </p>
                            </div>
                            <div>
                                <div v-if="selectedCandidate.evaluation.recommendation" :class="{
                                    'bg-emerald-50 text-emerald-600': selectedCandidate.evaluation.recommendation === 'STRONG_MATCH',
                                    'bg-amber-50 text-amber-600': selectedCandidate.evaluation.recommendation === 'POTENTIAL_MATCH',
                                    'bg-rose-50 text-rose-600': selectedCandidate.evaluation.recommendation === 'WEAK_MATCH',
                                }" class="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase hidden sm:block">
                                    {{ selectedCandidate.evaluation.recommendation.replace(/_/g, ' ') }}
                                </div>
                            </div>
                        </div>

                        <div v-if="selectedCandidate.evaluation.summary">
                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Summary</p>
                            <p class="text-sm text-slate-700">{{ selectedCandidate.evaluation.summary }}</p>
                        </div>

                        <div v-if="selectedCandidate.evaluation.matched_skills && Object.keys(selectedCandidate.evaluation.matched_skills).length > 0"
                            class="mt-4">
                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Matched
                                Skills</p>
                            <ul class="list-disc list-inside space-y-3 text-slate-700">
                                <li class="text-sm font-bold text-slate-800"
                                    v-for="(description, skillName) in selectedCandidate.evaluation.matched_skills"
                                    :key="skillName">
                                    {{ skillName }} :
                                    <span class="font-normal text-slate-600 mt-0.5 ml-0 pl-4">{{ description }}</span>
                                </li>
                            </ul>
                        </div>

                        <div v-if="selectedCandidate.evaluation.missing_skills && Object.keys(selectedCandidate.evaluation.missing_skills).length > 0"
                            class="mt-4">
                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Missing
                                Skills</p>
                            <ul class="list-disc list-inside space-y-3 text-slate-700">
                                <li class="text-sm font-bold text-slate-800"
                                    v-for="(description, skillName) in selectedCandidate.evaluation.missing_skills"
                                    :key="skillName">
                                    {{ skillName }} :
                                    <span class="font-normal text-slate-600 mt-0.5 ml-0 pl-4">{{ description }}</span>
                                </li>
                            </ul>
                        </div>
                        <div v-if="selectedCandidate.evaluation.strengths && Object.keys(selectedCandidate.evaluation.strengths).length > 0"
                            class="mt-4">
                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Strengths</p>
                            <ul class="list-disc list-inside space-y-3 text-slate-700">
                                <li class="text-sm font-bold text-slate-800"
                                    v-for="(description, skillName) in selectedCandidate.evaluation.strengths"
                                    :key="skillName">
                                    {{ skillName }} :
                                    <span class="font-normal text-slate-600 mt-0.5 ml-0 pl-4">{{ description }}</span>
                                </li>
                            </ul>
                        </div>
                        <div v-if="selectedCandidate.evaluation.weaknesses && Object.keys(selectedCandidate.evaluation.weaknesses).length > 0"
                            class="mt-4">
                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Weaknesses
                            </p>
                            <ul class="list-disc list-inside space-y-3 text-slate-700">
                                <li class="text-sm font-bold text-slate-800"
                                    v-for="(description, skillName) in selectedCandidate.evaluation.weaknesses"
                                    :key="skillName">
                                    {{ skillName }} :
                                    <span class="font-normal text-slate-600 mt-0.5 ml-0 pl-4">{{ description }}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Interview Information -->
                <div v-if="selectedCandidate.interview"
                    class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                    <h3 class="text-lg font-bold text-slate-800 mb-4">Interview Information</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                            <UBadge :class="getStatusColor(selectedCandidate.interview.status)" variant="soft"
                                size="sm">
                                {{ selectedCandidate.interview.status }}
                            </UBadge>
                        </div>
                        <div v-if="selectedCandidate.interview.duration">
                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Duration</p>
                            <!-- <p class="text-sm font-bold text-slate-700">{{ selectedCandidate.interview.duration }}</p> -->
                        </div>
                        <div v-if="selectedCandidate.interview.video_url">
                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Video</p>
                            <UButton icon="i-lucide-video" variant="ghost" size="sm"
                                @click="window.open(selectedCandidate.interview.video_url, '_blank')">
                                View Recording
                            </UButton>
                        </div>
                        <div v-if="selectedCandidate.interview.transcript_url">
                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Transcript
                            </p>
                            <UButton icon="i-lucide-file-text" variant="ghost" size="sm"
                                @click="window.open(selectedCandidate.interview.transcript_url, '_blank')">
                                View Transcript
                            </UButton>
                        </div>
                        <div class="flex flex-wrap gap-3">
                            <UButton color="success" variant="soft" :loading="updatingStatus"
                                :disabled="updatingStatus || selectedCandidate.status === 'APPROVED'"
                                @click="handleStatusUpdate('APPROVED')">
                                Approve
                            </UButton>
                            <UButton color="error" variant="soft" :loading="updatingStatus"
                                :disabled="updatingStatus || selectedCandidate.status === 'REJECTED'"
                                @click="handleStatusUpdate('REJECTED')">
                                Reject
                            </UButton>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <template v-else>
            <div class="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                <UIcon name="i-lucide-user-x" class="text-3xl mb-2" />
                <p class="text-sm font-medium">Candidate not found</p>
            </div>
        </template>
    </div>
</template>
