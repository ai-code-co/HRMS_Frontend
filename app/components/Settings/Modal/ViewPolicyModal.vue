<template>
    <UModal v-model:open="modelOpen" :overlay="true"
        :ui="{ overlay: 'bg-slate-900/40 backdrop-blur-sm', content: 'w-[95vw] sm:w-full sm:max-w-4xl h-[90vh]' }">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <h3 class="text-lg font-semibold text-slate-800">{{ policy?.name || 'View Policy' }}</h3>
                <div class="flex items-center gap-2">
                    <UButton icon="i-heroicons-x-mark" variant="ghost" class="rounded-full cursor-pointer" @click="close" />
                </div>
            </div>
        </template>

        <template #body>
            <div class="w-full h-[calc(90vh-80px)] bg-slate-100 rounded-lg overflow-hidden relative">
                <div v-if="isLoading && embeddableLink" class="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
                    <div class="text-center">
                        <UIcon name="i-lucide-loader-2" class="size-8 text-indigo-500 animate-spin mb-2" />
                        <p class="text-sm text-slate-500">Loading document...</p>
                    </div>
                </div>

                <div v-if="showFallback" class="absolute inset-0 flex items-center justify-center bg-slate-100">
                    <div class="text-center max-w-md px-6">
                        <UIcon name="i-lucide-file-warning" class="size-16 text-slate-300 mb-4" />
                        <h4 class="text-lg font-semibold text-slate-700 mb-2">Cannot preview this document</h4>
                        <p class="text-sm text-slate-500 mb-6">This document cannot be displayed in the preview.</p>
                        <UButton v-if="policy?.link" color="primary" size="lg" class="cursor-pointer" :to="policy.link" target="_blank">
                            Open document in new tab
                        </UButton>
                    </div>
                </div>

                <iframe
                    v-if="embeddableLink && !showFallback"
                    :src="embeddableLink"
                    class="w-full h-full border-0"
                    :class="{ 'opacity-0': isLoading }"
                    @load="onLoad"
                    @error="onError"
                />

                <div v-else-if="!policy?.link" class="flex items-center justify-center h-full text-slate-500">
                    No link available for this policy
                </div>
            </div>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import type { PolicyItem } from '../PolicyCard.vue'

const props = defineProps<{
    open: boolean
    policy?: PolicyItem | null
}>()

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void
    (e: 'close'): void
}>()

const isLoading = ref(true)
const showFallback = ref(false)

const modelOpen = computed({
    get: () => props.open,
    set: (value: boolean) => emit('update:open', value),
})

const isPdfLink = (url: string) => {
    try {
        const path = new URL(url).pathname.toLowerCase()
        return path.endsWith('.pdf') || path.includes('.pdf?')
    } catch {
        return url.toLowerCase().includes('.pdf')
    }
}

const embeddableLink = computed(() => {
    const link = props.policy?.link
    if (!link) return null

    if (link.includes('drive.google.com/file/d/')) {
        return link.replace('/view', '/preview').replace('/edit', '/preview')
    }
    if (link.includes('docs.google.com')) {
        if (link.includes('/edit')) return link.replace('/edit', '/preview')
        if (!link.includes('/preview') && !link.includes('/embed')) {
            return `${link}${link.includes('?') ? '&' : '?'}embedded=true`
        }
    }
    if (link.includes('sharepoint.com') || link.includes('onedrive.live.com')) {
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(link)}`
    }
    if (isPdfLink(link)) {
        return `https://docs.google.com/viewer?url=${encodeURIComponent(link)}&embedded=true`
    }
    return link
})

watch(() => [props.open, props.policy?.id, props.policy?.link], () => {
    if (props.open) {
        isLoading.value = true
        showFallback.value = false
    }
})

function onLoad() {
    isLoading.value = false
}

function onError() {
    isLoading.value = false
    showFallback.value = true
}

function close() {
    modelOpen.value = false
    emit('close')
}
</script>
