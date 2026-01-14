<template>
    <UModal v-model:open="modelOpen" :overlay="true" :ui="{
        overlay: 'bg-slate-900/40 backdrop-blur-sm',
        content: 'w-[90vw] sm:w-full sm:max-w-2xl rounded-xl overflow-hidden'
    }">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                    <div :class="[statusColor.bg, 'p-2 rounded-lg flex items-center']">
                        <UIcon :name="statusIcon" :class="[statusColor.text, 'w-5 h-5']" />
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-slate-900">Leave Details</h3>
                        <p class="text-xs text-slate-500 font-medium tracking-wide uppercase">ID: #LV-{{ leave?.id }}
                        </p>
                    </div>
                </div>
                <UButton color="secondary" variant="ghost" icon="i-heroicons-x-mark-20-solid"
                    class="-my-1 rounded-full cursor-pointer" @click="close" />
            </div>
        </template>

        <template #body>
            <div v-if="leave" class="space-y-6 px-2 lg:px-4">
                <div
                    class="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Leave Type</p>
                        <p class="text-lg font-bold text-slate-800">{{ leave.type }}</p>
                    </div>
                    <div class="text-left">
                        <UBadge :color="statusColor.badge" variant="subtle" class="capitalize px-3 py-1">
                            {{ leave.status }}
                        </UBadge>
                    </div>
                </div>

                <div class="flex gap-6 items-center justify-between py-2">
                    <div class="space-y-1">
                        <div class="flex items-center gap-2 text-slate-500">
                            <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
                            <span class="text-xs font-semibold uppercase">From Date</span>
                        </div>
                        <p class="text-sm font-bold text-slate-900">{{ formatDateFromISO(leave.startDate) }}</p>
                    </div>

                    <div class="space-y-1 text-right md:text-left">
                        <div class="flex items-center gap-2 text-slate-500 justify-end md:justify-start">
                            <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
                            <span class="text-xs font-semibold uppercase">To Date</span>
                        </div>
                        <p class="text-sm font-bold text-slate-900">{{ formatDateFromISO(leave.endDate) }}</p>
                    </div>
                </div>

                <USeparator />

                <div class="grid grid-cols-2 gap-6">
                    <div>
                        <p class="text-xs font-semibold text-slate-500 uppercase">Applied On</p>
                        <p class="text-sm font-medium text-slate-800 mt-1">{{ formatDateFromISO(leave.appliedDate) }}
                        </p>
                    </div>
                    <div v-if="leave.approverComment">
                        <p class="text-xs font-semibold text-slate-500 uppercase">Approver Note</p>
                        <p class="text-sm font-medium text-slate-800 mt-1 italic">"{{ leave.approverComment }}"</p>
                    </div>
                </div>

                <div class="space-y-2">
                    <p class="text-xs font-semibold text-slate-500 uppercase">Reason for Leave</p>
                    <div class="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p class="text-sm text-slate-700 leading-relaxed">{{ leave.reason }}</p>
                    </div>
                </div>

                <div v-if="leave.doc_link_url" class="space-y-3">
                    <p class="text-xs font-semibold uppercase text-slate-500">Supporting Document</p>
                    <div
                        class="group relative overflow-hidden rounded-xl border border-slate-200 bg-white hover:border-blue-400 transition-colors">
                        <div class="flex items-center p-3 gap-4">
                            <div
                                class="w-16 h-16 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                                <img :src="getDocumentUrl(leave.doc_link_url)" class="w-full h-full object-cover" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-slate-900 truncate">Attachment Preview</p>
                                <p class="text-xs text-slate-500">Click to view full document</p>
                            </div>
                            <UButton :to="getDocumentUrl(leave.doc_link_url)" target="_blank" icon="i-heroicons-eye"
                                color="neutral" variant="solid" size="sm" label="View" />
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <template #footer>
            <div class="flex w-full gap-3">
                <UButton v-if="leave?.status === 'pending'" block color="error" variant="soft" icon="i-heroicons-trash"
                    size="lg" class="flex-1 font-bold" @click="handleCancel">
                    Cancel Request
                </UButton>
                <UButton v-else-if="leave?.status === 'cancelled'" block color="error" disabled variant="soft" size="lg"
                    class="flex-1">
                    Request was cancelled
                </UButton>
                <UButton v-else block color="primary" variant="outline" size="lg" class="flex-1" @click="close">
                    Close
                </UButton>
            </div>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import { formatDateFromISO } from '~/utils/function'

interface Leave {
    id: number
    type: string
    startDate: string
    endDate: string
    duration: string
    status: 'approved' | 'pending' | 'rejected' | 'cancelled'
    appliedDate: string
    reason: string
    doc_link_url?: string
    approverComment?: string
}

const props = defineProps<{
    open: boolean
    leave: Leave | null
}>()

const emit = defineEmits(['update:open', 'close', 'cancel'])

const modelOpen = computed({
    get: () => props.open,
    set: (value: boolean) => emit('update:open', value)
})

const close = () => {
    modelOpen.value = false
    emit('close')
}
const statusColor = computed(() => {
    switch (props.leave?.status) {
        case 'approved':
            return { bg: 'bg-emerald-200', text: 'text-emerald-600', badge: 'success' }
        case 'pending':
            return { bg: 'bg-amber-200', text: 'text-amber-600', badge: 'warning' }
        case 'rejected':
            return { bg: 'bg-rose-200', text: 'text-rose-600', badge: 'error' }
        case 'cancelled':
            return { bg: 'bg-slate-200', text: 'text-slate-500', badge: 'error' }
        default:
            return { bg: 'bg-blue-200', text: 'text-blue-600', badge: 'info' }
    }
})

const statusIcon = computed(() => {
    const icons = {
        'approved': 'i-heroicons-check-circle',
        'pending': 'i-heroicons-clock',
        'rejected': 'i-heroicons-x-circle',
        'cancelled': 'i-heroicons-archive-box-x-mark'
    }
    return icons[props.leave?.status as keyof typeof icons] || 'i-heroicons-information-circle'
})

const getDocumentUrl = (docLink: string) => {
    if (!docLink) return ''
    if (docLink.startsWith('http')) return docLink
    return `https://res.cloudinary.com/dw5x6ozba/image/upload/${docLink}`
}

const handleCancel = async () => {
    if (props.leave) {
        emit('cancel', props.leave.id)
        close()
    }
}
</script>
