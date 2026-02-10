<template>
    <div class="w-full mx-auto" :class="step === 'question' ? 'max-w-5xl' : 'max-w-2xl'">
        <!-- Invalid, expired, or already used link -->
        <div v-if="error"
            class="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 md:p-10 text-center space-y-6">
            <div class="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
                <UIcon name="i-lucide-link-2-off" class="size-8 text-red-600" />
            </div>
            <div>
                <p class="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-1">Link unavailable</p>
                <h2 class="text-xl font-bold text-slate-800 mb-2">This link can only be used once</h2>
                <p class="text-sm text-slate-600 max-w-sm mx-auto">
                    This interview link has already been used or has expired. Each invitation is valid for one-time use only. Please contact the recruiter for a new link if needed.
                </p>
            </div>
        </div>

        <!-- System Check: Camera & Audio access -->
        <div v-else-if="step === 'system-check'"
            class="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 md:p-10 text-center space-y-8">
            <h2 class="text-xl font-bold text-slate-800">System Check</h2>
            <p class="text-sm text-slate-600">Allow camera and microphone access so we can run your interview.</p>
            <div class="flex justify-center gap-12">
                <div class="flex flex-col items-center gap-2">
                    <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <UIcon name="i-lucide-video" class="size-7 text-slate-600" />
                    </div>
                    <span class="text-xs font-medium text-slate-700">Camera</span>
                </div>
                <div class="flex flex-col items-center gap-2">
                    <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <UIcon name="i-lucide-mic" class="size-7 text-slate-600" />
                    </div>
                    <span class="text-xs font-medium text-slate-700">Audio</span>
                </div>
            </div>
            <UButton
                size="xl"
                block
                color="primary"
                class="rounded-xl cursor-pointer max-w-xs mx-auto"
                :loading="requestingMedia"
                @click="handleAllowAccess"
            >
                Allow Access
            </UButton>
            <p v-if="mediaError" class="text-sm text-red-600">{{ mediaError }}</p>
        </div>

        <!-- Not started: Start Interview -->
        <div v-else-if="step === 'start'"
            class="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 md:p-10 space-y-6">
            <div class="space-y-2">
                <p class="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Ready when you are</p>
                <h2 class="text-xl font-bold text-slate-800">Start your interview</h2>
                <p class="text-sm text-slate-600">
                    When you're ready, click the button below to begin. You will be asked a series of questions and can record your answers.
                </p>
                <p class="text-xs text-slate-600 bg-white bg-white border border-slate-200 rounded-lg px-3 py-2">
                    This invitation link is valid for one-time use only. Do not share it.
                </p>
            </div>
            <UButton
                size="xl"
                block
                color="primary"
                icon="i-lucide-mic"
                :loading="starting"
                class="rounded-xl cursor-pointer"
                @click="handleStart"
            >
                Start Interview
            </UButton>
        </div>

        <!-- Question: with video feed and transcript on right -->
        <div v-else-if="step === 'question'" class="w-full grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-stretch min-h-[70vh]">
            <!-- Left: question, camera, answer -->
            <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8 space-y-6 min-h-0 flex flex-col">
                <!-- LIVE + Question header -->
                <div class="flex items-center justify-between flex-wrap gap-2">
                    <div class="flex items-center gap-2">
                        <span v-if="localStream" class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500 text-white text-[10px] font-bold uppercase">
                            <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            Live
                        </span>
                    </div>
                    <p class="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Question {{ questionNumber }}</p>
                </div>
                <div class="space-y-2">
                    <div class="flex items-center justify-between gap-2 flex-wrap">
                        <p class="text-[10px] font-bold uppercase text-indigo-600 tracking-widest">Current question</p>
                        <UButton
                            v-if="currentQuestion?.question_text"
                            icon="i-lucide-volume-2"
                            variant="ghost"
                            size="xs"
                            color="primary"
                            class="cursor-pointer shrink-0"
                            @click="speakQuestion(currentQuestion.question_text)"
                        >
                            Play question
                        </UButton>
                    </div>
                    <p class="text-lg font-bold text-slate-800 leading-relaxed">{{ currentQuestion?.question_text }}</p>
                </div>

                <!-- Video feed with REC indicator (no transcript overlay) -->
                <div class="relative rounded-xl overflow-hidden bg-slate-900 aspect-video w-full flex-1 min-h-[280px]">
                    <video
                        ref="videoRef"
                        autoplay
                        playsinline
                        muted
                        class="w-full h-full object-cover"
                    />
                    <div v-if="recording"
                        class="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-500 text-white text-[10px] font-bold">
                        <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Rec
                    </div>
                    <div v-if="!localStream" class="absolute inset-0 flex items-center justify-center bg-slate-800 text-slate-400 text-sm">
                        Camera unavailable
                    </div>
                </div>

                <!-- Your answer: record / submit -->
                <div class="border-t border-slate-100 pt-6 space-y-4">
                    <p class="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Your answer</p>
                    <div v-if="!recording && !audioBlob" class="space-y-3">
                        <UButton
                            icon="i-lucide-mic"
                            size="xl"
                            color="primary"
                            block
                            :disabled="submitting"
                            class="rounded-xl cursor-pointer"
                            @click="startRecording"
                        >
                            Start recording your answer
                        </UButton>
                    </div>
                    <div v-else-if="recording"
                        class="flex flex-col gap-4 p-4 rounded-xl bg-red-50 border border-red-100">
                        <div class="flex items-center gap-2 text-red-600">
                            <span class="relative flex h-3 w-3">
                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                            </span>
                            <span class="text-sm font-bold">Recording...</span>
                        </div>
                        <UButton
                            size="xl"
                            color="error"
                            variant="soft"
                            block
                            icon="i-lucide-square"
                            class="rounded-xl cursor-pointer"
                            @click="stopRecording"
                        >
                            Stop recording
                        </UButton>
                    </div>
                    <div v-else-if="audioBlob"
                        class="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <p class="text-sm font-medium text-slate-700">Recording ready. Submit your answer.</p>
                        <UButton
                            size="xl"
                            block
                            color="primary"
                            :loading="submitting"
                            class="rounded-xl cursor-pointer"
                            @click="submitAnswer"
                        >
                            Submit answer
                        </UButton>
                    </div>
                </div>
            </div>

            <!-- Right: transcript panel (same height as left) -->
            <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-6 flex flex-col min-h-0 lg:sticky lg:top-6">
                <p class="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-3 shrink-0">Transcript</p>
                <div class="flex-1 min-h-[140px] overflow-y-auto p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p class="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                        {{ liveTranscript || (recording ? 'Speak now — your words will appear here...' : 'Your live transcript will appear here when you record.') }}
                    </p>
                </div>
            </div>
        </div>

        <!-- Complete -->
        <div v-else-if="step === 'complete'"
            class="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 md:p-10 text-center space-y-6">
            <div class="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto">
                <UIcon name="i-lucide-check-circle" class="size-8 text-emerald-600" />
            </div>
            <div>
                <p class="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-1">All done</p>
                <h2 class="text-xl font-bold text-slate-800 mb-2">Interview complete</h2>
                <p class="text-sm text-slate-600 max-w-sm mx-auto">
                    Thank you for completing the interview. Your responses have been submitted successfully.
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const INTERVIEW_API_BASE = 'https://ai-interviewer-py.onrender.com/'

