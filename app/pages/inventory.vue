<script setup lang="ts">
type InventoryItem = {
    id: string
    name: string
    category: 'Laptop' | 'Charger' | 'Monitor' | 'Peripheral'
    model: string
    serialNumber: string
    internalId: string
    assignDate: string
    status: 'Good' | 'Damaged' | 'Repair'
    image: string
    auditedBy: string
    lastAuditDate: string
    history: {
        id: number
        user: string
        avatar: string
        action: string
        date: string
        note?: string
    }[]
}

const inventory = ref<InventoryItem[]>([
    {
        id: '985',
        name: 'HP EliteBook 840',
        category: 'Laptop',
        model: 'G8 Notebook PC',
        serialNumber: '5CD2088X85',
        internalId: 'LA-057 / Pass - 2025',
        assignDate: '2025-11-04',
        status: 'Good',
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop',
        auditedBy: 'Shakti Saxena',
        lastAuditDate: '2025-12-02',
        history: [
            { id: 1, user: 'Shakti Saxena', avatar: 'https://i.pravatar.cc/150?u=shakti', action: 'Audit Completed', date: '2025-12-02 12:01 PM', note: 'Device is in good condition. No scratches found.' },
            { id: 2, user: 'Tinky Chaudhary', avatar: 'https://i.pravatar.cc/150?u=tinky', action: 'Details Updated', date: '2025-11-25 11:10 AM', note: 'Updated OS version details.' },
            { id: 3, user: 'Tinky Chaudhary', avatar: 'https://i.pravatar.cc/150?u=tinky', action: 'Assigned', date: '2025-11-04 05:53 PM', note: 'Assigned to Shakti Saxena' },
        ]
    },
    {
        id: 'CH-057',
        name: 'HP 65W Charger',
        category: 'Charger',
        model: 'Original HP Adapter',
        serialNumber: 'N/A',
        internalId: 'CH-057',
        assignDate: '2025-11-04',
        status: 'Good',
        image: 'https://images.unsplash.com/photo-1622359253406-02a87bb900f0?q=80&w=2000&auto=format&fit=crop',
        auditedBy: 'Pawan Kumar',
        lastAuditDate: '2025-11-03',
        history: [
            { id: 1, user: 'Pawan Kumar', avatar: 'https://i.pravatar.cc/150?u=pawan', action: 'Assigned', date: '2025-11-04 10:00 AM' }
        ]
    },
    {
        id: 'MON-202',
        name: 'Dell UltraSharp 27',
        category: 'Monitor',
        model: 'U2722DE',
        serialNumber: 'CN-0V1234-789',
        internalId: 'MON-202',
        assignDate: '2025-01-15',
        status: 'Damaged',
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=2070&auto=format&fit=crop',
        auditedBy: 'System Admin',
        lastAuditDate: '2025-02-20',
        history: [
            { id: 1, user: 'Shakti Saxena', avatar: 'https://i.pravatar.cc/150?u=shakti', action: 'Reported Issue', date: '2025-02-20 09:30 AM', note: 'Dead pixel appearing on top left corner.' },
            { id: 2, user: 'System Admin', avatar: 'https://i.pravatar.cc/150?u=admin', action: 'Assigned', date: '2025-01-15 09:00 AM' }
        ]
    }
])

const searchQuery = ref('')
const selectedItemId = ref<string | null>(inventory.value[0].id)
const isMobileDetailOpen = ref(false)

const filteredInventory = computed(() => {
    if (!searchQuery.value) return inventory.value
    const q = searchQuery.value.toLowerCase()
    return inventory.value.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.internalId.toLowerCase().includes(q)
    )
})

const selectedItem = computed(() =>
    inventory.value.find(i => i.id === selectedItemId.value)
)

const selectItem = (id: string) => {
    selectedItemId.value = id

    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        isMobileDetailOpen.value = true
    }
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Good': return 'green'
        case 'Damaged': return 'red'
        case 'Repair': return 'orange'
        default: return 'gray'
    }
}

const getCategoryIcon = (cat: string) => {
    switch (cat) {
        case 'Laptop': return 'i-lucide-laptop'
        case 'Charger': return 'i-lucide-plug'
        case 'Monitor': return 'i-lucide-monitor'
        default: return 'i-lucide-box'
    }
}
</script>

<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8">

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <UIcon name="i-lucide-package" class="w-7 h-7 text-primary-600" />
                    My Inventory
                </h1>
                <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Manage and track devices assigned to you.
                </p>
            </div>
            <div class="w-full sm:w-72">
                <UInput v-model="searchQuery" icon="i-lucide-search" placeholder="Search devices..." class="w-full"
                    :ui="{ icon: { trailing: { pointer: '' } } }">
                    <template #trailing>
                        <UKbd>Cmd+K</UKbd>
                    </template>
                </UInput>
            </div>
        </div>

        <!-- Main Grid Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">

            <!-- Left Column: Inventory List -->
            <div class="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1 pb-4">
                <UCard v-for="item in filteredInventory" :key="item.id"
                    class="cursor-pointer transition-all duration-200 hover:shadow-md group relative overflow-hidden"
                    :class="[
                        selectedItemId === item.id
                            ? 'ring-2 ring-primary-500 dark:ring-primary-400 bg-white dark:bg-gray-900'
                            : 'hover:border-primary-200 dark:hover:border-primary-800'
                    ]" @click="selectItem(item.id)">
                    <div v-if="selectedItemId === item.id" class="absolute left-0 top-0 bottom-0 w-1 bg-primary-500">
                    </div>

                    <div class="flex items-start gap-4 p-1">
                        <div
                            class="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                            <UIcon :name="getCategoryIcon(item.category)"
                                class="w-6 h-6 text-gray-500 group-hover:text-primary-600 dark:text-gray-400" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex justify-between items-start">
                                <h3 class="font-semibold text-gray-900 dark:text-white truncate pr-2">
                                    {{ item.name }}
                                </h3>
                                <UBadge :color="getStatusColor(item.status)" variant="subtle" size="xs">
                                    {{ item.status }}
                                </UBadge>
                            </div>
                            <p class="text-xs text-gray-500 font-mono mt-1">{{ item.internalId }}</p>
                            <div class="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                <span>Assigned: {{ item.assignDate }}</span>
                            </div>
                        </div>
                    </div>
                </UCard>
            </div>
            <div class="hidden lg:block lg:col-span-8 h-full">
                <transition name="fade" mode="out-in">
                    <div v-if="selectedItem" :key="selectedItem.id" class="h-full">
                        <UCard class="h-full flex flex-col overflow-hidden" :ui="{ body: 'p-0 h-full flex flex-col' }">
                            <InventoryDetailView :item="selectedItem" />
                        </UCard>
                    </div>
                </transition>
            </div>

        </div>

        <!-- Mobile Slideover for Details -->
        <!-- <USlideover v-model="isMobileDetailOpen" :ui="{ width: 'w-screen max-w-md' }">
            <UCard class="flex flex-col flex-1 h-full"
                :ui="{ body: { base: 'flex-1 overflow-y-auto p-0' }, ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                            Device Details
                        </h3>
                        <UButton color="gray" variant="ghost" icon="i-lucide-x" @click="isMobileDetailOpen = false" />
                    </div>
                </template>

                <div v-if="selectedItem">
                    <InventoryDetailView :item="selectedItem" />
                </div>
            </UCard>
        </USlideover> -->

    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>