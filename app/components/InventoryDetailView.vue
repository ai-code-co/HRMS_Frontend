<script setup lang="ts">
// Define props
defineProps<{
    item: {
        id: string
        name: string
        category: string
        model: string
        serialNumber: string
        internalId: string
        assignDate: string
        status: string
        image: string
        auditedBy: string
        lastAuditDate: string
        history: any[]
    }
}>()

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Good': return 'green'
        case 'Damaged': return 'red'
        case 'Repair': return 'orange'
        default: return 'gray'
    }
}
</script>

<template>
    <div class="flex flex-col h-full bg-white dark:bg-gray-900">

        <!-- Top Action Bar -->
        <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ item.name }}</h2>
                <div class="flex items-center gap-3 mt-1">
                    <p class="text-sm text-gray-500">{{ item.category }}</p>
                    <span class="text-gray-300">•</span>
                    <p class="text-sm text-gray-500">ID: {{ item.id }}</p>
                </div>
            </div>
            <div class="flex flex-col items-end gap-2">
                <UBadge :color="getStatusColor(item.status)" size="md" variant="soft">{{ item.status }}</UBadge>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar">
            <div class="p-6 space-y-8">

                <!-- 1. Device Image & Specs -->
                <div class="flex flex-col md:flex-row gap-6">
                    <!-- Image -->
                    <div class="md:w-1/3">
                        <div
                            class="aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm relative group">
                            <img :src="item.image" :alt="item.name"
                                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div
                                class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                <UButton icon="i-lucide-maximize-2" variant="ghost" color="white" size="xs">View Full
                                </UButton>
                            </div>
                        </div>
                    </div>

                    <!-- Specs Grid -->
                    <div class="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div
                            class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                            <span class="text-xs text-gray-400 uppercase font-semibold">Serial Number</span>
                            <p class="font-mono text-sm mt-1 select-all">{{ item.serialNumber }}</p>
                        </div>
                        <div
                            class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                            <span class="text-xs text-gray-400 uppercase font-semibold">Internal Asset ID</span>
                            <p class="font-mono text-sm mt-1 select-all">{{ item.internalId }}</p>
                        </div>
                        <div
                            class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                            <span class="text-xs text-gray-400 uppercase font-semibold">Model</span>
                            <p class="text-sm mt-1">{{ item.model }}</p>
                        </div>
                        <div
                            class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                            <span class="text-xs text-gray-400 uppercase font-semibold">Audit Status</span>
                            <div class="mt-1">
                                <p class="text-sm">Verified on {{ item.lastAuditDate }}</p>
                                <p class="text-xs text-gray-400">by {{ item.auditedBy }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- <UDivider /> -->

                <!-- 2. Danger Zone (Unassign) -->
                <div
                    class="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
                    <div>
                        <h4 class="text-sm font-semibold text-red-700 dark:text-red-400">Request Return / Unassign</h4>
                        <p class="text-xs text-red-600/80 dark:text-red-400/70">Start the process to return this device
                            to IT.</p>
                    </div>
                    <UButton label="Unassign Device" color="red" variant="outline" size="sm"
                        icon="i-lucide-alert-triangle" />
                </div>

                <!-- 3. Timeline / History -->
                <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Device History</h3>
                    <div class="relative pl-4 border-l-2 border-gray-200 dark:border-gray-800 space-y-6">

                        <div v-for="event in item.history" :key="event.id" class="relative pl-6">
                            <!-- Dot -->
                            <div
                                class="absolute -left-[9px] top-1 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 w-4 h-4 rounded-full">
                            </div>

                            <!-- Content -->
                            <div class="flex items-start justify-between">
                                <div class="flex items-center gap-2">
                                    <UAvatar :src="event.avatar" size="xs" />
                                    <span class="text-sm font-medium text-gray-900 dark:text-white">{{ event.user
                                        }}</span>
                                </div>
                                <span class="text-xs text-gray-400">{{ event.date }}</span>
                            </div>

                            <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">{{ event.action }}
                            </p>
                            <p v-if="event.note"
                                class="text-sm text-gray-500 dark:text-gray-400 mt-1 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                "{{ event.note }}"
                            </p>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 20px;
}
</style>