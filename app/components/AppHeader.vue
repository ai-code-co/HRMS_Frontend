<script setup lang="ts">
const emit = defineEmits(['menu'])
</script>

<template>
  <header
    class="flex items-center justify-between h-16 px-4 md:px-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
  >
    <div class="flex items-center gap-3">
      <h1 class="text-lg font-semibold">Attendance Overview</h1>
    </div>

    <div class="flex items-center gap-4">
      <UButton icon="i-lucide-bell" color="gray" variant="ghost" />
      <UAvatar src="https://i.pravatar.cc/150?u=nebula" size="sm" />
    </div>
  </header>
</template>
