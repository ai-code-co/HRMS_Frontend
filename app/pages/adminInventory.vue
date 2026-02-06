<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ChevronRight } from 'lucide-vue-next';
import { useInventoryStore } from '../stores/inventory';
import type { InventoryItem } from '../types/inventory';
import { useGlobalLoader } from '../composables/useGlobalLoader';

import DashboardView from '../components/Inventory/DashboardView.vue';
import SidebarList from '../components/Inventory/SidebarList.vue';
import ItemDetails from '../components/Inventory/ItemDetails.vue';
import DocumentsCard from '../components/Inventory/DocumentsCard.vue';
import CommentSection from '../components/Inventory/CommentSection.vue';
import AddTypeModal from '../components/Inventory/AddTypeModal.vue';

const store = useInventoryStore();
const {
    categories,
    inventoryItems,
    selectedDetailItem,
    totalDevices,
    loadingDashboard,
    loadingDevices,
    loadingDetail
} = storeToRefs(store);

const route = useRoute();
const router = useRouter();
const { showLoader, hideLoader } = useGlobalLoader();

// Track timeout for loader auto-hide
let loaderTimeout: number | null = null;

// Derive view state from URL - this ensures URL is the source of truth
const view = computed(() => (route.query.category || route.query.unassigned) ? 'list' : 'dashboard');
const selectedCategoryId = computed(() => route.query.category as string | null);
const selectedItemId = ref<string | undefined>(undefined);
const isAddModalOpen = ref(false);
const hasInitialized = ref(false);

// 1. Define the active filter based on the query parameter
const activeFilter = computed(() => {
    return route.query.unassigned !== undefined ? 'Unassigned' : 'Assigned';
});

// Category options for dropdown
const categoryOptions = computed(() => {
    return categories.value.map(cat => ({
        label: cat.name,
        value: cat.id
    }));
});

// Selected category value for dropdown - sync with route
const selectedCategoryValue = computed(() => {
    const catId = route.query.category as string | undefined;
    if (catId) return catId;
    const firstCategory = categories.value[0];
    return firstCategory ? firstCategory.id : '';
});

// Computed property to track filter state for watch
const filterState = computed(() => {
    return {
        isUnassigned: !!route.query.unassigned,
        category: route.query.category as string | undefined,
        device: route.query.device as string | undefined
    };
});

// 2. Handle the filter change - update query parameter and fetch data directly
const handleFilterChange = async (filter: string) => {
    const newQuery: any = {};
    const currentCategory = route.query.category as string | undefined;

    // Always keep category if it exists
    if (currentCategory) {
        newQuery.category = currentCategory;
    }

    if (filter === 'Unassigned') {
        // Set unassigned filter (remove assigned if present)
        newQuery.unassigned = '';
    } else {
        // Set assigned filter (remove unassigned if present)
        newQuery.assigned = '';
    }

    // Update URL first
    await router.push({ path: '/adminInventory', query: newQuery });

    // Directly fetch data based on filter (don't wait for watch)
    if (filter === 'Unassigned') {
        await navigateToUnassigned(undefined, currentCategory);
    } else if (currentCategory) {
        await navigateToCategory(currentCategory);
    } else {
        selectedItemId.value = undefined;
        store.setDevicesData([]);
        store.setDeviceDetail(null);
    }
};


