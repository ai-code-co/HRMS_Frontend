<template>
    <div class="space-y-6 h-full flex flex-col">
        <div class="relative group w-full">
            <UFormField label="Search Employee" help="Type name to override individual permissions">
                <UInput v-model="store.employeeSearch" icon="i-heroicons-magnifying-glass"
                    placeholder="Search by name, ID or email..." size="xl" class="w-full" />
            </UFormField>
            <div v-if="store.employeeSearch"
                class="absolute top-full left-0 right-0 -mt-4 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-2">
                <div v-if="store.employeesLoading" class="px-3 py-4 text-sm text-slate-500">
                    Loading employees...
                </div>
                <div v-else-if="store.filteredEmployees.length <= 0" class="px-3 py-2">
                    <p class="text-sm font-bold text-slate-600">
                        No employees found.
                    </p>
                </div>
                <div v-else v-for="emp in store.filteredEmployees" :key="emp.id" @click="select(emp.id)"
                    class="w-full flex items-center gap-4 p-3 hover:bg-blue-100 rounded-md transition-all cursor-pointer">
                    <UAvatar :src="emp.avatar" size="sm" />
                    <div class="flex-1 text-left">
                        <p class="text-sm font-bold">{{ emp.name }}</p>
                        <p class="text-[10px] text-slate-400">{{ emp.designation }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="store.selectedEmployee" class="flex-1 space-y-6">
            <div class="bg-primary-50 border border-primary-200 rounded-2xl p-3 flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <UAvatar :src="store.selectedEmployee.avatar" size="lg" />
                    <h4 class="text-xl font-black">{{ store.selectedEmployee.name }}</h4>
                </div>
                <UButton color="primary" variant="ghost" icon="i-heroicons-x-mark"
                    @click="store.selectedEmployeeId = null" class="rounded-full cursor-pointer" />
            </div>

            <div class="overflow-x-auto rounded-2xl border border-slate-200">
                <table class="w-full text-left">
                    <thead class="bg-slate-50">
                        <tr>
                            <th class="px-8 py-4 text-[10px] font-black uppercase text-slate-400">System Module</th>
                            <th v-for="action in ['Read', 'Write', 'Edit', 'Delete']" :key="action"
                                class="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-center">{{ action
                                }}</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200">
                        <tr v-for="(p, idx) in store.currentPermissions" :key="p.module">
                            <td class="px-8 py-5">
                                <span class="text-sm font-bold text-slate-700">{{ p.module }}</span>
                            </td>
                            <td class="px-6 py-5 text-center" v-for="field in ['view', 'create', 'edit', 'delete']"
                                :key="field">
                                <USwitch :model-value="p[field]"
                                    @update:model-value="store.togglePermission(idx, field)"
                                    class="flex justify-center" />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '~/stores/settings'

const store = useSettingsStore()

onMounted(() => {
    store.fetchEmployeesForPermissions()
})

const select = (id: string) => {
    store.selectedEmployeeId = id
    store.employeeSearch = ''
}
</script>