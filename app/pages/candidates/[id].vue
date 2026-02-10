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
const updatingStatusFor = ref<'APPROVED' | 'REJECTED' | null>(null)
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
    updatingStatusFor.value = status === 'APPROVED' || status === 'REJECTED' ? status : null
    try {
        await interviewStore.updateCandidateStatus(selectedCandidate.value.id, {
            status,
            ...(customMessage.value?.trim() && { customMessage: customMessage.value.trim() })
        })
        customMessage.value = ''
    } finally {
        updatingStatus.value = false
        updatingStatusFor.value = null
    }
}

// One-time use: once Approve or Reject is chosen, both buttons are disabled
const hasDecided = computed(() => {
    const s = selectedCandidate.value?.status
    return s === 'APPROVED' || s === 'REJECTED'
})

// Post-interview decision: disable Interview Approve/Reject only when decision was made after interview
const hasPostInterviewDecided = computed(() => {
    const c = selectedCandidate.value
    if (!c?.interview) return false
    const s = c.status
    if (s !== 'APPROVED' && s !== 'REJECTED') return false
    const updatedAt = c.status_updated_at
    const completedAt = c.interview?.completed_at
    if (updatedAt && completedAt) {
        return new Date(updatedAt) >= new Date(completedAt)
    }
    return false
})

const decisionStage = computed<'pre' | 'in_progress' | 'post' | 'none'>(() => {
    const c = selectedCandidate.value
    if (!c) return 'none'
    if (!c.interview) return 'pre'
    const interviewStatus = c.interview.status?.toUpperCase()
    if (interviewStatus === 'COMPLETED') return 'post'
    return 'in_progress'
})

const decisionDisabled = computed(() => {
    if (updatingStatus.value) return true
    if (decisionStage.value === 'pre') return hasDecided.value
    if (decisionStage.value === 'post') return hasPostInterviewDecided.value
    return true
})

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
            <UButton icon="i-lucide-arrow-left" variant="ghost" size="sm" @click="handleBack" class="text-slate-600 cursor-pointer">
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

                <!-- Decision + Interview (single card) -->
                <div v-if="selectedCandidate.evaluation || selectedCandidate.interview"
                    class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                    <h3 class="text-lg font-bold text-slate-800 mb-2">Decision & Interview</h3>
                    <p v-if="decisionStage === 'pre'" class="text-sm text-slate-600 mb-4">
                        Based on the AI evaluation, approve to send an interview link to the candidate or reject to send a rejection email.
                    </p>
                    <p v-else-if="decisionStage === 'in_progress'" class="text-sm text-slate-600 mb-4">
                        Interview is in progress. You can approve or reject once the interview is completed.
                    </p>
                    <p v-else-if="decisionStage === 'post'" class="text-sm text-slate-600 mb-4">
                        Interview completed. You can approve or reject once.
                    </p>

                    <div v-if="selectedCandidate.interview" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                            <UBadge :class="getStatusColor(selectedCandidate.interview.status)" variant="soft" size="sm">
                                {{ selectedCandidate.interview.status }}
                            </UBadge>
                        </div>
                        <div v-if="selectedCandidate.interview.duration">
                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Duration</p>
                        </div>
                        <div v-if="selectedCandidate.interview.video_url">
                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Video</p>
                            <UButton icon="i-lucide-video" variant="ghost" size="sm"
                                @click="window.open(selectedCandidate.interview.video_url, '_blank')">
                                View Recording
                            </UButton>
                        </div>
                        <div v-if="selectedCandidate.interview.transcript_url">
                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Transcript</p>
                            <UButton icon="i-lucide-file-text" variant="ghost" size="sm"
                                @click="window.open(selectedCandidate.interview.transcript_url, '_blank')">
                                View Transcript
                            </UButton>
                        </div>
                    </div>

                    <div v-if="selectedCandidate.interview?.video_url" class="mb-6">
                        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Interview recording</p>
                        <div class="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900">
                            <video :src="selectedCandidate.interview.video_url" controls class="w-full h-full object-cover" playsinline />
                            <div class="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
                            <div class="absolute top-4 right-4 flex items-center gap-2 bg-black/40 backdrop-blur-sm border border-white/10 text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider">
                                <UIcon name="i-lucide-video" class="size-3.5" />
                                Recording
                            </div>
                        </div>
                        <p class="text-xs text-slate-500 mt-2">
                            If the video does not play, you can
                            <a :href="selectedCandidate.interview.video_url" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline font-medium">open the recording in a new tab</a>.
                        </p>
                    </div>

                    <div class="mb-4">
                        <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Optional message (included in email)</label>
                        <UTextarea v-model="customMessage" placeholder="Add a personal note for the candidate (optional)" :rows="2"
                            class="w-full border-primary-300 focus:border-primary-500 focus:border-2 focus:ring-0 focus:ring-transparent focus:outline-none" color="primary" variant="outline" />
                    </div>

                    <div class="flex flex-wrap items-center gap-3">
                        <UButton color="success" variant="soft" :loading="updatingStatusFor === 'APPROVED'"
                            :disabled="decisionDisabled"
                            class="cursor-pointer"
                            @click="handleStatusUpdate('APPROVED')">
                            {{ decisionStage === 'pre' ? 'Approve — Send interview link' : 'Approve' }}
                        </UButton>
                        <UButton color="error" variant="soft" :loading="updatingStatusFor === 'REJECTED'"
                            :disabled="decisionDisabled"
                            class="cursor-pointer"
                            @click="handleStatusUpdate('REJECTED')">
                            {{ decisionStage === 'pre' ? 'Reject — Send rejection email' : 'Reject' }}
                        </UButton>
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

<style scoped>
/* Optional message textarea: primary blue border (matches Apply Leave Reason field) */
:deep(textarea) {
    border-color: #93c5fd !important; /* primary-300 / blue-300 */
}
:deep(textarea:focus),
:deep([data-slot="textarea"]:focus-within),
:deep([data-slot="textarea"]:focus-within > *) {
    border-color: #3b82f6 !important; /* primary-500 / blue-500 */
    border-width: 2px !important;
    outline: none !important;
    box-shadow: none !important;
    --tw-ring-shadow: 0 0 0 0 transparent !important;
    --tw-ring-color: transparent !important;
}
</style>
