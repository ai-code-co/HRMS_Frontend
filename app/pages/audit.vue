<template>
    <div class="w-full min-h-screen bg-[#F8FAFC] flex flex-col">
        <div v-if="store.isLoading && !allDevices.length" class="flex-1 flex items-center justify-center">
            <div class="text-center space-y-4">
                <UIcon name="i-lucide-loader-2" class="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
                <p class="text-slate-400 font-bold">Loading Devices...</p>
            </div>
        </div>

        <div v-else class="flex flex-col h-full">
            <header class="p-4 sm:p-6 border-b border-slate-100 bg-white">
                <div class="space-y-2">
                    <h1 class="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Device Audit</h1>
                    <p class="text-xs sm:text-sm font-bold text-slate-400">
                        Complete device audits before proceeding. <span class="text-orange-600">{{ unauditedDevices.length }}</span> device(s) pending out of {{ allDevices.length }}.
                    </p>
                </div>
            </header>

        <main class="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden p-4 sm:p-6">
            <aside class="w-full lg:w-96 space-y-3 overflow-y-auto shrink-0 custom-scrollbar sidebar-height">
                <button v-for="device in allDevices" 
                        :key="device.id" 
                        @click="selectDevice(device.id)"
                        :class="[
                            'w-full text-left p-5 bg-white rounded-2xl border-2 transition-all duration-300 relative group overflow-hidden cursor-pointer',
                            selectedDeviceId === device.id 
                                ? 'border-primary-500 shadow-lg shadow-primary-100/50' 
                                : 'border-slate-100 hover:border-primary-200 shadow-sm'
                        ]"
                    >
                        <div class="flex items-start gap-4">
                            <div :class="[
                                'p-3 rounded-xl transition-colors shrink-0',
                                selectedDeviceId === device.id 
                                    ? 'bg-primary-50 text-primary-600' 
                                    : 'bg-slate-100 text-slate-400 group-hover:text-primary-400'
                            ]">
                                <UIcon :name="getIcon(device.category)" class="w-5 h-5" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-1">
                                    <h3 class="font-bold text-slate-800 text-sm truncate">{{ device.name }}</h3>
                                    <UBadge 
                                        v-if="device.isAudited"
                                        variant="soft" 
                                        color="success" 
                                        size="xs" 
                                        class="shrink-0"
                                    >
                                        ✓ Audited
                                    </UBadge>
                            </div>
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ device.serialNumber }}
                            </p>
                        </div>
                    </div>
                </button>
            </aside>
                <section v-if="selectedDevice" class="flex-1 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col mb-4 overflow-y-auto">
                    <div v-if="store.selectedDeviceLoading" class="flex items-center justify-center">
                        <div class="text-center space-y-4">
                            <UIcon name="i-lucide-loader-2" class="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
                            <p class="text-sm text-slate-400 font-medium">Loading device details...</p>
                        </div>
                    </div>

                    <div v-else class="flex-1 p-2 md:p-4">
                        <div class="space-y-4">
                            <div class="space-y-2">
                                <h2 class="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{{ selectedDevice.name }}</h2>
                                <div class="flex flex-wrap items-center gap-2 sm:gap-3">
                                    <span class="text-xs font-bold text-slate-400 uppercase">{{ selectedDevice.category }}</span>
                                    <span class="w-1 h-1 rounded-full bg-slate-300" />
                                    <UBadge variant="soft" color="neutral" size="xs">{{ selectedDevice.brand }}</UBadge>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 xl:grid-cols-2 gap-10">
                                <div
                                    class="aspect-video rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 group">
                                    <img :src="selectedDevice.photo"
                                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                </div>

                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <MyInventoryMetadataCard label="SERIAL NUMBER" :value="selectedDevice.serialNumber" />
                                    <MyInventoryMetadataCard label="INTERNAL ASSET ID" :value="selectedDevice.assetId" />
                                    <MyInventoryMetadataCard label="MODEL" :value="selectedDevice.model" />
                                    <MyInventoryMetadataCard label="PURCHASE DATE" :value="selectedDevice.purchaseDate" />
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
                    </div>
                </section>

                <section v-else class="flex-1 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-center">
                    <div class="text-center space-y-3">
                        <UIcon name="i-lucide-inbox" class="w-10 h-10 text-slate-300 mx-auto" />
                        <p class="text-slate-400 font-medium">Select a device to begin audit</p>
                    </div>
                </section>
            </main>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import type { SelectMenuItem } from '@nuxt/ui'
import { useAuditStore, type Device } from '~/stores/audit'
import { formatDateFromISO } from '~/utils/function'

const auditSchema = z.object({
    condition: z.string().min(1, 'Condition is required'),
    status: z.string().min(1, 'Status is required'),
    comment: z.string().min(1, 'Comment is required').min(3, 'Comment must be at least 3 characters'),
})

type AuditSchema = z.output<typeof auditSchema>

const store = useAuditStore()
const toast = useToast()
const router = useRouter()

const selectedDeviceId = ref<number | null>(null)
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

await useAsyncData('audit-status-fetch', async () => {
    if (!store.auditStatus) {
        await store.fetchAuditStatus()
    }
    await store.loadDeviceList()
    return null
})

const allDevices = computed(() => {
    return store.allDevices
})

const unauditedDevices = computed(() => {
    return store.unauditedDevices
})


const selectedDevice = ref<any>(null)

const getIcon = (category: string) => {
    const cat = category?.toLowerCase() || ''
    if (cat.includes('laptop')) return 'i-lucide-laptop'
    if (cat.includes('monitor')) return 'i-lucide-monitor'
    if (cat.includes('mobile')) return 'i-lucide-smartphone'
    if (cat.includes('tablet')) return 'i-lucide-tablet'
    return 'i-lucide-monitor-smartphone'
}

async function selectDevice(deviceId: number) {
    selectedDeviceId.value = deviceId
    resetForm()
    
    const device = await store.fetchDeviceDetails(deviceId)
    if (device) {
        selectedDevice.value = device
    }
}

async function onSubmit(event: FormSubmitEvent<AuditSchema>) {
    if (!selectedDevice.value) return

    isSubmitting.value = true
    
    const success = await store.submitAudit(selectedDevice.value.id, {
        condition: event.data.condition,
        status: event.data.status,
        comment: event.data.comment,
    })
    
    if (success) {
        await store.fetchAuditStatus()
        await store.loadDeviceList()  // Refresh device list with updated audit status

        if (store.allItemsAudited) {
            toast.add({
                title: 'Congratulations!',
                description: 'All devices have been audited!',
                color: 'success',
            })
            setTimeout(() => {
                navigateTo('/dashboard')
            }, 1500)
        } else {
            const nextDevice = unauditedDevices.value.find((d: any) => d.id !== selectedDevice.value?.id)
            if (nextDevice) {
                selectDevice(nextDevice.id)
            } else {
                resetForm()
            }
        }
    }
    
    isSubmitting.value = false
}

function resetForm() {
    formState.value = {
        condition: '',
        status: '',
        comment: '',
    }
}

watch(
    () => allDevices.value.length,
    (newLength) => {
        if (newLength > 0 && !selectedDeviceId.value) {
            const firstUnaudited = unauditedDevices.value[0]
            const firstDevice = allDevices.value[0]
            if (firstUnaudited) {
                selectDevice(firstUnaudited.id)
            } else if (firstDevice) {
                selectDevice(firstDevice.id)
            }
        }
    },
    { immediate: true }
)
</script>

<style scoped>
.sidebar-height {
    max-height: calc(100vh - 180px);
}

.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #E2E8F0;
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #CBD5E1;
}
</style>
