import { defineStore } from 'pinia'

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
  const searchQuery = ref('')
  const selectedId = ref('1')

  const items = ref<InventoryItem[]>([
    {
      id: '1',
      name: 'HP EliteBook 840',
      category: 'Laptop',
      assetId: 'LA-057 / Pass - 2025',
      assignedDate: '2025-11-04',
      status: 'Good',
      serialNumber: '5CD2088X85',
      model: 'G8 Notebook PC',
      auditStatus: 'Verified on 2025-12-02',
      auditDate: '2025-12-02',
      auditBy: 'Shakti Saxena',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800',
      history: [
        {
          user: 'Shakti Saxena',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Shakti',
          action: 'Audit Completed',
          comment: 'Device is in good condition. No scratches found.',
          timestamp: '2025-12-02 12:01 PM'
        }
      ]
    },
    {
        id: '2',
        name: 'HP 65W Charger',
        category: 'Accessories',
        assetId: 'CH-057',
        assignedDate: '2025-11-04',
        status: 'Good',
        serialNumber: 'ADP-65HB',
        model: 'Smart AC Adapter',
        auditStatus: 'Verified on 2025-12-02',
        auditDate: '2025-12-02',
        auditBy: 'Shakti Saxena',
        image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800',
        history: []
      },
      {
        id: '3',
        name: 'Dell UltraSharp 27',
        category: 'Monitor',
        assetId: 'MON-202',
        assignedDate: '2025-01-15',
        status: 'Damaged',
        serialNumber: 'CN-0H190M',
        model: 'U2723QE',
        auditStatus: 'Pending Review',
        auditDate: '2025-01-20',
        auditBy: 'System',
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800',
        history: []
      }
  ])

  const filteredItems = computed(() => {
    if (!searchQuery.value) return items.value
    return items.value.filter(item => 
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.assetId.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })

  const selectedItem = computed(() => 
    items.value.find(i => i.id === selectedId.value) || items.value[0]
  )

  function selectItem(id: string) {
    selectedId.value = id
  }

  return { searchQuery, items, filteredItems, selectedItem, selectItem }
})