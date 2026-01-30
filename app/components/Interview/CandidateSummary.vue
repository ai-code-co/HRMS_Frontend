<script setup lang="ts">
import { computed } from 'vue'
import type { CandidateDetail } from '~/types/interview'

interface CandidateUser {
    name: string
    job: string
    candidateId: string
    email: string
    phone: string
    status: string
    createdAt: string
}

const props = defineProps<{
    candidate: CandidateDetail | null
}>()

const candidateUser = computed(() => {
    if (!props.candidate) return null
    return {
        name: props.candidate.name,
        job: props.candidate.job?.title ?? '-',
        candidateId: props.candidate.id,
        email: props.candidate.email,
        phone: props.candidate.phone ?? '-',
        status: props.candidate.status,
        createdAt: props.candidate.created_at,
    }
})

const profileInfo = computed(() => {
    if (!candidateUser.value) return []

    return [
        { label: 'Email', value: candidateUser.value.email ?? '-' },
        { label: 'Phone', value: candidateUser.value.phone ?? '-' },
        { label: 'Status', value: candidateUser.value.status ?? '-' },
        { label: 'Applied Date', value: formatDate(candidateUser.value.createdAt) ?? '-' },
        { label: 'Job Title', value: candidateUser.value.job ?? '-' },
    ]
})

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

const statusClass = computed(() => {
    if (!candidateUser.value) return ''
    const status = candidateUser.value.status.toLowerCase()
    switch (status) {
        case 'approved':
            return 'bg-emerald-50 text-emerald-600 border border-emerald-100'
        case 'rejected':
            return 'bg-red-50 text-red-600 border border-red-100'
        case 'reviewing':
            return 'bg-amber-50 text-amber-600 border border-amber-100'
        default:
            return 'bg-slate-50 text-slate-600 border border-slate-100'
    }
})
</script>

<template>
    <section
        class="bg-white border border-slate-100 rounded-2xl shadow-sm p-3 md:p-4 flex flex-col md:flex-row items-center md:items-start gap-10">
        <div class="relative group shrink-0">
            <div
                class="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner flex items-center justify-center bg-indigo-100">
                <span class="text-indigo-600 font-bold text-3xl md:text-4xl">
                    {{ candidateUser ? getInitials(candidateUser.name) : '--' }}
                </span>
            </div>
        </div>

        <div class="flex-1 space-y-4 w-full">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-2">
                <div>
                    <div class="flex items-center gap-3 mb-1">
                        <h2 class="text-3xl font-black text-slate-800 tracking-tight">
                            {{ candidateUser?.name ?? '-' }}
                        </h2>

                        <div v-if="candidateUser" :class="statusClass"
                            class="px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5">
                            <div :class="{
                                'bg-emerald-500': candidateUser.status.toLowerCase() === 'approved',
                                'bg-red-500': candidateUser.status.toLowerCase() === 'rejected',
                                'bg-amber-500': candidateUser.status.toLowerCase() === 'reviewing',
                                'bg-slate-500': true
                            }"
                                class="w-1.5 h-1.5 rounded-full animate-pulse" />
                            <span class="hidden md:inline uppercase">
                                {{ candidateUser.status }}
                            </span>
                        </div>
                    </div>

                    <p class="text-lg font-bold text-slate-400">{{ candidateUser?.job ?? '-' }}</p>
                    <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                        Candidate ID: {{ candidateUser?.candidateId ?? '-' }}
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                <div v-for="(info, i) in profileInfo" :key="i" class="flex flex-col gap-0.5">
                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {{ info.label }}
                    </span>
                    <span class="text-sm font-bold text-slate-700 truncate">
                        {{ info.value }}
                    </span>
                </div>
            </div>
        </div>
    </section>
</template>
