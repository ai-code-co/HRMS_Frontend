import { defineStore } from 'pinia'
import { ref } from 'vue'
import { extractErrorMessage } from '~/composables/useErrorMessage'

export interface Comment {
  id: number
  comment: string
  employee_name: string
  created_at: string
  formatted_date: string
  photo_url: string
}

export interface InventoryDevice {
  id: string
  name: string
  category: string
  assetId: string
  serialNumber: string
  status: string
  model: string
  image: string
  auditStatus: string
  auditBy: string
  history: Comment[]
}

export const useMyInventoryStore = defineStore('myInventory', () => {
  const items = ref<InventoryDevice[]>([])
  const isLoading = ref(false)

  async function fetchInventory(showGlobalLoader = false, userId?: number | null) {
    isLoading.value = true
    const { showLoader, hideLoader } = useGlobalLoader()

    if (showGlobalLoader && import.meta.client) {
      showLoader()
    }
    try {
      let params: Record<string, any> = {}
      if (userId) {
        params.userid = userId
      }
      const response = await useApi<any>('/api/inventory/devices/my-devices/', { params })

      const rawDevices = response.data?.devices || response.devices || []

      const mappedItems = rawDevices.map((d: any) => ({
        id: d.id.toString(),
        name: d.model_name,
        category: d.device_type_name,
        assetId: d.serial_number,
        serialNumber: d.serial_number,
        status: d.condition_display,
        model: `${d.brand} ${d.model_name}`,
        image: 'https://placehold.co/600x400/F1F5F9/64748B?text=Device',
        auditStatus: 'Verified',
        auditBy: 'System Audit',
        history: (d.recent_comments || []).map((comment: any) => ({
          id: comment.id,
          comment: comment.comment,
          employee_name: comment.employee_name,
          created_at: comment.created_at,
          formatted_date: comment.formatted_date,
          photo_url: comment.photo_url,
        }))
      }))
      items.value = mappedItems
      return mappedItems
    } catch (err: any) {
      const toast = useToast()
      toast.add({
        title: 'Error',
        description: extractErrorMessage(err, 'Failed to fetch inventory'),
        color: 'error'
      })
      return []
    } finally {
      isLoading.value = false
      if (showGlobalLoader && import.meta.client) {
        hideLoader()
      }
    }
  }

  function setItems(data: InventoryDevice[]) {
    items.value = data
  }

  return {
    items,
    isLoading,
    fetchInventory,
    setItems
  }
})