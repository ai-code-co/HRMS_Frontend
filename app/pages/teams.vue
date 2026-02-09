<template>
  <div class="flex-1 h-full p-4 md:p-8 mx-auto w-full bg-[#F8FAFC]">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <p class="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em]">Org</p>
        <h1 class="text-3xl font-black text-slate-800">Teams Overview</h1>
        <p class="text-sm font-medium text-slate-400">Super admin view of teams, people, and exits.</p>
      </div>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
      <!-- Teams list -->
      <section
        class="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 space-y-3 lg:sticky lg:top-6 self-start">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-800">Teams</h3>
        </div>
        <UInput v-model="teamSearch" placeholder="Search team..." icon="i-heroicons-magnifying-glass" size="sm"
          variant="outline" class="w-full" />
        <div v-if="filteredTeams.length === 0" class="text-sm text-slate-500">No teams found.</div>
        <div class="space-y-2 max-h-[50vh] lg:max-h-[70vh] overflow-y-auto pr-2">
          <button v-for="team in filteredTeams" :key="team.id"
            class="w-full flex items-center justify-between px-3 py-3 rounded-xl border transition-all"
            :class="team.id === selectedTeamId ? 'border-indigo-200 bg-indigo-50' : 'border-slate-100 hover:border-indigo-100 hover:bg-slate-50'"
            @click="selectTeam(team.id)">
            <div class="text-left">
              <p class="text-sm font-bold text-slate-800 truncate">{{ team.name }}</p>
              <p class="text-xs text-slate-500">Manager: {{ team.manager_name || '--' }}</p>
            </div>
            <UBadge variant="soft" color="primary">{{ team.employee_count ?? 0 }}</UBadge>
          </button>
        </div>
      </section>

      <!-- Employees -->
      <section class="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div class="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/70">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 class="text-lg font-bold text-slate-800">Employees</h3>
              <p class="text-xs text-slate-500">Team: {{ activeTeamName }}</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <UTabs v-model="employeeTab" size="sm" variant="pill" :items="tabItems" />
            </div>
          </div>
        </div>

        <div class="p-3 sm:p-4">
          <UInput
            v-model="employeeSearch"
            placeholder="Search employees..."
            icon="i-heroicons-magnifying-glass"
            size="sm"
            variant="outline"
            class="w-full mb-3"
          />
          <div v-if="employeeTab === 'active'">
            <div v-if="employeeLoading" class="text-sm text-slate-500">Loading employees...</div>
            <div v-else-if="filteredActiveEmployees.length === 0" class="text-sm text-slate-500">No employees in this
              team.</div>
            <div class="space-y-2 max-h-[50vh] md:max-h-[70vh] overflow-y-auto pr-2">
              <div v-for="emp in filteredActiveEmployees" :key="emp.id"
                class="group flex items-center gap-3 px-3 py-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition">
                <UAvatar :src="emp.photo_url" :alt="emp.full_name" size="sm" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 min-w-0">
                    <p class="text-sm font-bold text-slate-800 truncate">{{ emp.full_name }}</p>
                    <UBadge variant="soft" color="success" size="xs">Active</UBadge>
                  </div>
                  <p class="text-xs text-slate-500">{{ emp.designation_detail?.name || 'Employee' }} • {{
                    emp.employee_id
                  }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <UButton size="xs" variant="ghost" icon="i-lucide-arrow-up-right" @click="viewProfile(emp)" />
                  <UButton size="xs" variant="soft" color="error" icon="i-lucide-user-x" @click="openTerminate(emp)" />
                </div>
              </div>
            </div>
          </div>

          <div v-else>
            <div v-if="exLoading" class="text-sm text-slate-500">Loading...</div>
            <div v-else-if="filteredInactiveEmployees.length === 0" class="text-sm text-slate-500">No inactive
              employees.</div>
            <div class="space-y-2 max-h-[50vh] md:max-h-[70vh] overflow-y-auto pr-2">
              <div v-for="emp in filteredInactiveEmployees" :key="emp.id"
                class="group flex items-center gap-3 px-3 py-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition">
                <UAvatar :src="emp.photo_url" :alt="emp.full_name" size="sm" color="slate" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 min-w-0">
                    <p class="text-sm font-bold text-slate-800 truncate">{{ emp.full_name }}</p>
                    <UBadge variant="soft" color="error" size="xs">Inactive</UBadge>
                  </div>
                  <p class="text-xs text-slate-500">ID: {{ emp.employee_id }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <UButton size="xs" variant="ghost" icon="i-lucide-arrow-up-right" @click="viewProfile(emp)" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>

  <ConfirmDialog v-model:open="terminateConfirm.open" title="Terminate employee?" confirm-label="Terminate"
    cancel-label="Cancel" confirm-color="error" :loading="employeeStore.loading" icon="i-lucide-user-x"
    icon-bg="bg-rose-100" icon-color="text-rose-600" @confirm="confirmTerminate">
    This will mark <strong>{{ terminateConfirm.employee?.full_name }}</strong> as terminated.
    You can still view them in the Ex-Employees list.
  </ConfirmDialog>
</template>

<script setup lang="ts">
import type { Employee } from '~/types/employee'
import ConfirmDialog from '~/components/UI/ConfirmDialog.vue'

const { isAdmin } = useRoleAccess()
const deptStore = useDepartmentStore()
const employeeStore = useEmployeeStore()
const { selectEmployee } = useEmployeeContext()

const teamSearch = ref('')
const employeeSearch = ref('')
const selectedTeamId = ref<number | null>(null)
const employees = ref<Employee[]>([])
const exEmployees = ref<Employee[]>([])
const employeeLoading = ref(false)
const exLoading = ref(false)
const terminateConfirm = ref<{ open: boolean; employee: Employee | null }>({ open: false, employee: null })
const employeeTab = ref<'active' | 'inactive'>('active')

const tabItems = computed(() => ([
  { label: `Active (${filteredActiveEmployees.value.length})`, value: 'active' },
  { label: `Inactive (${filteredInactiveEmployees.value.length})`, value: 'inactive' },
]))

const filteredTeams = computed(() =>
  deptStore.departments.filter((d) =>
    d.name.toLowerCase().includes(teamSearch.value.toLowerCase())
  )
)
const activeTeamName = computed(
  () => deptStore.departments.find((d) => d.id === selectedTeamId.value)?.name || 'None'
)

const activeEmployees = computed(() =>
  employees.value.filter(emp => emp.is_active !== false && emp.employment_status !== 'terminated')
)

const inactiveEmployees = computed(() =>
  [...employees.value, ...exEmployees.value].filter(emp => emp.is_active === false || emp.employment_status === 'terminated')
)

const filteredActiveEmployees = computed(() =>
  activeEmployees.value
    .filter(emp => !selectedTeamId.value || emp.department === selectedTeamId.value)
    .filter(emp => {
      const q = employeeSearch.value.trim().toLowerCase()
      if (!q) return true
      return (
        emp.full_name?.toLowerCase().includes(q) ||
        emp.employee_id?.toLowerCase().includes(q) ||
        emp.designation_detail?.name?.toLowerCase().includes(q) ||
        String(emp.department ?? '').includes(q)
      )
    })
)

const filteredInactiveEmployees = computed(() =>
  inactiveEmployees.value
    .filter(emp => !selectedTeamId.value || emp.department === selectedTeamId.value)
    .filter(emp => {
      const q = employeeSearch.value.trim().toLowerCase()
      if (!q) return true
      return (
        emp.full_name?.toLowerCase().includes(q) ||
        emp.employee_id?.toLowerCase().includes(q) ||
        emp.designation_detail?.name?.toLowerCase().includes(q) ||
        String(emp.department ?? '').includes(q)
      )
    })
)

await useAsyncData('teams-init', async () => {
  if (!isAdmin.value) return
  await loadTeams()
  await loadExEmployees()
}, { server: true })

onMounted(async () => {
  if (!isAdmin.value) return navigateTo('/dashboard')
  if (deptStore.departments.length !== 0 && exEmployees.value.length !== 0) return
  const { showLoader, hideLoader } = useGlobalLoader()
  if (import.meta.client) showLoader()
  try {
    if (deptStore.departments.length === 0) {
      await loadTeams()
    }
    if (exEmployees.value.length === 0) {
      await loadExEmployees()
    }
  } finally {
    if (import.meta.client) hideLoader()
  }
})

watch(selectedTeamId, () => {
  loadEmployees()
})

async function loadTeams() {
  await deptStore.fetchDepartments()
  if (!selectedTeamId.value && deptStore.departments.length) {
    selectedTeamId.value = deptStore.departments[0].id
  }
  // Once team is set, load employees
  await loadEmployees()
}

async function loadEmployees() {
  if (!selectedTeamId.value) {
    employees.value = []
    return
  }
  employeeLoading.value = true
  await employeeStore.fetchEmployees({ department: selectedTeamId.value, status: 'active' })
  // Backend may return mixed statuses; filter to active list here
  employees.value = employeeStore.employeesList.filter(emp => emp.is_active !== false && emp.employment_status !== 'terminated')
  employeeLoading.value = false
}

async function loadExEmployees() {
  exLoading.value = true
  await employeeStore.fetchExEmployees()
  // Ensure only terminated/inactive are stored
  exEmployees.value = employeeStore.employeesList.filter(emp => emp.is_active === false || emp.employment_status === 'terminated')
  exLoading.value = false
}

function selectTeam(id: number) {
  selectedTeamId.value = id
}

function viewProfile(emp: Employee) {
  selectEmployee(emp.id)
  navigateTo('/profile')
}

function openTerminate(emp: Employee) {
  terminateConfirm.value = { open: true, employee: emp }
}

async function confirmTerminate() {
  if (!terminateConfirm.value.employee) return
  try {
    await employeeStore.terminateEmployee(terminateConfirm.value.employee.id)
    terminateConfirm.value = { open: false, employee: null }
    employeeTab.value = 'inactive'
    await loadEmployees()
    await loadExEmployees()
  } catch (err) {
    // Error toast handled in store; keep modal open for retry
  }
}
</script>
