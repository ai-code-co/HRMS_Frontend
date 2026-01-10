<template>
    <div @click="$emit('select')" class="cursor-pointer">
        <div :class="[
            'w-full text-left p-6 bg-white rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group',
            selected
                ? 'border-indigo-500 shadow-xl'
                : 'border-slate-50 hover:border-indigo-100 shadow-sm'
        ]">
            <div class="flex items-start gap-4">
                <div :class="[
                    'p-4 rounded-2xl transition-colors',
                    selected
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'bg-slate-50 text-slate-400 group-hover:text-indigo-400'
                ]">
                    <UIcon name="i-heroicons-receipt-refund" class="w-5 h-5" />
                </div>

                <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between mb-1">
                        <h3 class="font-black text-slate-800 text-sm truncate">
                            {{ record.month }} {{ record.year }}
                        </h3>
                        <UBadge variant="soft" color="success" size="xs" class="font-black uppercase tracking-widest">
                            {{ record.status }}
                        </UBadge>
                    </div>

                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {{ record.payslipId }}
                    </p>

                    <div class="flex items-center justify-between mt-2">
                        <p class="text-xs font-black text-slate-700">
                            ₹{{ record.netPaid.toLocaleString() }}
                        </p>
                        <p class="text-[10px] font-medium text-slate-300">
                            {{ record.paymentDate }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    record: any
    selected: boolean
}>()

defineEmits<{
    (e: 'select'): void
}>()
</script>
