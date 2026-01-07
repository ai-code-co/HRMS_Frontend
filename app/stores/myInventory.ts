import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useInventoryStore = defineStore('myInventory', () => {
  const items = ref<any[]>([])
  const searchQuery = ref('')
  const selectedId = ref<string | null>(null)
  const isLoading = ref(false)

  const filteredItems = computed(() => {
    if (!searchQuery.value) return items.value
    const query = searchQuery.value.toLowerCase()
    return items.value.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.assetId.toLowerCase().includes(query)
    )
  })

  const selectedItem = computed(() => {
    if (!items.value.length) return null
    if (selectedId.value) {
      return items.value.find(i => i.id === selectedId.value) || items.value[0]
    }
    return items.value[0]
  })

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
        history: []
      }))

      if (items.value.length > 0 && !selectedId.value) {
        selectedId.value = items.value[0].id
      }
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      isLoading.value = false
    }
  }

  function selectItem(id: string) {
    selectedId.value = id
  }

  return {
    items,
    searchQuery,
    selectedId,
    isLoading,
    filteredItems,
    selectedItem,
    fetchInventory,
    selectItem
  }
})