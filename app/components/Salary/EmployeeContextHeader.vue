<template>
    <header
        class="px-8 py-5 flex items-center justify-between border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
        <div class="flex items-center gap-3">
            <UAvatar :src="employee?.photo_url || ''" :alt="employee?.full_name || ''" size="lg" />
            <div>
                <h2 class="text-lg font-bold text-slate-800">{{ employee?.full_name || 'Employee' }}</h2>
                <p class="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest">
                    Staff Payroll Records
                </p>
            </div>
        </div>
        <div class="flex items-center gap-3">
            <UButton color="error" variant="link" size="sm" @click="handleExit">
                Exit View
            </UButton>
            <UButton color="primary" variant="outline" class="rounded-xl" @click="$emit('edit')">
                Edit Structure
            </UButton>
        </div>
    </header>
</template>

<script setup lang="ts">
const { activeEmployee: employee, clearSelection } = useEmployeeContext()

defineEmits<{
    (e: 'edit'): void
}>()

const handleExit = () => {
    clearSelection()
}
</script>