definePageMeta({
    layout: 'interview-link',
})

const route = useRoute()
const toast = useToast()

const token = computed(() => (route.params.token as string)?.trim() || '')

interface InterviewSession {
    id: string
    candidate_id: string
    job_id: string
    status?: string
    [key: string]: unknown
}

interface Question {
    id: string
    question_text: string
    [key: string]: unknown
}

const error = ref(false)
const session = ref<InterviewSession | null>(null)
const step = ref<'system-check' | 'start' | 'question' | 'complete'>('system-check')
const starting = ref(false)
const currentQuestion = ref<Question | null>(null)
const questionNumber = ref(0)
const lastQuestionId = ref<string | null>(null)
const done = ref(false)
const recording = ref(false)
const mediaRecorder = ref<MediaRecorder | null>(null)
const audioBlob = ref<Blob | null>(null)
const submitting = ref(false)
const liveTranscript = ref('')
const speechRecognition = ref<SpeechRecognition | null>(null)

/** Speak the question aloud using the browser's text-to-speech (Web Speech API). */
function speakQuestion(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text?.trim()) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text.trim())
    utterance.lang = navigator.language || 'en-US'
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
}

// Collect all transcripts for PDF generation
interface TranscriptEntry {
    questionNumber: number
    questionText: string
    answerText: string
}
const allTranscripts = ref<TranscriptEntry[]>([])

