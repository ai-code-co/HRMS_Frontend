import { defineStore } from 'pinia'
import { ref } from 'vue'

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

  async function fetchInventory() {
    isLoading.value = true
    try {
      const response = await useApi<any>('/api/inventory/devices/my-devices/')

      const rawDevices = response.data?.devices || response.devices || []

      items.value = rawDevices.map((d: any) => ({
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
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    items,
    isLoading,
    fetchInventory
  }
})