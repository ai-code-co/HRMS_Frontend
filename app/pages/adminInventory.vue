<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { ArrowLeft, ChevronRight } from 'lucide-vue-next';
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
    loadingDashboard,
    loadingDevices,
    loadingDetail
} = storeToRefs(store);

const route = useRoute();
const router = useRouter();

const view = ref<'dashboard' | 'list'>('dashboard');
const selectedCategoryId = ref<string | null>(null);
const selectedItemId = ref<string | undefined>(undefined);
const isAddModalOpen = ref(false);

const isMobileDetailOpen = ref(false);

const comments = ref([
    { id: '1', author: 'John Raven', text: 'All Good', date: '4th Aug 25', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sushmita' }
]);

await useAsyncData('dashboard-summary', async () => {
    await store.fetchDashboardSummary()

    const urlCategory = route.query.category as string | undefined
    const urlDevice = route.query.device as string | undefined
    if (urlCategory) {
        await restoreStateFromUrl(urlCategory, urlDevice)
    }
    return true
})
const restoreStateFromUrl = async (categoryId: string, deviceId?: string) => {
    view.value = 'list';
    selectedCategoryId.value = categoryId;

    await store.fetchDevicesByType(categoryId);

    if (deviceId) {
        selectedItemId.value = deviceId;
        isMobileDetailOpen.value = true;
        await store.fetchDeviceDetail(deviceId);
    } else {
        isMobileDetailOpen.value = false;
        if (inventoryItems.value.length > 0) {
            const firstItem = inventoryItems.value[0];
            selectedItemId.value = firstItem.id;
            await store.fetchDeviceDetail(firstItem.id);
        }
    }
};

watch(() => route.query, async (newQuery, oldQuery) => {
    if (!newQuery.category) {
        view.value = 'dashboard';
        selectedCategoryId.value = null;
        selectedItemId.value = undefined;
        isMobileDetailOpen.value = false;
        return;
    }

    if (newQuery.category !== oldQuery?.category) {
        await restoreStateFromUrl(newQuery.category as string, newQuery.device as string);
        return;
    }

    if (newQuery.device !== oldQuery?.device) {
        if (newQuery.device) {
            selectedItemId.value = newQuery.device as string;
            isMobileDetailOpen.value = true;
            await store.fetchDeviceDetail(newQuery.device as string);
        } else {
            isMobileDetailOpen.value = false;
        }
    }
});

const handleSelectCategory = (id: string) => {
    router.push({ query: { ...route.query, category: id, device: undefined } });
};

const handleSelectItem = (item: InventoryItem) => {
    router.push({ query: { ...route.query, device: item.id } });
};

const handleBack = () => {
    if (isMobileDetailOpen.value) {
        const newQuery = { ...route.query };
        delete newQuery.device;
        router.push({ query: newQuery });
    } else {
        router.push({ query: {} });
    }
};
</script>

<template>
    <div class="flex h-screen bg-[#F8FAFC] font-sans text-slate-900">
        <div class="flex-1 flex flex-col relative">

            <div v-if="view === 'list'" class="h-16 px-4 md:px-6 flex items-center shrink-0 z-10">
                <button @click="handleBack"
                    class="px-3 py-2 bg-slate-100 hover:bg-slate-200 w-fit rounded-xl text-[11px] font-bold text-slate-500 transition-all flex items-center gap-1">

                    <ArrowLeft v-if="isMobileDetailOpen" :size="14" />
                    <ChevronRight v-else :size="14" class="rotate-180" />

                    <span>{{ isMobileDetailOpen ? 'Back to List' : 'Back to Dashboard' }}</span>
                </button>
            </div>

            <main class="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
                <DashboardView v-if="view === 'dashboard'" :categories="categories" :total-devices="totalDevices"
                    :loading="loadingDashboard" @select-category="handleSelectCategory"
                    @open-add-modal="isAddModalOpen = true" />

                <div v-else class="flex h-full animate-fadeIn gap-6">
                    <div :class="[
                        'transition-all duration-300 ease-in-out h-full',
                        isMobileDetailOpen ? 'hidden lg:block lg:w-80' : 'w-full lg:w-80'
                    ]">
                        <SidebarList :items="inventoryItems" :selected-id="selectedItemId" :loading="loadingDevices"
                            @select="handleSelectItem" />
                    </div>

                    <div :class="[
                        'flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6',
                        !isMobileDetailOpen ? 'hidden lg:block' : 'block'
                    ]">
                        <section class="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
                            <div class="flex flex-col xl:flex-row gap-10">
                                <ItemDetails :item="selectedDetailItem" :loading="loadingDetail" />
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