// Fetch dashboard data and restore URL state if present (SSR-friendly)
const { data: initialData } = await useAsyncData('admin-inventory-init', async () => {
    const dashboardData = await store.fetchDashboardSummary();

    const urlCategory = route.query.category as string | undefined;
    const urlDevice = route.query.device as string | undefined;
    const isUnassigned = !!route.query.unassigned;

    let devicesData = null;
    let deviceDetail = null;

    if (isUnassigned) {
        // Fetch unassigned devices with category filter if present
        devicesData = await store.fetchUnassignedDevices('', urlCategory, false);

        if (urlDevice) {
            deviceDetail = await store.fetchDeviceDetail(urlDevice, false);
        } else if (devicesData && devicesData.length > 0 && devicesData[0]) {
            deviceDetail = await store.fetchDeviceDetail(devicesData[0].id, false);
        }
    } else if (urlCategory) {
        // Fetch assigned devices by category
        devicesData = await store.fetchDevicesByType(urlCategory, false);

        if (urlDevice) {
            deviceDetail = await store.fetchDeviceDetail(urlDevice, false);
        } else if (devicesData && devicesData.length > 0 && devicesData[0]) {
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

// Handle URL changes with loading states
const navigateToCategory = async (categoryId: string, deviceId?: string) => {
    // Fetch devices with loading state
    const devices = await store.fetchDevicesByType(categoryId, true);

    // Select device - check if deviceId exists in the new list, otherwise select first
    let targetDeviceId = deviceId;
    if (deviceId) {
        const deviceExists = devices?.some(d => d.id.toString() === deviceId);
        if (!deviceExists) {
            targetDeviceId = devices?.[0]?.id?.toString();
        }
    } else {
        targetDeviceId = devices?.[0]?.id?.toString();
    }

    if (targetDeviceId) {
        selectedItemId.value = targetDeviceId;
        // Update URL with device
        await router.push({
            query: {
                ...route.query,
                category: categoryId,
                device: targetDeviceId
            }
        });
        await store.fetchDeviceDetail(targetDeviceId, true);
    } else {
        selectedItemId.value = undefined;
        // Update URL without device
        await router.push({
            query: {
                ...route.query,
                category: categoryId
            }
        });
    }
};

// Handle unassigned filter navigation
const navigateToUnassigned = async (deviceId?: string, categoryId?: string) => {
    // Use category from route if not provided
    const category = categoryId || (route.query.category as string | undefined);
    // Fetch unassigned devices with loading state and category filter
    const devices = await store.fetchUnassignedDevices('', category, true);

    // Select device - check if deviceId exists in the new list, otherwise select first
    let targetDeviceId = deviceId;
    if (deviceId) {
        const deviceExists = devices?.some(d => d.id.toString() === deviceId);
        if (!deviceExists) {
            targetDeviceId = devices?.[0]?.id?.toString();
        }
    } else {
        targetDeviceId = devices?.[0]?.id?.toString();
    }

    if (targetDeviceId) {
        selectedItemId.value = targetDeviceId;
        // Update URL with device and category
        const newQuery: any = {
            unassigned: '',
            device: targetDeviceId
        };
        if (category) {
            newQuery.category = category;
        }
        await router.push({ query: { ...route.query, ...newQuery } });
        await store.fetchDeviceDetail(targetDeviceId, true);
    } else {
        selectedItemId.value = undefined;
        // Update URL without device but keep category
        const newQuery: any = { unassigned: '' };
        if (category) {
            newQuery.category = category;
        }
        await router.push({ query: { ...route.query, ...newQuery } });
    }
};

// Watch for route query changes to show/hide loader
watch(() => route.query, (newQuery, oldQuery) => {
    if (!hasInitialized.value) return;
    if (!oldQuery) return; // Skip initial trigger
    
    // Check if query actually changed
    const queryChanged = JSON.stringify(newQuery) !== JSON.stringify(oldQuery);
    if (!queryChanged) return;

    // Clear any existing timeout
    if (loaderTimeout) {
        clearTimeout(loaderTimeout);
    }

    // Show loader
    showLoader();

    // Hide loader after 4 seconds (middle of 3-5 second range)
    loaderTimeout = setTimeout(() => {
        hideLoader();
        loaderTimeout = null;
    }, 3000);
}, { deep: true });

// Watch for filter state changes (only for category and device changes, not filter changes)
watch(filterState, async (newState, oldState) => {
    if (!hasInitialized.value) return;
    if (!oldState) return; // Skip initial trigger

    const isUnassigned = newState.isUnassigned;
    const wasUnassigned = oldState.isUnassigned;

    // Skip filter changes - handleFilterChange handles those directly
    if (isUnassigned !== wasUnassigned) {
        return;
    }

    // Handle category change (for both assigned and unassigned)
    if (newState.category && newState.category !== oldState.category) {
        if (isUnassigned) {
            await navigateToUnassigned(newState.device, newState.category);
        } else {
            await navigateToCategory(newState.category, newState.device);
        }
        return;
    }

    // Handle device selection change
    if (newState.device !== oldState.device && newState.device) {
        selectedItemId.value = newState.device;
        await store.fetchDeviceDetail(newState.device, true);
        return;
    }

    // Clear selection if no category and not unassigned
    if (!isUnassigned && !newState.category) {
        selectedItemId.value = undefined;
    }
}, { deep: true });

// Handle category selection from dropdown
const handleCategorySelect = async (value: any) => {
    const categoryId = typeof value === 'string' ? value : (value?.value || value);
    if (!categoryId) return;

    const isUnassigned = route.query.unassigned !== undefined;
    const newQuery: any = {
        category: categoryId,
        device: undefined
    };

    if (isUnassigned) {
        // Keep unassigned filter
        newQuery.unassigned = '';
    } else {
        // Set assigned filter
        newQuery.assigned = '';
    }

    await router.push({ query: newQuery });

    // Fetch data based on current filter
    if (isUnassigned) {
        await navigateToUnassigned(undefined, categoryId);
    } else {
        await navigateToCategory(categoryId);
    }
};

const handleSelectCategory = (id: string) => {
    // When selecting a category from dashboard, switch to assigned filter
    const newQuery: any = {
        category: id,
        device: undefined,
        assigned: '' // Set assigned filter
    };
    router.push({ query: newQuery });
};

const handleSelectItem = async (item: InventoryItem) => {
    selectedItemId.value = item.id;
    await router.push({ query: { ...route.query, device: item.id } });
    // Fetch device detail directly
    await store.fetchDeviceDetail(item.id, true);
};

const handleBack = () => {
    router.push({ query: {} });
};

// Cleanup timeout on unmount
onUnmounted(() => {
    if (loaderTimeout) {
        clearTimeout(loaderTimeout);
    }
});
</script>

<template>
    <div class="flex h-screen bg-[#F8FAFC] font-sans text-slate-900">
        <div class="flex-1 flex flex-col relative">

            <div v-if="view === 'list'" class="px-4 md:px-6">
                <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm rounded-xl px-6 py-4 sticky top-0 z-20">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-800">Inventory Items</h2>
                        <p class="text-sm text-slate-400">Manage assigned and unassigned devices by category.</p>
                    </div>
                    <div class="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
                        <div class="flex items-center gap-1 bg-slate-100/60 p-1 rounded-xl border border-slate-200 shadow-sm">
                            <UButton v-for="f in ['Assigned', 'Unassigned']" :key="f" size="xs" variant="ghost" :class="[
                                'px-6 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all duration-200',
                                activeFilter === f
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                            ]" @click="handleFilterChange(f)">
                                {{ f }}
                            </UButton>
                        </div>
                        <USelect
                            :model-value="selectedCategoryValue"
                            @update:model-value="handleCategorySelect"
                            :items="categoryOptions"
                            option-attribute="label"
                            value-attribute="value"
                            placeholder="Select category"
                            size="lg"
                            class="min-w-45 border border-slate-200 rounded-xl shadow-sm"
                        />
                        <UButton 
                            label="Audit Summary" 
                            color="primary" 
                            size="lg"
                            class="border border-slate-200 rounded-xl shadow-sm"
                            @click="navigateTo('/audit-summary')"
                        />
                    </div>
                </div>
            </div>

            <main class="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full h-screen">
                <DashboardView v-if="view === 'dashboard'" :categories="categories" :total-devices="totalDevices"
                    :loading="loadingDashboard" @select-category="handleSelectCategory"
                    @open-add-modal="isAddModalOpen = true" />

                <div v-else class="flex h-full animate-fadeIn gap-6">
                    <div class="w-80 h-full shrink-0 overflow-auto custom-scrollbar">
                        <SidebarList :items="inventoryItems" :selected-id="selectedItemId" :loading="loadingDevices"
                            @select="handleSelectItem" />
                    </div>

                    <div class="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                        <section class="flex flex-col gap-10">
                            <div class="flex flex-col xl:flex-row gap-6">
                                <div class="flex-1 bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
                                    <ItemDetails :item="selectedDetailItem" :loading="loadingDetail" />
                                </div>
                                <DocumentsCard />
                            </div>
                            <div class="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
                                <CommentSection :device-id="selectedItemId" class="w-full" />
                            </div>
                        </section>
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