<template>
    <UModal v-model:open="modelOpen" :overlay="true" :ui="{
        overlay: 'bg-slate-900/40 backdrop-blur-sm',
        content: 'w-[95vw] sm:w-full sm:max-w-3xl rounded-xl overflow-hidden max-h-[90vh]'
    }">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                    <div class="p-2 rounded-lg flex items-center bg-indigo-100">
                        <UIcon name="i-lucide-users" class="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-slate-900">Employee Leave Overview</h3>
                        <p class="text-xs text-slate-500 font-medium">
                            {{ filteredEmployees.length }} employee{{ filteredEmployees.length !== 1 ? 's' : '' }}
                        </p>
                    </div>
                </div>
                <UButton color="secondary" variant="ghost" icon="i-heroicons-x-mark-20-solid"
                    class="-my-1 rounded-full cursor-pointer" @click="close" />
            </div>
        </template>

        <template #body>
            <div class="space-y-4">
                <!-- Search Input -->
                <div class="px-1">
                    <UInput
                        v-model="searchQuery"
                        icon="i-heroicons-magnifying-glass"
                        placeholder="Search by name or department..."
                        size="lg"
                        class="w-full"
                    />
                </div>

                <div class="max-h-[55vh] overflow-y-auto px-1 space-y-3">
                    <!-- Loading State -->
                    <div v-if="loading" class="space-y-3">
                        <USkeleton v-for="i in 4" :key="i" class="h-28 w-full rounded-xl" />
                    </div>

                    <!-- Empty State -->
                    <div v-else-if="filteredEmployees.length === 0"
                        class="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                        <UIcon name="i-lucide-search-x" class="text-4xl mb-3 text-slate-300" />
                        <p class="text-sm font-medium">No employees found</p>
                        <p class="text-xs text-slate-400 mt-1">Try adjusting your search criteria</p>
                    </div>

                    <!-- Employee List -->
                    <div v-else class="space-y-3">
                        <div v-for="employee in filteredEmployees" :key="employee.employee_id"
                            class="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all hover:border-indigo-200">

                            <!-- Employee Header (Click to expand) -->
                            <div
                                @click="toggleExpand(employee.employee_id)"
                                class="p-4 cursor-pointer flex items-center justify-between"
                            >
                                <div class="flex items-center gap-3 min-w-0">
                                    <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                        <span class="text-indigo-600 font-bold text-xs">
                                            {{ getInitials(employee.employee_name) }}
                                        </span>
                                    </div>
                                    <div class="min-w-0">
                                        <p class="font-bold text-sm truncate">{{ employee.employee_name }}</p>
                                        <p class="text-xs text-slate-400">
                                            {{ employee.designation }}
                                            <span v-if="employee.department">| {{ employee.department }}</span>
                                        </p>
                                    </div>
                                </div>

                                <!-- Summary Stats -->
                                <div class="flex items-center gap-4">
                                    <div class="hidden sm:flex items-center gap-6 text-center">
                                        <div>
                                            <p class="text-xs text-slate-400 uppercase font-semibold">Allocated</p>
                                            <p class="text-lg font-bold text-slate-700">{{ employee.summary.total_allocated }}</p>
                                        </div>
                                        <div>
                                            <p class="text-xs text-slate-400 uppercase font-semibold">Used</p>
                                            <p class="text-lg font-bold text-rose-500">{{ employee.summary.total_used }}</p>
                                        </div>
                                        <div>
                                            <p class="text-xs text-slate-400 uppercase font-semibold">Available</p>
                                            <p class="text-lg font-bold text-emerald-500">{{ employee.summary.total_available }}</p>
                                        </div>
                                    </div>
                                    <UIcon
                                        :name="expandedEmployees.has(employee.employee_id) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                                        class="w-5 h-5 text-slate-400 transition-transform"
                                    />
                                </div>
                            </div>

                            <!-- Mobile Summary (shown when collapsed) -->
                            <div v-if="!expandedEmployees.has(employee.employee_id)"
                                class="sm:hidden px-4 pb-3 flex items-center gap-4 text-center">
                                <div class="flex-1">
                                    <p class="text-[10px] text-slate-400 uppercase">Allocated</p>
                                    <p class="text-sm font-bold text-slate-700">{{ employee.summary.total_allocated }}</p>
                                </div>
                                <div class="flex-1">
                                    <p class="text-[10px] text-slate-400 uppercase">Used</p>
                                    <p class="text-sm font-bold text-rose-500">{{ employee.summary.total_used }}</p>
                                </div>
                                <div class="flex-1">
                                    <p class="text-[10px] text-slate-400 uppercase">Available</p>
                                    <p class="text-sm font-bold text-emerald-500">{{ employee.summary.total_available }}</p>
                                </div>
                            </div>

                            <!-- Expanded Breakdown -->
                            <div v-if="expandedEmployees.has(employee.employee_id)"
                                class="border-t border-slate-100 bg-slate-50/50 p-4">
                                <p class="text-xs font-semibold text-slate-500 uppercase mb-3">Leave Type Breakdown</p>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div v-for="(balance, leaveType) in employee.balances" :key="leaveType"
                                        class="bg-white p-3 rounded-lg border border-slate-100">
                                        <div class="flex items-center gap-2 mb-2">
                                            <div :class="[getLeaveTypeConfig(leaveType as string).bgColor, 'w-6 h-6 rounded flex items-center justify-center']">
                                                <UIcon :name="getLeaveTypeConfig(leaveType as string).icon"
                                                    :class="[getLeaveTypeConfig(leaveType as string).textColor, 'w-3.5 h-3.5']" />
                                            </div>
                                            <span class="text-xs font-bold text-slate-700">{{ leaveType }}</span>
                                        </div>
                                        <div class="flex items-center justify-between text-xs">
                                            <span class="text-slate-400">
                                                {{ balance.used }} used of {{ balance.allocated }}
                                            </span>
                                            <span class="font-bold text-emerald-600">{{ balance.available }} left</span>
                                        </div>
                                        <!-- Progress bar -->
                                        <div class="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                :style="{ width: `${balance.allocated > 0 ? (balance.used / balance.allocated) * 100 : 0}%` }"
                                                :class="[getLeaveTypeConfig(leaveType as string).progressColor, 'h-full rounded-full transition-all']"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <template #footer>
            <div class="flex w-full">
                <UButton block color="neutral" variant="outline" size="lg" class="flex-1" @click="close">
                    Close
                </UButton>
            </div>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import { useLeaveStore } from '~/stores/leaves'
