import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { extractErrorMessage } from '~/composables/useErrorMessage'
import { formatDateFromISO } from '~/utils/function'
import useApi from '~/composables/useApi'

export interface Device {
  id: string
  name: string
  category: string
  assetId: string
  serialNumber: string
  model: string
  image: string
  status: string
  condition: string
  employeeName: string
  employeeId: string
  email: string
  photo: string
  department: string
  designation: string
  brand: string
  purchaseDate: string
  warrantyExpiry: string
  isUnderWarranty: boolean
  assignmentHistory: AssignmentHistory[]
  isAudited?: boolean
  warranty_doc_url: string
  invoice_doc_url: string
  photo_url: string
}

export interface AssignmentHistory {
  id: number
  deviceInfo: string
  deviceType: string
  employeeName: string
  employeeIdStr: string
  assignedBy: string
  assignedDate: string
  durationDays: number
  conditionAtAssignment: string
  conditionAtReturn: string
}

export interface AuditStatus {
  allItemsAudited: boolean
  devices: { id: number; isAudited: boolean }[]
}

export interface DeviceListItem {
  id: number
  name: string
  serialNumber: string
  category: string
  isAudited: boolean
}

export interface AuditSummaryItem {
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

export interface EmployeeGroup {
  employee_name: string
  items: AuditSummaryItem[]
}

export interface AuditSummaryStats {
  total_inventories: number
  audit_done: number
  audit_pending: number
  unassigned_inventories: number
  audit_good: number
  audit_issue: number
  audit_critical_issue: number
}

export interface AuditSummaryResponseData {
  stats: AuditSummaryStats
  audit_list: AuditSummaryItem[]
  audit_list_employee_wise: EmployeeGroup[]
}

export interface AuditSummaryResponse {
  error: number
  message: string
  data: AuditSummaryResponseData
}

export const useAuditStore = defineStore('audit', () => {
  const deviceCache = ref<Record<number, Device>>({})
  const deviceList = ref<DeviceListItem[]>([])
  const isLoading = ref(false)
  const auditStatus = ref<AuditStatus | null>(null)
  const selectedDeviceLoading = ref(false)
  const error = ref<string | null>(null)

  // Audit Summary state
  const auditSummaryLoading = ref(false)
  const auditSummaryData = ref<AuditSummaryResponse | null>(null)

  // Month mapping for audit summary
  const monthsMap: Record<string, number> = {
    'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
    'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
  }

  async function fetchAuditStatus() {
    isLoading.value = true
    error.value = null
    const toast = useToast()

    try {
      const response = await useApi<{ data: AuditStatus }>('/api/inventory/user-audit-status/')
      auditStatus.value = response.data
      return response.data
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Failed to fetch audit status')
      toast.add({
        title: 'Error',
        description: error.value,
        color: 'error',
      })
      auditStatus.value = null
      deviceList.value = []
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function loadDeviceList() {
    if (!auditStatus.value?.devices) {
      return
    }

    try {
      const deviceListPromises = auditStatus.value.devices.map(async (d) => {
        try {
          const device = await useApi<any>(`/api/inventory/devices/${d.id}/`)
          return {
            id: device.id,
            name: device.model_name,
            serialNumber: device.serial_number,
            category: device.device_type_detail?.name || 'Device',
            isAudited: d.isAudited,
          } as DeviceListItem
        } catch (err) {
          console.error(`Failed to fetch device ${d.id}:`, err)
          return null
        }
      })

      const devices = await Promise.all(deviceListPromises)
      deviceList.value = devices.filter((d): d is DeviceListItem => d !== null)
    } catch (err) {
      console.error('Failed to load device list:', err)
    }
  }

  const allDevices = computed(() => {
    return deviceList.value
  })

  const unauditedDevices = computed(() => {
    return deviceList.value.filter(d => !d.isAudited)
  })

  const isDeviceAudited = (deviceId: number): boolean => {
    return auditStatus.value?.devices.some(d => d.id === deviceId && d.isAudited) ?? false
  }

  const allItemsAudited = computed(() => {
    return auditStatus.value?.allItemsAudited ?? true
  })


  async function fetchDeviceDetails(deviceId: number) {
    if (deviceCache.value[deviceId]) {
      return deviceCache.value[deviceId]
    }

    selectedDeviceLoading.value = true
    error.value = null
    const toast = useToast()

    try {
      const response = await useApi<any>(`/api/inventory/devices/${deviceId}/`)

      const device: Device = {
        id: response.id.toString(),
        name: response.model_name,
        category: response.device_type_detail?.name || 'Device',
        assetId: response.serial_number,
        serialNumber: response.serial_number,
        model: response.model_name,
        image: response.employee_detail?.photo_url || 'https://placehold.co/600x400/F1F5F9/64748B?text=Device',
        status: response.status_display,
        condition: response.condition_display,
        employeeName: response.employee_detail?.full_name || 'N/A',
        employeeId: response.employee_detail?.employee_id || 'N/A',
        email: response.employee_detail?.email || 'N/A',
        photo: response.employee_detail?.photo_url || '',
        department: response.employee_detail?.department || 'N/A',
        designation: response.employee_detail?.designation || 'N/A',
        brand: response.brand || 'N/A',
        purchaseDate: response.purchase_date ? formatDateFromISO(response.purchase_date) : 'N/A',
        warrantyExpiry: response.warranty_expiry ? formatDateFromISO(response.warranty_expiry) : 'N/A',
        isUnderWarranty: response.is_under_warranty,
        assignmentHistory: (response.assignment_history || []).map((history: any) => ({
          id: history.id,
          deviceInfo: history.device_info,
          deviceType: history.device_type,
          employeeName: history.employee_name,
          employeeIdStr: history.employee_id_str,
          assignedBy: history.assigned_by_name,
          assignedDate: formatDateFromISO(history.assigned_date),
          durationDays: history.duration_days,
          conditionAtAssignment: history.condition_at_assignment,
          conditionAtReturn: history.condition_at_return,
        })),
        photo_url: response.photo_url,
        warranty_doc_url: response.warranty_doc_url,
        invoice_doc_url: response.invoice_doc_url,
      }

      deviceCache.value[deviceId] = device
      return device
    } catch (err: any) {
      error.value = extractErrorMessage(err, `Failed to fetch device ${deviceId}`)
      toast.add({
        title: 'Error',
        description: error.value,
        color: 'error',
      })
      return null
    } finally {
      selectedDeviceLoading.value = false
    }
  }

  async function submitAudit(deviceId: number, auditData: { condition: string; status: string; comment: string }) {
    isLoading.value = true
    error.value = null
    const toast = useToast()

    try {
      await useApi(`/api/inventory/devices/${deviceId}/submit-audit/`, {
        method: 'POST',
        body: {
          condition: auditData.condition,
          status: auditData.status,
          comment: auditData.comment,
        },
      })

      toast.add({
        title: 'Success',
        description: 'Device audit submitted successfully',
        color: 'success',
      })

      return true
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Failed to submit audit')
      toast.add({
        title: 'Error',
        description: error.value,
        color: 'error',
      })
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function fetchAuditSummary(month: string, year: string, showGlobalLoader = false) {
    auditSummaryLoading.value = true
    error.value = null
    const { showLoader, hideLoader } = useGlobalLoader()

    if (showGlobalLoader && import.meta.client) {
      showLoader()
    }

    const toast = useToast()

    try {
      const monthNumber = monthsMap[month] || 2

      const response = await useApi<AuditSummaryResponse>('/api/inventory/audit-summary/', {
        params: {
          month: monthNumber,
          year: year
        }
      })

      auditSummaryData.value = response
      return response
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Failed to fetch audit summary')
      toast.add({
        title: 'Error',
        description: error.value,
        color: 'error',
      })
      auditSummaryData.value = null
      return null
    } finally {
      auditSummaryLoading.value = false
      if (showGlobalLoader && import.meta.client) {
        hideLoader()
      }
    }
  }

  const auditSummaryStats = computed(() => {
    return auditSummaryData.value?.data?.stats || {
      total_inventories: 0,
      audit_done: 0,
      audit_pending: 0,
      unassigned_inventories: 0,
      audit_good: 0,
      audit_issue: 0,
      audit_critical_issue: 0
    }
  })

  return {
    deviceCache,
    deviceList,
    isLoading,
    auditStatus,
    selectedDeviceLoading,
    error,
    allDevices,
    unauditedDevices,
    allItemsAudited,
    isDeviceAudited,
    fetchAuditStatus,
    loadDeviceList,
    fetchDeviceDetails,
    submitAudit,
    // Audit Summary
    auditSummaryLoading,
    auditSummaryData,
    auditSummaryStats,
    fetchAuditSummary,
  }
})
