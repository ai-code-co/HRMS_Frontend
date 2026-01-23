<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ChevronRight } from 'lucide-vue-next';
import { useInventoryStore } from '../stores/inventory';
import type { InventoryItem } from '../types/inventory';

import DashboardView from '../components/Inventory/DashboardView.vue';
import SidebarList from '../components/Inventory/SidebarList.vue';
import ItemDetails from '../components/Inventory/ItemDetails.vue';
import CommentSection from '../components/Inventory/CommentSection.vue';
import DocumentSection from '../components/Inventory/DocumentSection.vue';
import AddTypeModal from '../components/Inventory/AddTypeModal.vue';

const store = useInventoryStore();
const {
    categories,
    inventoryItems,
    selectedDetailItem,
    totalDevices,
    loadingDashboard
} = storeToRefs(store);

const route = useRoute();
const router = useRouter();

// Derive view state from URL - this ensures URL is the source of truth
const view = computed(() => route.query.category ? 'list' : 'dashboard');
const selectedCategoryId = computed(() => route.query.category as string | null);
const selectedItemId = ref<string | undefined>(undefined);
const isAddModalOpen = ref(false);
const hasInitialized = ref(false);

const comments = ref([
    { id: '1', author: 'John Raven', text: 'All Good', date: '4th Aug 25', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sushmita' }
]);

// Fetch dashboard data and restore URL state if present (SSR-friendly)
const { data: initialData } = await useAsyncData('admin-inventory-init', async () => {
    const dashboardData = await store.fetchDashboardSummary();

    const urlCategory = route.query.category as string | undefined;
    const urlDevice = route.query.device as string | undefined;

    let devicesData = null;
    let deviceDetail = null;

    if (urlCategory) {
        devicesData = await store.fetchDevicesByType(urlCategory, false);

        if (urlDevice) {
            deviceDetail = await store.fetchDeviceDetail(urlDevice, false);
        } else if (devicesData && devicesData.length > 0) {
            deviceDetail = await store.fetchDeviceDetail(devicesData[0].id, false);
        }
    }

    return {
        dashboard: dashboardData,
        devices: devicesData,
        detail: deviceDetail,
        selectedDevice: urlDevice || (devicesData?.[0]?.id?.toString())
    };
});

// Set initial data from SSR
if (import.meta.client) {
    if (initialData.value) {
        if (initialData.value.dashboard) {
            store.setDashboardData(initialData.value.dashboard);
        }
        if (initialData.value.devices) {
            store.setDevicesData(initialData.value.devices);
        }
        if (initialData.value.detail) {
            store.setDeviceDetail(initialData.value.detail);
        }
        if (initialData.value.selectedDevice) {
            selectedItemId.value = initialData.value.selectedDevice;
        }
    }
    hasInitialized.value = true;
}

// Handle URL changes without showing loading states (smooth navigation)
const navigateToCategory = async (categoryId: string, deviceId?: string) => {
    // Fetch devices silently (no loading state)
    const devices = await store.fetchDevicesByType(categoryId, false);

    // Select device
    const targetDeviceId = deviceId || devices?.[0]?.id?.toString();
    if (targetDeviceId) {
        selectedItemId.value = targetDeviceId;
        await store.fetchDeviceDetail(targetDeviceId, false);
    }
};

// Watch for URL changes and navigate smoothly
watch(() => route.query, async (newQuery, oldQuery) => {
    if (!hasInitialized.value) return;

    // Skip if this is the initial watch trigger (oldQuery is undefined)
    // and we already have data from SSR
    if (!oldQuery && inventoryItems.value.length > 0) return;

    if (!newQuery.category) {
        selectedItemId.value = undefined;
        return;
    }

    if (newQuery.category !== oldQuery?.category) {
        await navigateToCategory(newQuery.category as string, newQuery.device as string);
        return;
    }

    if (newQuery.device !== oldQuery?.device && newQuery.device) {
        selectedItemId.value = newQuery.device as string;
        await store.fetchDeviceDetail(newQuery.device as string, false);
    }
});

const handleSelectCategory = (id: string) => {
    router.push({ query: { ...route.query, category: id, device: undefined } });
};

const handleSelectItem = (item: InventoryItem) => {
    router.push({ query: { ...route.query, device: item.id } });
};

const handleBack = () => {
    router.push({ query: {} });
};
</script>

<template>
    <div class="flex h-screen bg-[#F8FAFC] font-sans text-slate-900">
        <div class="flex-1 flex flex-col relative">

            <div v-if="view === 'list'" class="h-16 px-4 md:px-6 flex items-center shrink-0 z-10">
                <button @click="handleBack"
                    class="px-3 py-2 bg-slate-100 hover:bg-slate-200 w-fit rounded-xl text-[11px] font-bold text-slate-500 transition-all flex items-center gap-1">
                    <ChevronRight :size="14" class="rotate-180" />
                    <span>Back to Dashboard</span>
                </button>
            </div>

            <main class="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full h-screen">
                <DashboardView v-if="view === 'dashboard'" :categories="categories" :total-devices="totalDevices"
                    :loading="loadingDashboard" @select-category="handleSelectCategory"
                    @open-add-modal="isAddModalOpen = true" />

                <div v-else class="flex h-full animate-fadeIn gap-6">
                    <div class="w-80 h-full shrink-0 overflow-auto custom-scrollbar">
                        <SidebarList :items="inventoryItems" :selected-id="selectedItemId" :loading="false"
                            @select="handleSelectItem" />
                    </div>

                    <div class="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                        <section class="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
                            <div class="flex flex-col xl:flex-row gap-10">
                                <ItemDetails :item="selectedDetailItem" :loading="false" />
                                <CommentSection :comments="comments" class="w-full xl:w-72 shrink-0" />
                            </div>
                        </section>
                        <DocumentSection />
                    </div>
                </div>
            </main>
        </div>

        <Teleport to="body">
            <AddTypeModal v-if="isAddModalOpen" @close="isAddModalOpen = false" />
        </Teleport>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(4px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fadeIn {
    animation: fadeIn 0.4s ease-out forwards;
}
</style>