const localStream = ref<MediaStream | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const requestingMedia = ref(false)
const mediaError = ref('')

async function validateToken() {
    if (!token.value) {
        error.value = true
        return
    }
    error.value = false
    try {
        const data = await useInterviewApi<InterviewSession>(`/api/interview/validate/${token.value}`)
        session.value = data
        step.value = data?.status === 'COMPLETED' ? 'complete' : 'system-check'
    } catch {
        error.value = true
    }
}

async function handleAllowAccess() {
    if (!navigator.mediaDevices?.getUserMedia) {
        mediaError.value = 'Camera and microphone are not supported in this browser.'
        return
    }
    requestingMedia.value = true
    mediaError.value = ''
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        localStream.value = stream
        step.value = 'start'
    } catch (err: any) {
        mediaError.value = err?.message?.includes('Permission') || err?.name === 'NotAllowedError'
            ? 'Camera and microphone access was denied. Please allow access and try again.'
            : 'Could not access camera or microphone. Please check your device and try again.'
    } finally {
        requestingMedia.value = false
    }
}

async function handleStart() {
    if (!session.value?.candidate_id || !session.value?.job_id) return
    starting.value = true
    try {
        const res = await useInterviewApi<{ session: InterviewSession }>('/api/interview/start', {
            method: 'POST',
            body: {
                candidate_id: session.value.candidate_id,
                job_id: session.value.job_id,
            },
        })
        if (res?.session) {
            session.value = { ...session.value!, ...res.session }
        }
        step.value = 'question'
        await fetchNextQuestion()
    } catch (err: any) {
        toast.add({
            title: 'Error',
            description: err?.data?.detail || err?.message || 'Failed to start interview',
            color: 'error',
        })
    } finally {
        starting.value = false
    }
}

async function fetchNextQuestion() {
    if (!session.value?.job_id) return
    try {
        const res = await useInterviewApi<{ question: Question | null; done: boolean }>('/api/interview/question', {
            method: 'POST',
            body: {
                job_id: session.value.job_id,
                last_question_id: lastQuestionId.value,
            },
        })
        if (res.done || !res.question) {
            done.value = true
            await completeInterview()
            localStream.value?.getTracks().forEach((t) => t.stop())
            localStream.value = null
            step.value = 'complete'
            return
        }
        currentQuestion.value = res.question
        lastQuestionId.value = res.question.id
        questionNumber.value += 1
        audioBlob.value = null
        liveTranscript.value = ''
        if (res.question?.question_text) {
            speakQuestion(res.question.question_text)
        }
    } catch (err: any) {
        toast.add({
            title: 'Error',
            description: err?.data?.detail || err?.message || 'Failed to load question',
            color: 'error',
        })
    }
}

function startRecording() {
    const stream = localStream.value
    if (!stream) {
        toast.add({ title: 'Error', description: 'Camera and microphone are required. Please allow access first.', color: 'error' })
        return
    }
    const audioTracks = stream.getAudioTracks()
    if (!audioTracks.length) {
        toast.add({ title: 'Error', description: 'No microphone track available.', color: 'error' })
        return
    }
    liveTranscript.value = ''
    const audioStream = new MediaStream(audioTracks)
    const recorder = new MediaRecorder(audioStream)
    const chunks: BlobPart[] = []
    recorder.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data)
    }
    recorder.onstop = () => {
        audioBlob.value = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })
    }
    recorder.start()
    mediaRecorder.value = recorder
    recording.value = true

    const SpeechRecognitionAPI = typeof window !== 'undefined' && (window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition)
    if (SpeechRecognitionAPI) {
        try {
            const recognition = new SpeechRecognitionAPI()
            recognition.continuous = true
            recognition.interimResults = true
            // Use browser language for multilingual support (fallback to English)
            recognition.lang = navigator.language || 'en-US'
            recognition.onresult = (event: SpeechRecognitionEvent) => {
                let full = ''
                for (let i = 0; i < event.results.length; i++) {
                    full += event.results[i][0].transcript
                }
                if (full) {
                    liveTranscript.value = full.replace(/\s+/g, ' ').trim()
                }
            }
            recognition.onerror = (err) => {
                console.log('error', err);
                // Ignore no-speech and other non-fatal errors
            }
            recognition.start()
            speechRecognition.value = recognition
        } catch {
            // Speech recognition not supported or failed to start
        }
    }
}

