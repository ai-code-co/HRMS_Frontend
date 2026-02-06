<template>
  <div class="flex min-h-screen lg:h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-indigo-100">
    <div class="flex-1 flex flex-col relative overflow-y-auto lg:overflow-hidden">
      <div class="px-4 md:px-6 pt-4 md:pt-6 shrink-0">
        <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm rounded-xl px-6 py-4 sticky top-0 z-20">
          <div>
            <h2 class="text-2xl font-bold text-slate-800">Audit Summary</h2>
            <p class="text-sm text-slate-400">Review and manage audit reports by {{ activeTab === 'Employee Wise' ? 'employee' : 'machine type' }}.</p>
          </div>
          
          <div class="flex items-center gap-2 sm:gap-3 bg-white border border-slate-200 px-3 sm:px-4 py-2 rounded-xl shadow-sm w-full sm:w-auto">
            <USelectMenu 
              v-model="selectedYear" 
              :items="['2026', '2025', '2024', '2023']" 
              size="sm" 
              class="flex-1 sm:flex-none sm:w-32" 
              :ui="{ rounded: 'rounded-lg' }" 
            />
            <div class="w-px h-4 bg-slate-300"></div>
            <USelectMenu 
              v-model="selectedMonth" 
              :items="['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']" 
              size="sm" 
              class="flex-1 sm:flex-none sm:w-28" 
              :ui="{ rounded: 'rounded-lg' }" 
            />
          </div>
        </div>
      </div>

      <div class="px-4 md:px-6 pt-4 shrink-0">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 h-auto lg:h-32">
          
          <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-primary-200 transition-colors">
            <div class="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <UIcon name="i-heroicons-cube" class="w-20 h-20 text-slate-900" />
            </div>
            <div class="relative z-10">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Inventory</p>
              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-bold text-slate-800">{{ stats.total_inventories }}</span>
                <span class="text-xs text-slate-500 font-medium">Assets</span>
              </div>
              <div class="mt-4 flex items-center gap-2">
                <UBadge color="gray" variant="soft" size="xs" class="px-2">
                  <UIcon name="i-heroicons-user-minus" class="w-3 h-3 mr-1" />
                  {{ stats.unassigned_inventories }} Unassigned
                </UBadge>
              </div>
            </div>
          </div>

          <div class="bg-white border border-slate-200 rounded-2xl p-1 shadow-sm flex flex-col">
            <div class="flex-1 flex items-center justify-between p-4 border-b border-slate-50">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <UIcon name="i-heroicons-clipboard-document-check" class="w-5 h-5" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-slate-800 leading-none">{{ stats.audit_done }}</p>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Audited</p>
                </div>
              </div>
            </div>
            <div class="flex-1 flex items-center justify-between p-4 bg-slate-50/50 rounded-b-xl">
               <div class="flex items-center gap-3">
                <div class="p-2 bg-slate-100 text-slate-500 rounded-lg">
                  <UIcon name="i-heroicons-clock" class="w-5 h-5" />
                </div>
                <div>
                  <p class="text-xl font-bold text-slate-600 leading-none">{{ stats.audit_pending }}</p>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Pending</p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white border border-slate-200 rounded-2xl p-1 shadow-sm flex flex-col">
            <div class="flex-1 flex items-center justify-between p-4 border-b border-slate-50">
               <div class="flex items-center gap-3">
                <div class="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <UIcon name="i-heroicons-check-badge" class="w-5 h-5" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-emerald-700 leading-none">{{ stats.audit_good }}</p>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Healthy</p>
                </div>
              </div>
            </div>
            <div class="flex-1 flex items-center justify-between p-4 bg-slate-50/50 rounded-b-xl">
               <div class="flex items-center gap-3">
                <div class="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <UIcon name="i-heroicons-exclamation-circle" class="w-5 h-5" />
                </div>
                <div>
                  <p class="text-xl font-bold text-amber-700 leading-none">{{ stats.audit_issue }}</p>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Issues</p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white border border-red-100 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div class="absolute right-0 top-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
            <div class="relative z-10">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <p class="text-xs font-bold text-red-600 uppercase tracking-wider">Critical</p>
              </div>
              <p class="text-4xl font-bold text-slate-800">{{ stats.audit_critical_issue }}</p>
              <p class="text-sm text-slate-500 font-medium mt-1">Actions Required</p>
            </div>
          </div>
        </div>
      </div>

      <div class="px-4 md:px-6 shrink-0 mt-4">
        <div class="flex items-center gap-1 bg-slate-100/60 p-1 rounded-xl border border-slate-200 shadow-sm w-full sm:w-fit overflow-x-auto mt-7.5">
          <UButton 
            v-for="tab in ['Employee Wise', 'Audit Wise']" 
            :key="tab" 
            size="xs" 
            variant="ghost"
            :class="[
              'px-4 sm:px-6 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all duration-200 whitespace-nowrap',
              activeTab === tab 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
            ]" 
            @click="handleTabChange(tab)"
          >
            {{ tab }}
          </UButton>
        </div>
      </div>

      <div class="flex-1 p-4 md:p-8 overflow-hidden flex flex-col lg:flex-row gap-6">
        
        <aside class="w-full lg:w-80 h-48 lg:h-full shrink-0 flex flex-col bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          <div class="flex-1 overflow-y-auto custom-scrollbar">
          <SidebarList
            :items="mappedSidebarItems"
            :selected-id="selectedSidebarKey || undefined"
            :loading="loading"
            @select="handleSidebarSelect"
          />
        </div>
        </aside>
        

        <main class="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 p-6 md:p-8 rounded-3xl border border-slate-100/50">
          <div class="mx-auto">
            
            <div v-if="loading" class="space-y-8 relative pl-4">
               <div class="absolute left-8 top-2 bottom-0 w-0.5 bg-slate-100"></div>
               <div v-for="i in 3" :key="i" class="relative pl-12">
                 <div class="absolute left-5 top-0 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-200 animate-pulse border-4 border-white z-10"></div>
                 <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                   <div class="h-10 bg-slate-100 rounded w-full animate-pulse"></div>
                 </div>
               </div>
            </div>

            <div v-else-if="selectedTimelineData && selectedTimelineData.length > 0">
              
              <div class="top-0 bg-slate-50/95 py-2 z-10 backdrop-blur mb-6">
                 <div class="flex items-center gap-3">
                    <UAvatar 
                      :alt="sidebarLabel" 
                      size="md" 
                      class="bg-primary-100 text-primary-600" 
                      :icon="activeTab === 'Audit Wise' ? 'i-heroicons-computer-desktop' : undefined"
                    />
                    <div>
                      <h2 class="text-lg font-bold text-slate-800">{{ sidebarLabel }}</h2>
                      <p class="text-xs text-slate-500">
                        {{ activeTab === 'Employee Wise' ? 'Assigned Assets' : 'Devices of this type' }}
                      </p>
                    </div>
                 </div>
              </div>

              <div class="relative space-y-0 pb-8">
                <div class="absolute left-6 top-4 bottom-0 w-0.5 bg-slate-200"></div>

                <div 
                  v-for="(device) in selectedTimelineData" 
                  :key="device.id" 
                  class="relative pl-16 py-4 group"
                >
                  <div 
                    class="absolute left-6 top-9 -translate-x-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow-sm transition-all duration-300 group-hover:scale-110"
                    :class="device.audit_id ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'"
                  >
                    <UIcon :name="getDeviceIcon(device.machine_type)" class="w-5 h-5" />
                  </div>

                  <div class="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-300 relative">
                    
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div>
                        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <UIcon name="i-heroicons-calendar" class="w-3 h-3" />
                          Audit Month: {{ selectedMonth }} {{ selectedYear }}
                        </div>
                        <h3 class="text-lg font-bold text-slate-800 leading-tight">
                          {{ device.machine_name }} {{ device.machine_type }}
                        </h3>
                      </div>

                      <div class="flex flex-wrap items-center gap-2">
                        <UBadge 
                          variant="subtle" 
                          :color="getConditionColor(device.comment_type)"
                          size="xs"
                          class="font-medium capitalize"
                        >
                           {{ device.comment_type ? device.comment_type.replace('_', ' ') : 'Unknown' }}
                        </UBadge>

                        <UBadge 
                          :color="device.audit_id ? 'emerald' : 'amber'" 
                          variant="soft" 
                          size="xs"
                          class="capitalize"
                        >
                          <UIcon :name="device.audit_id ? 'i-heroicons-check-circle' : 'i-heroicons-clock'" class="w-3 h-3 mr-1" />
                          {{ device.audit_id ? 'Audited' : 'Pending' }}
                        </UBadge>
                      </div>
                    </div>

                    <hr class="border-slate-100 my-3" />

                    <div class="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4 text-sm">
                      <div class="col-span-2 md:col-span-1">
                         <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Serial No</p>
                         <p class="text-slate-700 font-mono text-xs mt-0.5 truncate" :title="device.serial_number">
                           {{ device.serial_number || 'N/A' }}
                         </p>
                      </div>
                      
                      <div>
                         <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Inventory ID</p>
                         <p class="text-slate-700 font-mono text-xs mt-0.5">
                           {{ device.inventory_id || 'N/A' }}
                         </p>
                      </div>

                      <div v-if="activeTab === 'Audit Wise'">
                         <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Assigned To</p>
                         <p class="font-medium text-xs mt-0.5 text-slate-700">
                           {{ device.assigned_to || 'Unassigned' }}
                         </p>
                      </div>
                    </div>

                    <div v-if="device.audit_id" class="mt-4 bg-slate-50 rounded-xl p-3 border border-slate-100 flex gap-3 items-start">
                       <div class="mt-0.5 min-w-fit">
                         <UAvatar 
                           :alt="device.audit_done_by" 
                           size="xs" 
                           class="bg-slate-200 text-slate-600"
                         />
                       </div>
                       <div>
                          <p class="text-xs text-slate-800">
                            <span class="font-bold">{{ device.audit_done_by }}</span> 
                            <span class="text-slate-400 mx-1">•</span> 
                            <span class="text-slate-500">Auditor</span>
                          </p>
                          <p v-if="device.comment" class="text-sm text-slate-600 mt-1 italic leading-relaxed">
                            "{{ device.comment }}"
                          </p>
                       </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            <div v-else class="flex flex-col items-center justify-center py-20 h-full">
              <div class="bg-slate-50 p-6 rounded-full mb-4">
                <UIcon name="i-heroicons-inbox" class="text-4xl text-slate-300" />
              </div>
              <p class="text-base font-medium text-slate-600">No data found for selection</p>
            </div>

          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useGlobalLoader } from '~/composables/useGlobalLoader'
