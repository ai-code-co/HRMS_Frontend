<template>
    <div
        class="px-8 py-6 border-b border-gray-100 bg-gray-50/30  flex items-center justify-between">
        <div>
            <h3 class="text-lg font-black flex items-center gap-2 capitalize text-slate-800 ">
                {{ headerTitle }}
            </h3>
        </div>

        <div class="flex items-center gap-3">
            <template v-if="store.activeMenu === 'uploadPolicy'">
                <UButton
                    icon="i-lucide-plus"
                    size="md"
                    class="rounded-lg cursor-pointer"
                    title="Add policy document"
                    @click="store.uploadPolicyModalOpen = true"
                />
            </template>
            <template v-else>
                <UButton
                    label="Save Changes"
                    icon="i-heroicons-check-circle"
                    color="primary"
                    :loading="store.isSaving"
                    :disabled="!store.isDirty"
                    @click="store.saveSettings"
                    class="font-bold rounded-xl px-6 py-2.5 transition-all"
                />
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '~/stores/settings'
const store = useSettingsStore()

const headerTitle = computed(() => {
    if (store.activeMenu === 'uploadPolicy') return 'Policy'
    return store.activeMenu.replace('-', ' ')
})
</script>
