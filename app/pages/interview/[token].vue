<template>
    <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div class="flex flex-col items-center gap-4 text-slate-400">
            <UIcon name="i-lucide-loader-2" class="size-8 animate-spin" />
            <p class="text-sm">Redirecting to interview...</p>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: false,
})

const route = useRoute()

const token = route.params.token as string

if (token) {
    await navigateTo(`/interview/link/${token}`, { replace: true })
}
</script>