import SidebarList from '~/components/Inventory/SidebarList.vue'
import type { InventoryItem } from '~/types/inventory'

const { showLoader, hideLoader } = useGlobalLoader()

// --- 1. INTERFACES ---
interface AuditItem {
  id: string
  machine_type: string
  machine_name: string
  serial_number: string
  bill_number: string
  machine_id: string
  assigned_user_id: string | null
  file_name: string | null
  audit_id: string | null
  inventory_id: string
  month: string
  year: string
  audit_done_by_user_id: string | null
  comment_type: string | null 
  comment: string | null
  audit_done_by: string | null
  assigned_to: string | null
}

interface EmployeeGroup {
  employee_name: string
  items: AuditItem[]
}

interface Stats {
  total_inventories: number
  audit_done: number
  audit_pending: number
  unassigned_inventories: number
  audit_good: number
  audit_issue: number
  audit_critical_issue: number
}

interface AuditResponseData {
  stats: Stats
  audit_list: AuditItem[]
  audit_list_employee_wise: EmployeeGroup[]
}

interface AuditResponse {
  error: number
  message: string
  data: AuditResponseData
}

// --- 2. STATE ---
const selectedYear = ref('2026')
const selectedMonth = ref('Feb')
const selectedSidebarKey = ref<string | null>(null)
const activeTab = ref('Employee Wise')
const loading = ref(false)
const auditResponse = ref<AuditResponse | null>(null)

