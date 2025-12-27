<template>
  <UHeader :ui="{
    container: 'max-w-none px-4',
    toggle: 'hidden md:flex'
  }">
    <template #left>
      <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
        Home
      </h1>
    </template>
    <template #right>
      <div class="flex items-center gap-3">
        <UButton icon="i-lucide-bell" color="neutral" variant="ghost" aria-label="Notifications" />

        <UDropdownMenu :items="items" :ui="{
          content: 'w-64',
          item: { disabled: 'cursor-text opacity-100' }
        }">
          <UAvatar :src="user.photo" :alt="user.first_name + ' ' + user.last_name" size="sm"
            class="cursor-pointer hover:ring-2 hover:ring-primary-500/50 transition-all" />

          <template #account="{ item }">
            <div class="flex items-center gap-3 py-2">
              <UAvatar :src="user.photo" size="lg" :alt="user.first_name + ' ' + user.last_name" />
              <div class="flex flex-col">
                <p class="text-sm font-semibold text-gray-900 dark:text-white">
                  {{ user.first_name }} {{ user.last_name }}
                </p>
                <UBadge :label="user.department || 'N/A'" variant="subtle" size="sm" color="neutral"
                  class="mt-1 w-fit text-[10px] px-1.5 py-0.5" />
              </div>
            </div>
          </template>
        </UDropdownMenu>
      </div>
    </template>
  </UHeader>
</template>

<script setup lang="ts">
const { user } = useAuth()
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
      const auth = useAuth()
      await auth.logout()
      navigateTo('/login')
    }
  }]
]
</script>