function stopRecording() {
    if (speechRecognition.value) {
        try {
            speechRecognition.value.stop()
        } catch {
            // already stopped
        }
        speechRecognition.value = null
    }
    if (mediaRecorder.value && recording.value) {
        mediaRecorder.value.stop()
        mediaRecorder.value = null
        recording.value = false
    }
}

function clearRecording() {
    audioBlob.value = null
    liveTranscript.value = ''
}

async function submitAnswer() {
    if (!session.value?.id || !currentQuestion.value?.id || !audioBlob.value) return
    submitting.value = true
    try {
        const formData = new FormData()
        formData.append('session_id', session.value.id)
        formData.append('question_id', currentQuestion.value.id)
        formData.append('audio_chunk', audioBlob.value, 'answer.webm')

        // Backend transcribes with Whisper and returns the transcript
        const response = await $fetch<{ success: boolean; transcript: string }>('/api/interview/answer', {
            baseURL: INTERVIEW_API_BASE,
            method: 'POST',
            body: formData,
        })

        // Store the high-quality Whisper transcript (fallback to live transcript if empty)
        const whisperTranscript = response?.transcript || liveTranscript.value || ''
        
        // Add to transcript collection for PDF
        allTranscripts.value.push({
            questionNumber: questionNumber.value,
            questionText: currentQuestion.value.question_text,
            answerText: whisperTranscript,
        })

        // Update live transcript display with Whisper result (better quality)
        if (response?.transcript) {
            liveTranscript.value = response.transcript
        }

        await fetchNextQuestion()
    } catch (err: any) {
        toast.add({
            title: 'Error',
            description: err?.data?.detail || err?.message || 'Failed to submit answer',
            color: 'error',
        })
    } finally {
        submitting.value = false
    }
}

async function completeInterview() {
    if (!session.value?.id) return
    try {
        // 1. Complete the interview session
        await useInterviewApi('/api/interview/complete', {
            method: 'POST',
            body: { session_id: session.value.id },
        })

        // 2. Generate and upload transcript PDF
        if (allTranscripts.value.length > 0) {
            await uploadTranscriptPdf()
        }
    } catch {
        // Non-fatal
    }
}

// Generate a simple PDF from transcripts and upload to backend
async function uploadTranscriptPdf() {
    if (!session.value?.id || allTranscripts.value.length === 0) return

    try {
        // Build PDF content as text (simple format)
        let pdfContent = `INTERVIEW TRANSCRIPT\n`
        pdfContent += `${'='.repeat(50)}\n\n`
        pdfContent += `Session ID: ${session.value.id}\n`
        pdfContent += `Date: ${new Date().toLocaleString()}\n\n`
        pdfContent += `${'='.repeat(50)}\n\n`

        for (const entry of allTranscripts.value) {
            pdfContent += `QUESTION ${entry.questionNumber}:\n`
            pdfContent += `${entry.questionText}\n\n`
            pdfContent += `ANSWER:\n`
            pdfContent += `${entry.answerText || '(No response recorded)'}\n\n`
            pdfContent += `${'-'.repeat(40)}\n\n`
        }

        // Create a text file blob (backend can convert to PDF or store as-is)
        const blob = new Blob([pdfContent], { type: 'text/plain' })
        const formData = new FormData()
        formData.append('session_id', session.value.id)
        formData.append('file', blob, `transcript_${session.value.id}.txt`)

        await $fetch('/api/interview/upload-transcript', {
            baseURL: INTERVIEW_API_BASE,
            method: 'POST',
            body: formData,
        })
    } catch (err) {
        console.error('Failed to upload transcript:', err)
        // Non-fatal - don't block interview completion
    }
}

onMounted(() => {
    if (token.value) validateToken()
    else {
        error.value = true
    }
})

watch(token, (t) => {
    if (t) {
        error.value = false
        validateToken()
    } else {
        error.value = true
    }
})

watch(
    () => step.value,
    async (newStep) => {
        if (newStep === 'question' && localStream.value) {
            await nextTick()
            if (videoRef.value) {
                videoRef.value.srcObject = localStream.value
            }
        }
    },
    { immediate: true }
)

onBeforeUnmount(() => {
    localStream.value?.getTracks().forEach((t) => t.stop())
    localStream.value = null
})
</script>