// --- 3. COMPUTED LOGIC ---

const stats = computed(() => {
  return auditResponse.value?.data?.stats || {
    total_inventories: 0,
    audit_done: 0,
    audit_pending: 0,
    unassigned_inventories: 0,
    audit_good: 0,
    audit_issue: 0,
    audit_critical_issue: 0
  }
})

const sidebarList = computed(() => {
  if (!auditResponse.value?.data) return []

  if (activeTab.value === 'Employee Wise') {
    return auditResponse.value.data.audit_list_employee_wise.map(emp => ({
      id: emp.employee_name,
      label: emp.employee_name,
      subLabel: `${emp.items.length} Assets`,
      count: 0
    }))
  } else {
    const allItems = auditResponse.value.data.audit_list
    const typeCounts = allItems.reduce((acc, item) => {
      acc[item.machine_type] = (acc[item.machine_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.keys(typeCounts).sort().map(type => ({
      id: type,
      label: type,
      subLabel: null,
      count: typeCounts[type]
    }))
  }
})

const sidebarLabel = computed(() => {
  if (!selectedSidebarKey.value) return ''
  return selectedSidebarKey.value
})

// Map sidebarList to InventoryItem format for SidebarList component
const mappedSidebarItems = computed(() => {
  return sidebarList.value.map(item => ({
    id: item.id,
    name: item.label,
    purchaseDate: '',
    warrantyExpire: '',
    price: '',
    serialNumber: item.subLabel || '', // Shows count like "5 Assets"
    internalSerial: '',
    status: 'working' as const,
    devicetypeName: activeTab.value === 'Audit Wise' ? item.label : undefined, // For search
    assignedTo: activeTab.value === 'Employee Wise' ? item.label : undefined // For search
  }))
})

const selectedTimelineData = computed(() => {
  if (!selectedSidebarKey.value || !auditResponse.value?.data) return []

  if (activeTab.value === 'Employee Wise') {
    const employeeGroup = auditResponse.value.data.audit_list_employee_wise.find(
      g => g.employee_name === selectedSidebarKey.value
    )
    return employeeGroup ? employeeGroup.items : []
  } else {
    return auditResponse.value.data.audit_list.filter(
      item => item.machine_type === selectedSidebarKey.value
    )
  }
})

// --- 4. METHODS ---
const handleTabChange = async (tab: string) => {
  showLoader()
  activeTab.value = tab
  await nextTick()
  if (sidebarList.value.length > 0) {
    selectedSidebarKey.value = sidebarList.value[0].id
  } else {
    selectedSidebarKey.value = null
  }
  hideLoader()
}

const handleSidebarSelect = (item: InventoryItem) => {
  selectedSidebarKey.value = item.id
}

const getConditionColor = (type: string | null) => {
  if (!type) return 'neutral'
  if (type === 'all_good') return 'success'
  if (type === 'issue') return 'warning'
  if (type === 'critical') return 'error'
  return 'info'
}

const getDeviceIcon = (type: string) => {
  if (!type) return 'i-heroicons-device-tablet'
  const t = type.toLowerCase()
  if (t.includes('laptop')) return 'i-heroicons-computer-desktop'
  if (t.includes('mouse')) return 'i-heroicons-cursor-arrow-ripple'
  if (t.includes('keyboard')) return 'i-heroicons-keyboard'
  return 'i-heroicons-cube'
}

// --- 5. API CALL ---
const config = useRuntimeConfig()
const token = useCookie('token')

// Full month mapping
const monthsMap: Record<string, number> = {
  'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
  'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
}

const fetchAuditSummary = async () => {
  loading.value = true
  showLoader()
  try {
    const monthNumber = monthsMap[selectedMonth.value] || 2
    
    // API Call
    const response = await $fetch<AuditResponse>(`${config.public.apiBase}api/inventory/audit-summary/`, {
      headers: { 'Authorization': `Bearer ${token.value}` },
      query: { month: monthNumber, year: selectedYear.value }
    })
    
    auditResponse.value = response

    // Reset selection logic: if current selection is invalid in new data, default to first item
    await nextTick()
    if (sidebarList.value.length > 0) {
      const currentExists = sidebarList.value.find(i => i.id === selectedSidebarKey.value)
      if (!currentExists) {
        selectedSidebarKey.value = sidebarList.value[0].id
      }
    } else {
      selectedSidebarKey.value = null
    }

  } catch (error) {
    console.error('API Error:', error)
  } finally {
    loading.value = false
    hideLoader()
  }
}

// Watchers to trigger fetch on Dropdown change
watch([selectedYear, selectedMonth], () => {
  fetchAuditSummary()
})

onMounted(() => {
  fetchAuditSummary()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>