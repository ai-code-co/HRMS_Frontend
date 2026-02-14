<template>
    <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div class="flex flex-col items-center gap-4 text-slate-400">
            <UIcon name="i-lucide-loader-2" class="size-8 animate-spin" />
            <p class="text-sm">Redirecting to application...</p>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: false,
})

const route = useRoute()

const token = computed(() => {
    const queryToken = route.query.token
    return typeof queryToken === 'string' ? queryToken.trim() : ''
})

if (token.value) {
    await navigateTo(`/apply/${encodeURIComponent(token.value)}`, { replace: true })
}
</script>
