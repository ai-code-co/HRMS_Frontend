<script setup lang="ts">
const emit = defineEmits(['menu'])
</script>

<template>
  <UHeader
    :ui="{
      container: 'max-w-none px-4'
    }"
  >
    <!-- Left -->
    <template #left>
      <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
        Home
      </h1>
    </template>

    <!-- Right -->
    <template #right>
      <div class="flex items-center gap-2">
        <UButton
          icon="i-lucide-bell"
          color="gray"
          variant="ghost"
          aria-label="Notifications"
        />
        <UAvatar
          src="https://i.pravatar.cc/150?u=nebula"
          alt="User Avatar"
          size="sm"
        />
      </div>
    </template>
  </UHeader>
</template>
