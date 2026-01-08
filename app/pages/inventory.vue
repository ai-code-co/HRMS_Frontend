<template>
    <div v-if="store.isLoading && !store.items.length" class="p-12 text-center">
        <p class="text-slate-400 font-bold animate-pulse">Loading Inventory...</p>
    </div>

    <div v-else-if="selectedItem" class="flex flex-col bg-[#F8FAFC]">
        <header class="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <div class="flex items-center gap-3 mb-1">
                    <h1 class="text-2xl font-black text-slate-800 tracking-tight">My Inventory</h1>
                </div>
                <p class="text-xs font-bold text-slate-400">Manage and track devices assigned to you.</p>
            </div>

            <div class="w-full sm:w-80">
                <UInput v-model="searchQuery" icon="i-lucide-search" placeholder="Search devices..." size="xl"
                    class="w-full" />
            </div>
        </header>

        <main class="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden px-4">
            <aside class="w-full lg:w-96 space-y-4 overflow-y-auto shrink-0 custom-scrollbar sidebar-height">
                <button v-for="item in filteredItems" :key="item.id" @click="selectItem(item.id)" :class="[
                    'w-full text-left p-6 bg-white rounded-3xl border-2 transition-all duration-300 relative group overflow-hidden cursor-pointer',
                    selectedId === item.id ? 'border-primary-500 shadow-xl shadow-primary-100/50' : 'border-slate-50 hover:border-primary-100 shadow-sm'
                ]">
                    <div class="flex items-start gap-5">
                        <div :class="[
                            'p-4 rounded-2xl transition-colors',
                            selectedId === item.id ? 'bg-slate-50 text-primary-600' : 'bg-slate-50 text-slate-400 group-hover:text-primary-400'
                        ]">
                            <UIcon :name="getIcon(item.category)" class="w-5 h-5" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-start justify-between mb-1">
                                <h3 class="font-black text-slate-800 text-sm truncate pr-2">{{ item.name }}</h3>
                                <span
                                    :class="['text-[9px] font-black uppercase tracking-widest', item.status === 'Good' ? 'text-emerald-500' : 'text-rose-500']">
                                    {{ item.status }}
                                </span>
                            </div>
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ item.assetId }}
                            </p>
                        </div>
                    </div>
                </button>
            </aside>

            <section
                class="flex-1 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col mb-4 overflow-y-auto">
                <div class="flex-1 p-2 md:p-8">
                    <Transition name="fade-slide" mode="out-in">
                        <div :key="selectedItem.id" class="space-y-12">
                            <div class="flex items-start justify-between">
                                <div>
                                    <h2 class="text-3xl font-black text-slate-800 tracking-tight mb-2">{{
                                        selectedItem.name }}</h2>
                                    <div class="flex items-center gap-3">
                                        <span class="text-xs font-bold text-slate-400">{{ selectedItem.category
                                            }}</span>
                                        <span class="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                        <UBadge variant="soft" color="neutral" size="xs">ID: {{ selectedItem.id }}
                                        </UBadge>
                                    </div>
                                </div>
                                <UBadge :color="selectedItem.status === 'Good' ? 'success' : 'error'" variant="subtle"
                                    class="font-black">
                                    {{ selectedItem.status }}
                                </UBadge>
                            </div>

                            <div class="grid grid-cols-1 xl:grid-cols-2 gap-10">
                                <div
                                    class="aspect-video rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 group">
                                    <img :src="selectedItem.image"
                                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                </div>

                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <MyInventoryMetadataCard label="SERIAL NUMBER" :value="selectedItem.serialNumber" />
                                    <MyInventoryMetadataCard label="INTERNAL ASSET ID" :value="selectedItem.assetId" />
                                    <MyInventoryMetadataCard label="MODEL" :value="selectedItem.model" />
                                    <MyInventoryMetadataCard label="AUDIT STATUS" :value="selectedItem.auditStatus"
                                        :sub-value="`by ${selectedItem.auditBy}`" :highlight="true" />
                                </div>
                            </div>

                            <div>
                                <MyInventoryHistoryTimeline :history="selectedItem.history" />
                            </div>
                        </div>
                    </Transition>
                </div>
            </section>
        </main>
    </div>
</template>

<script setup lang="ts">
import { useMyInventoryStore } from '~/stores/myInventory'

const store = useMyInventoryStore()

const searchQuery = ref('')
const selectedId = ref<string | null>(null)

await useAsyncData('inventory-fetch', () => store.fetchInventory())

const filteredItems = computed(() => {
    if (!searchQuery.value) return store.items
    const query = searchQuery.value.toLowerCase()
    return store.items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.assetId.toLowerCase().includes(query)
    )
})

const selectedItem = computed(() => {
    if (!store.items.length) return null
    if (selectedId.value) {
        return store.items.find(i => i.id === selectedId.value) || store.items[0]
    }
    return store.items[0]
})

function selectItem(id: string) {
    selectedId.value = id
}

// Auto-select first item when data loads
watch(() => store.items.length, (newLength) => {
    if (newLength > 0 && !selectedId.value) {
        selectedId.value = store.items[0].id
    }
}, { immediate: true })


const getIcon = (category: string) => {
    const cat = category?.toLowerCase() || ''
    if (cat.includes('laptop')) return 'i-lucide-laptop'
    if (cat.includes('monitor')) return 'i-lucide-monitor'
    return 'i-lucide-monitor-smartphone'
}
</script>

<style scoped>
.sidebar-height {
    max-height: calc(100vh - 160px);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.3s ease;
}

.fade-slide-enter-from {
    opacity: 0;
    transform: translateX(20px);
}

.fade-slide-leave-to {
    opacity: 0;
    transform: translateX(-20px);
}

.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #E2E8F0;
    border-radius: 10px;
}
</style>