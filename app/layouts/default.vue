<script setup lang="ts">
const route = useRoute()
const { isLoading: isPageLoading } = useGlobalLoader()

const isAuthRoute = computed(() => {
  return [
    '/login',
    '/forgot-password',
    '/reset-password'
  ].includes(route.path)
})

const isAuditRoute = computed(() => {
  return route.path === '/audit'
})

const showSidebar = computed(() => {
  return !isAuthRoute.value && !isAuditRoute.value
})
</script>

<template>
  <div class="flex h-screen bg-gray-50 ">
    <!-- Global Page Loading Overlay -->
    <Transition name="fade">
      <div v-if="isPageLoading"
        class="fixed inset-0 bg-white/50  z-50 flex items-center justify-center backdrop-blur-sm">
        <div class="flex flex-col items-center gap-3">
          <UIcon name="i-lucide-loader-2" class="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
      </div>
    </Transition>

    <AppSidebar v-if="showSidebar" />
    <div class="flex-1 flex flex-col overflow-hidden transition-all duration-300">

      <AppHeader v-if="showSidebar" />
      <main class="flex-1 overflow-y-auto p-4 md:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
