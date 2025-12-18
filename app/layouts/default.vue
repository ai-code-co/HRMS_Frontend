<script setup lang="ts">
const sidebarOpen = ref(false)
const route = useRoute()

watch(() => route.path, () => {
  sidebarOpen.value = false
})
</script>

<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-950">

    <!-- Desktop Sidebar -->
    <aside>
      <AppSidebar />
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <AppHeader @menu="sidebarOpen = true" />

      <main class="flex-1 overflow-y-auto p-4 md:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
