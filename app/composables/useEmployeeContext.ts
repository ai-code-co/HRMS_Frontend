import { ref, computed, readonly } from 'vue'

export interface EmployeeLookup {
  id: number
  employee_id: string
  full_name: string
  photo?: string | null
  photo_url?: string | null
  designation_name?: string
  department_name?: string
  is_active?: boolean
  employment_status?: string
}

const selectedEmployeeId = ref<number | null>(null)
const employeeLookupList = ref<EmployeeLookup[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

export function useEmployeeContext() {
  const activeEmployee = computed(() => {
    if (!selectedEmployeeId.value) return null
    const list = employeeLookupList.value
    if (!Array.isArray(list)) return null
    return list.find(emp => emp.id === selectedEmployeeId.value) || null
  })

  const isViewingOther = computed(() => selectedEmployeeId.value !== null)
  async function fetchEmployeeLookupList() {
    if (loading.value) return

    loading.value = true
    error.value = null

    try {
      const { data: employees } = await useApi<{ data: EmployeeLookup[] }>('/api/employees/lookup-list/', {
        credentials: 'include'
      })

      employeeLookupList.value = employees || []
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Failed to fetch employee list')
      const toast = useToast()
      toast.add({
        title: 'Error',
        description: error.value,
        color: 'error'
      })
    } finally {
      loading.value = false
    }
  }

  function selectEmployee(employeeId: number) {
    selectedEmployeeId.value = employeeId
  }

  function clearSelection() {
    selectedEmployeeId.value = null
  }

  const employeeOptions = computed(() => {
    const list = employeeLookupList.value
    if (!Array.isArray(list)) return []

    return list.map(emp => ({
      id: emp.id,
      label: emp.full_name,
      value: emp.id,
      avatar: emp.photo_url,
      suffix: emp.employee_id,
      designation: emp.designation_name,
      department: emp.department_name,
      isInactive: emp.is_active === false || emp.employment_status === 'terminated'
    }))
  })

  return {
    selectedEmployeeId: readonly(selectedEmployeeId),
    employeeLookupList: readonly(employeeLookupList),
    loading: readonly(loading),
    error: readonly(error),

    activeEmployee,
    isViewingOther,
    employeeOptions,

    fetchEmployeeLookupList,
    selectEmployee,
    clearSelection
  }
}
