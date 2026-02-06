<template>
    <div
        class="relative flex flex-col sm:flex-row sm:items-center justify-between p-2 md:p-4 bg-slate-50/50 rounded-xl border border-slate-100 group hover:border-indigo-200 hover:bg-white transition-all">
        <div class="flex items-center gap-3 mb-3 sm:mb-0">
            <UAvatar :src="avatar" :alt="name" size="md" />
            <div>
                <h4 class="text-sm font-semibold text-slate-800">{{ name }}</h4>
                <p class="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    {{ employeeId }} &bull; {{ designation }}
                </p>
            </div>
        </div>
        <div class="flex items-center gap-6 mr-0 sm:mr-6 justify-between">
            <div class="text-right">
                <p class="text-sm font-bold text-slate-800">₹{{ netPaid.toLocaleString() }}</p>
                <p class="text-[9px] font-medium text-slate-400 uppercase">Net Paid</p>
            </div>
            <div class="flex flex-col items-end">
                <UBadge :color="statusColor" variant="subtle" size="xs">
                    {{ status }}
                </UBadge>
                <p class="text-[9px] font-medium text-slate-400 mt-1">{{ paymentDate }}</p>
            </div>
        </div>
        <UButton class="absolute top-2 right-2 cursor-pointer" icon="i-lucide-external-link" color="neutral" variant="ghost" size="xs"
            @click="$emit('view')" />
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    id: string
    name: string
    avatar: string
    employeeId: string
    designation: string
    netPaid: number
    status: 'Paid' | 'Processing' | 'Failed' | 'On Hold'
    paymentDate: string
}>()

defineEmits<{
    (e: 'view'): void
}>()

const statusColor = computed(() => {
    const colors: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
        'Paid': 'success',
        'Processing': 'warning',
        'Failed': 'error',
        'On Hold': 'info'
    }
    return colors[props.status] || 'info'
})
</script>
