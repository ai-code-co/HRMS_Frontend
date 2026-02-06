import { defineStore } from 'pinia'

export interface Permission {
    module: string; view: boolean; create: boolean; edit: boolean; delete: boolean;
}

export const useSettingsStore = defineStore('settings', () => {
    const activeMenu = ref('permissions')
    const uploadPolicyModalOpen = ref(false)
    const employeeSearch = ref('')
    const selectedEmployeeId = ref<string | null>(null)
    const isSaving = ref(false)

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

    const employees = ref([
        { id: 'EMP001', name: 'Sarah Miller', designation: 'Product Designer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', email: 'sarah.m@nebula.io' },
        { id: 'EMP002', name: 'Marcus Chen', designation: 'Fullstack Dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus', email: 'marcus.c@nebula.io' },
    ])

    const filteredEmployees = computed(() => {
        if (!employeeSearch.value) return []
        return employees.value.filter(e => e.name.toLowerCase().includes(employeeSearch.value.toLowerCase()))
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
        togglePermission, saveSettings
    }
})