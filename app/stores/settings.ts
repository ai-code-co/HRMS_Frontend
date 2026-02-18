import { defineStore } from 'pinia'

export interface Permission {
    module: string; view: boolean; create: boolean; edit: boolean; delete: boolean;
}

export interface SettingsEmployee {
    id: string
    name: string
    designation: string
    avatar: string
    email?: string
}

export const useSettingsStore = defineStore('settings', () => {
    const activeMenu = ref('permissions')
    const uploadPolicyModalOpen = ref(false)
    const employeeSearch = ref('')
    const selectedEmployeeId = ref<string | null>(null)
    const isSaving = ref(false)
    const employeesLoading = ref(false)
    const employeesError = ref<string | null>(null)

    const permissions = ref<Record<string, Permission[]>>({
        global: [
            { module: 'Attendance', view: true, create: true, edit: true, delete: false },
            { module: 'Leave Management', view: true, create: true, edit: true, delete: true },
            { module: 'Inventory', view: true, create: true, edit: false, delete: false },
        ]
    })
    const initialPermissions = ref(JSON.parse(JSON.stringify(permissions.value)))
    const isDirty = computed(() => {
        return JSON.stringify(permissions.value) !== JSON.stringify(initialPermissions.value)
    })

    const employees = ref<SettingsEmployee[]>([])

    async function fetchEmployeesForPermissions() {
        employeesLoading.value = true
        employeesError.value = null
        try {
            const res = await useApi<{ data: { id: number; employee_id?: string; full_name: string; photo_url?: string | null; designation_name?: string }[] }>(
                '/api/employees/lookup-list/',
                { credentials: 'include' }
            )
            const list = res?.data ?? []
            employees.value = list.map((e: any) => ({
                id: String(e.id),
                name: e.full_name ?? '',
                designation: e.designation_name ?? e.designation ?? '',
                avatar: e.photo_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent((e.full_name || 'U').slice(0, 2))}&background=random`,
                email: e.email ?? undefined
            }))
        } catch (err: any) {
            employeesError.value = err?.data?.message || err?.message || 'Failed to load employees'
            const toast = useToast()
            toast.add({ title: 'Error', description: employeesError.value, color: 'error' })
        } finally {
            employeesLoading.value = false
        }
    }

    const filteredEmployees = computed(() => {
        if (!employeeSearch.value) return []
        const q = employeeSearch.value.toLowerCase()
        return employees.value.filter(e =>
            e.name.toLowerCase().includes(q) ||
            (e.designation && e.designation.toLowerCase().includes(q)) ||
            (e.email && e.email.toLowerCase().includes(q)) ||
            (e.id && e.id.toLowerCase().includes(q))
        )
    })

    const selectedEmployee = computed(() => employees.value.find(e => e.id === selectedEmployeeId.value))

    const currentPermissions = computed(() => {
        const key = selectedEmployeeId.value || 'global'
        return permissions.value[key] || permissions.value.global
    })

    function togglePermission(idx: number, field: keyof Omit<Permission, 'module'>) {
        const key = selectedEmployeeId.value || 'global'
        if (!permissions.value[key]) {
            permissions.value[key] = JSON.parse(JSON.stringify(permissions.value.global))
        }
        permissions.value[key][idx][field] = !permissions.value[key][idx][field]
    }

    async function saveSettings() {
        const toast = useToast()
        isSaving.value = true

        try {
            await new Promise(resolve => setTimeout(resolve, 1000))
            initialPermissions.value = JSON.parse(JSON.stringify(permissions.value))
            toast.add({ title: 'Changes Saved', color: 'success' })
        } catch (error) {
            toast.add({ title: 'Error', color: 'error' })
        } finally {
            isSaving.value = false
        }
    }

    return {
        activeMenu, uploadPolicyModalOpen, employeeSearch, selectedEmployeeId, isSaving, isDirty,
        employees, filteredEmployees, selectedEmployee, currentPermissions,
        employeesLoading, employeesError, fetchEmployeesForPermissions,
        togglePermission, saveSettings
    }
})