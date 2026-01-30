<template>
    <div class="sticky top-0 z-20">
        <!-- Back bar: separate from header, page background -->
        <div class="px-8 py-3 bg-[#F8FAFC] border-b border-slate-100">
            <UButton
                color="neutral"
                variant="ghost"
                size="sm"
                icon="i-lucide-arrow-left"
                class="text-slate-600 hover:text-slate-900 -ml-2 rounded-xl"
                @click="handleExit"
            >
                Back
            </UButton>
        </div>
        <!-- Header -->
        <header class="px-8 py-5 flex items-center justify-between border-b border-slate-100 bg-white/50 backdrop-blur-sm">
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
                <UButton color="primary" variant="outline" class="rounded-xl" @click="$emit('edit')">
                    Edit Structure
                </UButton>
            </div>
        </header>
    </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { activeEmployee: employee, clearSelection } = useEmployeeContext()

defineEmits<{
    (e: 'edit'): void
}>()

const handleExit = () => {
    if (route.path.startsWith('/employeSalary')) {
        navigateTo('/salary')
    } else {
        clearSelection()
    }
}
</script>
