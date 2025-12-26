<script setup lang="ts">
const items = [
  [{
    label: 'user-info',
    slot: 'account',
    disabled: true
  }],
  [{
    label: 'My Profile',
    icon: 'i-lucide-user',
    to: '/profile'
  }],
  [{
    label: 'Logout',
    icon: 'i-lucide-log-out',
    to: '/login',
    onSelect: async () => {
      console.log('Logging out...')
      const auth = useAuth()
      await auth.logout()
      navigateTo('/login')
    }
  }]
]
</script>

<template>
  <UHeader :ui="{
    container: 'max-w-none px-4',
    toggle: 'hidden md:flex'
  }">
    <!-- Left -->
    <template #left>
      <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
        Home
      </h1>
    </template>

    <!-- Right -->
    <template #right>
      <div class="flex items-center gap-3">
        <UButton icon="i-lucide-bell" color="neutral" variant="ghost" aria-label="Notifications" />

        <!-- User Dropdown -->
        <UDropdownMenu :items="items" :ui="{
          content: 'w-64',
          item: { disabled: 'cursor-text opacity-100' }
        }">
          <UAvatar src="https://i.pravatar.cc/150?u=ashdev" alt="Ash Dev" size="sm"
            class="cursor-pointer hover:ring-2 hover:ring-primary-500/50 transition-all" />

          <template #account="{ item }">
            <div class="flex items-center gap-3 py-2">
              <UAvatar src="https://i.pravatar.cc/150?u=ashdev" size="md" />
              <div class="flex flex-col">
                <p class="text-sm font-semibold text-gray-900 dark:text-white">
                  Ash Dev
                </p>
                <UBadge label="Global Admin" variant="subtle" size="sm" color="neutral"
                  class="mt-1 w-fit text-[10px] px-1.5 py-0.5" />
              </div>
            </div>
          </template>
        </UDropdownMenu>
      </div>
    </template>
  </UHeader>
</template>