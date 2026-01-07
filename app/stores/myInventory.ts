import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface HistoryEvent {
  user: string
  avatar: string
  action: string
  comment: string
  timestamp: string
}

export interface InventoryItem {
  id: string
  name: string
  category: 'Laptop' | 'Monitor' | 'Accessories' | string
  assetId: string
  assignedDate: string
  status: 'Good' | 'Damaged' | 'Repair'
  serialNumber: string
  model: string
  auditStatus: string
  auditDate: string
  auditBy: string
  image: string
  history: HistoryEvent[]
}

export const useInventoryStore = defineStore('myInventory', () => {
  // State
  const items = ref<InventoryItem[]>([])
  const searchQuery = ref('')
  const selectedId = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const filteredItems = computed(() => {
    if (!searchQuery.value) return items.value
    return items.value.filter(item =>
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.assetId.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })

  const selectedItem = computed(() => {
    if (selectedId.value) {
      return items.value.find(i => i.id === selectedId.value) || null
    }
    return items.value.length > 0 ? items.value[0] : null
  })

  async function fetchInventory() {
    isLoading.value = true
    error.value = null

    try {
      const response = await useApi('/api/inventory/devices/my-devices/')
      items.value = response

      if (items.value.length > 0 && !selectedId.value) {
        selectedId.value = items.value[0].id
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An unknown error occurred'
      console.error('Error fetching inventory:', err)
    } finally {
      isLoading.value = false
    }
  }

  function selectItem(id: string) {
    selectedId.value = id
  }

  return {
    searchQuery,
    items,
    filteredItems,
    selectedItem,
    isLoading,
    error,
    selectItem,
    fetchInventory
  }
})