<script setup lang="ts">
const sidebarOpen = ref(false)
const route = useRoute()

// Hide header/sidebar on authentication pages (login, forgot/reset password)
const isAuthRoute = computed(() => {
  return [
    '/login',
    '/forgot-password',
    '/reset-password'
  ].includes(route.path)
})

watch(() => route.path, () => {
  // Always close the sidebar when navigating; also ensure it's closed for auth pages
  sidebarOpen.value = false
})
</script>

<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-950">

    <!-- Desktop Sidebar (hidden on auth pages) -->
    <aside v-if="!isAuthRoute">
      <AppSidebar v-model:mobileOpen="sidebarOpen" />
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden transition-all duration-300" :class="{
      'ml-[64px]': !isAuthRoute && !sidebarOpen,
      'ml-0': isAuthRoute || sidebarOpen,
      'lg:ml-0': true
    }">

      <AppHeader v-if="!isAuthRoute" @menu="sidebarOpen = true" />

      <main class="flex-1 overflow-y-auto p-4 md:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
