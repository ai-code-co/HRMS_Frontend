import { ref, computed, readonly, watch } from 'vue'

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
const employeeQueryKey = 'employeeId'
let isRouteSyncInitialized = false
/** Only sync from URL when the route actually changed (refresh or navigation), not on every call (so clear selection is not overwritten before router updates). */
let lastSyncedFullPath = ''

const parseEmployeeId = (value: unknown): number | null => {
  if (Array.isArray(value)) {
    value = value[0]
  }
  if (value === null || value === undefined || value === '') return null
  const num = Number.parseInt(String(value), 10)
  return Number.isNaN(num) ? null : num
}

export function useEmployeeContext() {
  const route = useRoute()
  const router = useRouter()

  // Sync from URL only when route changed (refresh or navigation). Runs on server too so SSR gets correct employee for dashboard.
  const fullPath = route.fullPath
  if (fullPath !== lastSyncedFullPath) {
    lastSyncedFullPath = fullPath
    const fromQuery = parseEmployeeId(route.query[employeeQueryKey])
    selectedEmployeeId.value = fromQuery
  }

  const updateEmployeeQuery = async (employeeId: number | null) => {
    if (!import.meta.client) return
    const current = parseEmployeeId(route.query[employeeQueryKey])
    if (current === employeeId) return

    const nextQuery = { ...route.query }
    if (employeeId === null) {
      delete nextQuery[employeeQueryKey]
    } else {
      nextQuery[employeeQueryKey] = String(employeeId)
    }

    await router.replace({ query: nextQuery })
  }

  if (!isRouteSyncInitialized && import.meta.client) {
    isRouteSyncInitialized = true
    watch(
      () => route.query[employeeQueryKey],
      (value) => {
        const parsed = parseEmployeeId(value)
        if (parsed === selectedEmployeeId.value) return
        selectedEmployeeId.value = parsed
      },
      { immediate: true }
    )
  }

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

  function selectEmployee(employeeId: number, options?: { skipQuery?: boolean }) {
    selectedEmployeeId.value = employeeId
    if (!options?.skipQuery) {
      void updateEmployeeQuery(employeeId)
    }
  }

  function clearSelection(options?: { skipQuery?: boolean }) {
    selectedEmployeeId.value = null
    if (!options?.skipQuery) {
      void updateEmployeeQuery(null)
    }
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