import { storeToRefs } from 'pinia'

const props = defineProps<{
    open: boolean
}>()

const emit = defineEmits(['update:open'])

const leaveStore = useLeaveStore()
const { employeeLeaveBalances, employeeBalancesIsLoading: loading } = storeToRefs(leaveStore)

const searchQuery = ref('')
const expandedEmployees = ref<Set<number>>(new Set())

const modelOpen = computed({
    get: () => props.open,
    set: (value: boolean) => emit('update:open', value)
})

// Fetch data when modal opens
watch(() => props.open, async (isOpen) => {
    if (isOpen) {
        await leaveStore.fetchAllEmployeeBalances(true)
    }
})

// Filter employees by search query
const filteredEmployees = computed(() => {
    if (!searchQuery.value.trim()) {
        return employeeLeaveBalances.value
    }
    const query = searchQuery.value.toLowerCase()
    return employeeLeaveBalances.value.filter(emp =>
        emp.employee_name.toLowerCase().includes(query) ||
        emp.department?.toLowerCase().includes(query) ||
        emp.designation?.toLowerCase().includes(query)
    )
})

const close = () => {
    modelOpen.value = false
    searchQuery.value = ''
    expandedEmployees.value.clear()
}

const toggleExpand = (employeeId: number) => {
    if (expandedEmployees.value.has(employeeId)) {
        expandedEmployees.value.delete(employeeId)
    } else {
        expandedEmployees.value.add(employeeId)
    }
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

// Leave type styling configuration
const leaveTypeConfig: Record<string, { icon: string; bgColor: string; textColor: string; progressColor: string }> = {
    'Annual Leave': {
        icon: 'i-lucide-calendar',
        bgColor: 'bg-indigo-100',
        textColor: 'text-indigo-600',
        progressColor: 'bg-indigo-500'
    },
    'Sick Leave': {
        icon: 'i-lucide-thermometer',
        bgColor: 'bg-rose-100',
        textColor: 'text-rose-600',
        progressColor: 'bg-rose-500'
    },
    'Casual Leave': {
        icon: 'i-lucide-coffee',
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-600',
        progressColor: 'bg-amber-500'
    },
    'Maternity Leave': {
        icon: 'i-lucide-baby',
        bgColor: 'bg-emerald-100',
        textColor: 'text-emerald-600',
        progressColor: 'bg-emerald-500'
    },
    'RH': {
        icon: 'i-lucide-star',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-600',
        progressColor: 'bg-purple-500'
    },
}

const getLeaveTypeConfig = (type: string) => {
    return leaveTypeConfig[type] || {
        icon: 'i-lucide-calendar-days',
        bgColor: 'bg-slate-100',
        textColor: 'text-slate-600',
        progressColor: 'bg-slate-500'
    }
}
</script>
