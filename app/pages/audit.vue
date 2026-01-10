<template>
    <div v-if="store.isLoading && !store.items.length" class="p-12 text-center">
        <p class="text-slate-400 font-bold animate-pulse">Loading Inventory...</p>
    </div>

    <div v-else-if="selectedItem" class="flex flex-col bg-[#F8FAFC]">
        <header class="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <div class="flex items-center gap-3 mb-1">
                    <h1 class="text-2xl font-black text-slate-800 tracking-tight">Device Audit</h1>
                </div>
                <p class="text-xs font-bold text-slate-400">Update condition and status of assigned devices.</p>
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
                            </div>
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ item.assetId }}
                            </p>
                        </div>
                    </div>
                </button>
            </aside>

            <section
                class="flex-1 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col mb-4 overflow-y-auto">
                <div class="flex-1 p-2 md:p-4">
                    <Transition name="fade-slide" mode="out-in">
                        <div :key="selectedItem.id" class="space-y-4">
                            <div class="flex items-start justify-between">
                                <div>
                                    <h2 class="text-lg font-black text-slate-800 tracking-tight mb-1">{{
                                        selectedItem.name }}</h2>
                                    <div class="flex items-center gap-2">
                                        <span class="text-xs font-bold text-slate-400">{{ selectedItem.category
                                        }}</span>
                                        <span class="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                        <UBadge variant="soft" color="neutral" size="xs">ID: {{ selectedItem.id }}
                                        </UBadge>
                                    </div>
                                </div>
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

                            <UForm :schema="auditSchema" :state="formState" @submit="onSubmit" class="space-y-3">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <UFormField label="Condition" name="condition" required>
                                        <USelectMenu v-model="formState.condition" :items="conditionOptions"
                                            placeholder="Select device condition" size="md" color="secondary"
                                            variant="outline" class="w-full" arrow value-key="value" />
                                    </UFormField>

                                    <UFormField label="Status" name="status" required>
                                        <USelectMenu v-model="formState.status" :items="statusOptions"
                                            placeholder="Select device status" size="md" color="secondary"
                                            variant="outline" class="w-full" arrow value-key="value" />
                                    </UFormField>
                                </div>
                                <UFormField label="Comment" name="comment" required>
                                    <UTextarea v-model="formState.comment" :rows="3" size="md"
                                        placeholder="Add your audit comment..." color="secondary" variant="outline"
                                        class="w-full" />
                                </UFormField>

                                <div class="flex gap-3 pt-4">
                                    <UButton type="submit" size="lg" color="primary" variant="solid"
                                        :loading="isSubmitting" class="font-bold">
                                        Submit Audit
                                    </UButton>
                                </div>
                            </UForm>
                        </div>
                    </Transition>
                </div>
            </section>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import type { SelectMenuItem } from '@nuxt/ui'
import { useMyInventoryStore } from '~/stores/myInventory'

const auditSchema = z.object({
    condition: z.string().min(1, 'Condition is required'),
    status: z.string().min(1, 'Status is required'),
    comment: z.string().min(1, 'Comment is required').min(3, 'Comment must be at least 3 characters'),
})

type AuditSchema = z.output<typeof auditSchema>

const store = useMyInventoryStore()
const toast = useToast()
const router = useRouter()

const selectedId = ref<string | null>(null)
const isSubmitting = ref(false)

const formState = ref({
    condition: '',
    status: '',
    comment: '',
})

const conditionOptions = ref<SelectMenuItem[]>([
    { label: 'New', value: 'new' },
    { label: 'Excellent', value: 'excellent' },
    { label: 'Good', value: 'good' },
    { label: 'Fair', value: 'fair' },
    { label: 'Poor', value: 'poor' },
])

const statusOptions = ref<SelectMenuItem[]>([
    { label: 'Working', value: 'working' },
    { label: 'Need to Sell', value: 'need_to_sell' },
    { label: 'Damaged', value: 'damaged' },
    { label: 'Repair', value: 'repair' },
    { label: 'Retired', value: 'retired' },
    { label: 'Lost', value: 'lost' },
    { label: 'Other', value: 'other' },
])

const { data: inventoryData } = await useAsyncData('inventory-fetch', () => {
    return store.fetchInventory()
})

if (import.meta.client && inventoryData.value) {
    store.setItems(inventoryData.value)
}

const filteredItems = computed(() => {
    return store.items
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
    resetForm()
}

function resetForm() {
    formState.value = {
        condition: '',
        status: '',
        comment: '',
    }
}

async function onSubmit(event: FormSubmitEvent<AuditSchema>) {
    if (!selectedItem.value) return

    isSubmitting.value = true
    try {
        await useApi(`/api/inventory/devices/${selectedItem.value.id}/submit-audit/`, {
            method: 'POST',
            body: {
                condition: event.data.condition,
                status: event.data.status,
                comment: event.data.comment,
            },
        })

        toast.add({
            title: 'Success',
            description: `Audit submitted successfully for ${selectedItem.value.name}`,
            color: 'success',
        })

        resetForm()
    } catch (err: any) {
        toast.add({
            title: 'Error',
            description: err?.data?.error || err?.message || 'Failed to submit audit',
            color: 'error',
        })
    } finally {
        isSubmitting.value = false
    }
}

watch(
    () => store.items.length,
    (newLength) => {
        if (newLength > 0 && !selectedId.value && store.items[0]?.id) {
            selectedId.value = store.items[0].id
        }
    },
    { immediate: true }
)

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
