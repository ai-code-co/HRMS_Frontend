<template>
    <div class="max-w-[1400px] mx-auto p-4 md:p-6 space-y-6 pb-20">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SalaryStatCard label="Monthly Payroll" :value="formatCurrency(store.orgStats?.monthlyPayroll || 0)"
                :trend="store.orgStats?.monthlyPayrollTrend" sub="vs last month" icon="i-lucide-dollar-sign"
                color="indigo" />
            <SalaryStatCard label="Total Deductions" :value="formatCurrency(store.orgStats?.totalDeductions || 0)"
                :trend="store.orgStats?.deductionsTrend" sub="Tax & Benefits" icon="i-lucide-arrow-down-right"
                color="rose" />
            <SalaryStatCard label="Paid Employees" :value="`${store.orgStats?.paidEmployees?.toLocaleString() || 0}`"
                :trend="store.orgStats?.paidEmployeesTrend"
                :sub="`of ${store.orgStats?.totalEmployees?.toLocaleString() || 0} total`" icon="i-lucide-users"
                color="emerald" />
            <SalaryStatCard label="Processing" :value="`${store.orgStats?.processingCount || 0}`"
                :trend="store.orgStats?.processingTrend" sub="Pending Action" icon="i-lucide-activity" color="amber" />
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <!-- Recent Disbursements -->
            <div class="xl:col-span-2">
                <UCard :ui="{ body: 'p-6' }">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-lg font-semibold text-slate-800">Recent Disbursements</h3>
                                <p class="text-xs text-slate-400 font-medium mt-0.5">
                                    Status of the most recent organization-wide payouts.
                                </p>
                            </div>
                        </div>
                    </template>

                    <div class="space-y-3">
                        <SalaryDisbursementRow v-for="emp in employees" :key="emp.id" :id="emp.id" :name="emp.name"
                            :avatar="emp.avatar" :employee-id="emp.employeeId" :designation="emp.designation"
                            :net-paid="emp.netPaid" :status="emp.status" :payment-date="emp.paymentDate"
                            @view="handleSelectEmployee(emp.id)" />
                    </div>
                </UCard>
            </div>

            <!-- Sidebar -->
            <div class="space-y-4 h-full">
                <!-- Cost Distribution -->
                <SalaryCostDistribution :core-salaries="store.costDistribution?.coreSalaries || 72"
                    :bonuses="store.costDistribution?.bonuses || 18" :misc="store.costDistribution?.misc || 10"
                    :budget-used="store.costDistribution?.budgetUsed || 1400000" class="h-full" />

                <!-- Compliance Status -->
                <!-- <UCard class="bg-indigo-600 border-0" :ui="{ body: 'p-6' }">
                    <div class="flex items-center gap-2 mb-4">
                        <UIcon name="i-lucide-shield-check" class="w-5 h-5 text-indigo-200" />
                        <h4 class="text-sm font-semibold text-white uppercase tracking-wider">Compliance Status</h4>
                    </div>
                    <p class="text-2xl font-bold text-white mb-2">
                        {{ store.complianceStatus?.verifiedPercent || 98.4 }}% Verified
                    </p>
                    <p class="text-xs text-indigo-200 mb-5 leading-relaxed">
                        Tax declarations for FY 2025-26 are largely completed.
                        {{ store.complianceStatus?.pendingVerification || 42 }} staff members require manual
                        verification.
                    </p>
                    <UButton color="neutral" variant="solid" block class="bg-white text-indigo-600 hover:bg-indigo-50">
                        View Issues
                    </UButton>
                </UCard> -->
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useSalaryStore } from '@/stores/salary'

const store = useSalaryStore()
const { employeeLookupList } = useEmployeeContext()

// Generate mock employees from lookup list
const employees = computed(() => {
    const list = employeeLookupList.value || []
    return list.slice(0, 5).map((emp, i) => ({
        id: emp.id.toString(),
        name: emp.full_name,
        avatar: emp.photo_url || '',
        employeeId: emp.employee_id,
        designation: emp.designation_name || 'Employee',
        netPaid: 12450 + (i * 100),
        status: (i === 3 ? 'Processing' : 'Paid') as 'Paid' | 'Processing' | 'Failed' | 'On Hold',
        paymentDate: 'Nov 30, 2025'
    }))
})

const handleSelectEmployee = (id: string) => {
    navigateTo(`/employeSalary/${id}`)
}

const formatCurrency = (value: number) => {
    if (value >= 1000000) {
        return `₹${(value / 1000000).toFixed(2)}M`
    }
    if (value >= 1000) {
        return `₹${(value / 1000).toFixed(0)}k`
    }
    return `₹${value.toLocaleString()}`
}
</script>
