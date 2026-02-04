<template>
    <UModal v-model:open="modelOpen" :overlay="true" :ui="{
        overlay: 'bg-slate-900/40 backdrop-blur-sm',
        content: 'w-[90vw] sm:w-full sm:max-w-md rounded-xl overflow-hidden'
    }">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                    <div :class="[actionConfig.bgColor, 'p-2 rounded-lg flex items-center']">
                        <UIcon :name="actionConfig.icon" :class="[actionConfig.textColor, 'w-5 h-5']" />
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-slate-900">{{ actionConfig.title }}</h3>
                        <p class="text-xs text-slate-500 font-medium">Leave Request #LV-{{ leave?.id }}</p>
                    </div>
                </div>
                <UButton color="secondary" variant="ghost" icon="i-heroicons-x-mark-20-solid"
                    class="-my-1 rounded-full cursor-pointer" @click="close" :disabled="loading" />
            </div>
        </template>

        <template #body>
            <div v-if="leave" class="space-y-4 px-2">
                <!-- Leave Summary -->
                <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span class="text-indigo-600 font-bold text-sm">{{ getInitials(leave.employee_name) }}</span>
                        </div>
                        <div>
                            <p class="font-bold text-sm text-slate-800">{{ leave.employee_name }}</p>
                            <p class="text-xs text-slate-500">{{ leave.leave_type }}</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-xs">
                        <div>
                            <span class="text-slate-400">From:</span>
                            <span class="ml-1 font-medium text-slate-700">{{ formatDate(leave.from_date) }}</span>
                        </div>
                        <div>
                            <span class="text-slate-400">To:</span>
                            <span class="ml-1 font-medium text-slate-700">{{ formatDate(leave.to_date) }}</span>
                        </div>
                        <div class="col-span-2">
                            <span class="text-slate-400">Duration:</span>
                            <span class="ml-1 font-medium text-slate-700">{{ leave.no_of_days }} {{ leave.no_of_days === 1 ? 'day' : 'days' }}</span>
                        </div>
                    </div>
                </div>

                <!-- Notes Input -->
                <div class="space-y-2">
                    <label class="text-xs font-semibold text-slate-500 uppercase">
                        {{ action === 'Approved' ? 'Approval Notes (Optional)' : 'Rejection Reason' }}
                        <span v-if="action === 'Rejected'" class="text-rose-500">*</span>
                    </label>
                    <UTextarea
                        v-model="notes"
                        :placeholder="action === 'Approved' ? 'Add any notes for the employee...' : 'Please provide a reason for rejection...'"
                        :rows="3"
                        class="w-full"
                    />
                    <p v-if="action === 'Rejected' && showError && !notes.trim()" class="text-xs text-rose-500">
                        Rejection reason is required
                    </p>
                </div>

                <!-- Confirmation Message -->
                <div :class="[actionConfig.alertBg, 'p-3 rounded-lg border', actionConfig.alertBorder]">
                    <p :class="[actionConfig.alertText, 'text-sm']">
                        <UIcon :name="actionConfig.alertIcon" class="w-4 h-4 inline mr-1" />
                        {{ actionConfig.confirmMessage }}
                    </p>
                </div>
            </div>
        </template>

        <template #footer>
            <div class="flex w-full gap-3">
                <UButton
                    block
                    color="neutral"
                    variant="outline"
                    size="lg"
                    class="flex-1 cursor-pointer"
                    :disabled="loading"
                    @click="close"
                >
                    Cancel
                </UButton>
                <UButton
                    block
                    :color="action === 'Approved' ? 'success' : 'error'"
                    size="lg"
                    class="flex-1 font-bold cursor-pointer"
                    :loading="loading"
                    :disabled="loading"
                    @click="handleConfirm"
                >
                    {{ action === 'Approved' ? 'Approve' : 'Reject' }}
                </UButton>
            </div>
        </template>
    </UModal>
</template>

<script setup lang="ts">
interface Leave {
    id: number
    employee_name: string
    leave_type: string
    from_date: string
    to_date: string
    no_of_days: number
    reason: string
    status: string
}

const props = defineProps<{
    open: boolean
    leave: Leave | null
    action: 'Approved' | 'Rejected'
    loading?: boolean
}>()

const emit = defineEmits(['update:open', 'confirm'])

const notes = ref('')
const showError = ref(false)

const modelOpen = computed({
    get: () => props.open,
    set: (value: boolean) => emit('update:open', value)
})

// Reset notes when modal opens
watch(() => props.open, (isOpen) => {
    if (isOpen) {
        notes.value = ''
        showError.value = false
    }
})

const actionConfig = computed(() => {
    if (props.action === 'Approved') {
        return {
            title: 'Approve Leave',
            icon: 'i-lucide-check-circle',
            bgColor: 'bg-emerald-100',
            textColor: 'text-emerald-600',
            alertBg: 'bg-emerald-50',
            alertBorder: 'border-emerald-200',
            alertText: 'text-emerald-700',
            alertIcon: 'i-lucide-info',
            confirmMessage: 'This will approve the leave request and notify the employee.'
        }
    }
    return {
        title: 'Reject Leave',
        icon: 'i-lucide-x-circle',
        bgColor: 'bg-rose-100',
        textColor: 'text-rose-600',
        alertBg: 'bg-rose-50',
        alertBorder: 'border-rose-200',
        alertText: 'text-rose-700',
        alertIcon: 'i-lucide-alert-triangle',
        confirmMessage: 'This will reject the leave request and notify the employee with your reason.'
    }
})

const close = () => {
    if (!props.loading) {
        modelOpen.value = false
    }
}

const handleConfirm = () => {
    if (props.action === 'Rejected' && !notes.value.trim()) {
        showError.value = true
        return
    }

    emit('confirm', {
        id: props.leave?.id,
        action: props.action,
        notes: notes.value.trim()
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
    if (!name) return '?'
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}
</script>
