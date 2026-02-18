<template>
    <UModal v-model:open="modelOpen" :overlay="true" :ui="{
        overlay: 'bg-slate-900/40 backdrop-blur-sm',
        content: 'w-[90vw] sm:w-full sm:max-w-4xl'
    }">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <div>
                    <h3 class="text-lg font-semibold text-slate-800">Modify Salary Structure</h3>
                    <p class="text-xs text-slate-500 font-medium mt-0.5">
                        Configuring Payroll for {{ employeeName }}
                    </p>
                </div>
                <UButton icon="i-heroicons-x-mark" variant="ghost" class="rounded-full cursor-pointer"
                    @click="modelOpen = false" />
            </div>
        </template>

        <template #body>
            <UForm :state="state" class="w-full" @submit="onSubmit">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <!-- Earnings Section -->
                    <div class="space-y-4">
                        <div class="flex items-center gap-2 pb-2 border-b border-emerald-100">
                            <UIcon name="i-lucide-plus-circle" class="w-4 h-4 text-emerald-500" />
                            <h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Earnings / Credits
                            </h4>
                        </div>
                        <div class="space-y-4">
                            <UFormField label="Basic Salary" name="basic">
                                <UInput v-model="state.basic" type="number" size="xl" placeholder="0"
                                    color="secondary" variant="outline" :ui="{ leading: 'text-emerald-500' }">
                                    <template #leading>
                                        <span class="text-emerald-500 font-semibold">₹</span>
                                    </template>
                                </UInput>
                            </UFormField>
                            <UFormField label="House Rent (HRA)" name="hra">
                                <UInput v-model="state.hra" type="number" size="xl" placeholder="0"
                                    color="secondary" variant="outline">
                                    <template #leading>
                                        <span class="text-emerald-500 font-semibold">₹</span>
                                    </template>
                                </UInput>
                            </UFormField>
                            <UFormField label="Medical Allowance" name="medicalAllowance">
                                <UInput v-model="state.medicalAllowance" type="number" size="xl" placeholder="0"
                                    color="secondary" variant="outline">
                                    <template #leading>
                                        <span class="text-emerald-500 font-semibold">₹</span>
                                    </template>
                                </UInput>
                            </UFormField>
                            <UFormField label="Conveyance" name="conveyance">
                                <UInput v-model="state.conveyance" type="number" size="xl" placeholder="0"
                                    color="secondary" variant="outline">
                                    <template #leading>
                                        <span class="text-emerald-500 font-semibold">₹</span>
                                    </template>
                                </UInput>
                            </UFormField>
                            <UFormField label="Special Allowance" name="special">
                                <UInput v-model="state.special" type="number" size="xl" placeholder="0"
                                    color="secondary" variant="outline">
                                    <template #leading>
                                        <span class="text-emerald-500 font-semibold">₹</span>
                                    </template>
                                </UInput>
                            </UFormField>
                        </div>
                    </div>

                    <!-- Deductions Section -->
                    <div class="space-y-4">
                        <div class="flex items-center gap-2 pb-2 border-b border-rose-100">
                            <UIcon name="i-lucide-minus-circle" class="w-4 h-4 text-rose-500" />
                            <h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Deductions / Debits
                            </h4>
                        </div>
                        <div class="space-y-4">
                            <UFormField label="Provident Fund" name="pf">
                                <UInput v-model="state.pf" type="number" size="xl" placeholder="0"
                                    color="secondary" variant="outline">
                                    <template #leading>
                                        <span class="text-rose-500 font-semibold">₹</span>
                                    </template>
                                </UInput>
                            </UFormField>
                            <UFormField label="Professional Tax" name="professionalTax">
                                <UInput v-model="state.professionalTax" type="number" size="xl" placeholder="0"
                                    color="secondary" variant="outline">
                                    <template #leading>
                                        <span class="text-rose-500 font-semibold">₹</span>
                                    </template>
                                </UInput>
                            </UFormField>
                            <UFormField label="Income Tax (TDS)" name="tax">
                                <UInput v-model="state.tax" type="number" size="xl" placeholder="0"
                                    color="secondary" variant="outline">
                                    <template #leading>
                                        <span class="text-rose-500 font-semibold">₹</span>
                                    </template>
                                </UInput>
                            </UFormField>
                            <UFormField label="Health Insurance" name="insurance">
                                <UInput v-model="state.insurance" type="number" size="xl" placeholder="0"
                                    color="secondary" variant="outline">
                                    <template #leading>
                                        <span class="text-rose-500 font-semibold">₹</span>
                                    </template>
                                </UInput>
                            </UFormField>
                        </div>
                    </div>
                </div>
            </UForm>
        </template>

        <template #footer>
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                <div class="flex items-center gap-6">
                    <div class="flex flex-col">
                        <span class="text-[10px] font-bold text-slate-400 uppercase">Gross Total</span>
                        <span class="text-sm font-bold text-slate-800">₹{{ currentGross.toLocaleString() }}</span>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-[10px] font-bold text-slate-400 uppercase">Net Payable</span>
                        <span class="text-lg font-bold text-indigo-600">₹{{ currentNet.toLocaleString() }}</span>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <UButton label="Cancel" color="neutral" variant="ghost" @click="modelOpen = false" />
                    <UButton label="Save Changes" color="primary" icon="i-lucide-save" @click="onSubmit" />
                </div>
            </div>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import type { SalaryStructure } from '~/stores/salary'

const props = defineProps<{
    open: boolean
    initialStructure: SalaryStructure
    employeeName: string
}>()

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void
    (e: 'save', structure: SalaryStructure): void
}>()

const modelOpen = computed({
    get: () => props.open,
    set: (value: boolean) => emit('update:open', value)
})

const state = ref<SalaryStructure>({ ...props.initialStructure })

watch(() => props.initialStructure, (newVal) => {
    state.value = { ...newVal }
}, { deep: true })

watch(() => props.open, (isOpen) => {
    if (isOpen) {
        state.value = { ...props.initialStructure }
    }
})

const currentGross = computed(() =>
    (state.value.basic || 0) + (state.value.hra || 0) +
    (state.value.medicalAllowance || 0) + (state.value.conveyance || 0) + (state.value.special || 0)
)

const currentDeductions = computed(() =>
    (state.value.pf || 0) + (state.value.tax || 0) +
    (state.value.professionalTax || 0) + (state.value.insurance || 0)
)

const currentNet = computed(() => currentGross.value - currentDeductions.value)

const onSubmit = () => {
    emit('save', { ...state.value })
    // Parent closes modal after successful API update
}
</script>
