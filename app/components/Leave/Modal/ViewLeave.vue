<template>
    <UModal v-model:open="modelOpen" :overlay="true" :ui="{ overlay: 'bg-slate-900/40 backdrop-blur-sm' }" size="2xl">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <h3 class="text-lg font-semibold text-slate-800">Leave Details</h3>
                <UButton icon="i-heroicons-x-mark" variant="ghost" class="rounded-full cursor-pointer" @click="close" />
            </div>
        </template>

        <template #body>
            <div v-if="leave" class="space-y-8">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Left Column -->
                    <div class="space-y-3">
                        <div>
                            <p class="text-sm font-semibold text-slate-600">Leave Type</p>
                            <p class="text-sm font-medium text-slate-800 mt-1">{{ leave.type }}</p>
                        </div>

                        <div>
                            <p class="text-sm font-semibold text-slate-600">From Date</p>
                            <p class="text-sm font-medium text-slate-800 mt-1">{{ leave.startDate }}</p>
                        </div>

                        <div>
                            <p class="text-sm font-semibold text-slate-600">Number of Days</p>
                            <p class="text-sm font-medium text-slate-800 mt-1">{{ leave.duration }}</p>
                        </div>
                    </div>

                    <!-- Right Column -->
                    <div class="space-y-3">
                        <div>
                            <p class="text-sm font-semibold text-slate-600">Applied Date</p>
                            <p class="text-sm font-medium text-slate-800 mt-1">{{ leave.appliedDate }}</p>
                        </div>

                        <div>
                            <p class="text-sm font-semibold text-slate-600">To Date</p>
                            <p class="text-sm font-medium text-slate-800 mt-1">{{ leave.endDate }}</p>
                        </div>

                        <div>
                            <p class="text-sm font-semibold text-slate-600">Status</p>
                            <p class="text-sm font-medium text-slate-800 mt-1 capitalize">{{ leave.status }}</p>
                        </div>

                        <div v-if="leave.approverComment">
                            <p class="text-sm font-semibold text-slate-600">Approver Comment</p>
                            <p class="text-sm text-slate-700 mt-1 italic">{{ leave.approverComment }}</p>
                        </div>
                    </div>
                </div>

                <div class="space-y-3">
                    <p class="text-sm font-semibold text-slate-600">Reason</p>
                    <p class="text-sm text-slate-700 leading-relaxed">{{ leave.reason }}</p>
                </div>

                <div v-if="leave.doc_link_url" class="space-y-2">
                    <p class="text-xs font-semibold uppercase text-slate-500">
                        Supporting Document
                    </p>

                    <div class="relative bg-slate-50 rounded-lg p-2 border border-slate-200">
                        <img :src="getDocumentUrl(leave.doc_link_url)" :alt="leave.type"
                            class="w-full h-32 object-cover rounded-md" />

                        <a :href="getDocumentUrl(leave.doc_link_url)" target="_blank" download
                            class="absolute top-2 right-2">
                            <UButton icon="i-lucide-download" color="primary" variant="solid" size="xs"
                                class="rounded-full shadow-md cursor-pointer" />
                        </a>
                    </div>
                </div>

                <div>
                    <UButton v-if="leave.status === 'pending'" block color="error" size="xl" @click="handleCancel">
                        Cancel Leave
                    </UButton>
                    <UButton v-if="leave.status === 'cancelled'" block color="error" size="xl" disabled>
                        Cancelled
                    </UButton>
                </div>
            </div>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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

const statusIcon = computed(() => {
    const icons = {
        'approved': 'i-lucide-check-circle',
        'pending': 'i-lucide-clock',
        'rejected': 'i-lucide-x-circle',
        'cancelled': 'i-lucide-x-circle'
    }
    return icons[props.leave?.status as keyof typeof icons] || 'i-lucide-info'
})

const getDocumentUrl = (docLink: string) => {
    if (!docLink) return ''
    // If it's already a full URL, return as is
    if (docLink.startsWith('http')) return docLink
    // Otherwise construct cloudinary URL
    return `https://res.cloudinary.com/dw5x6ozba/image/upload/${docLink}`
}

const handleCancel = async () => {
    if (props.leave) {
        emit('cancel', props.leave.id)
        close()
    }
}
</script>
