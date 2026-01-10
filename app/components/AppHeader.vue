<template>
  <UHeader
    toggle-side="left"
    :ui="{
      container: 'max-w-none px-4'
    }"
  >
    <template #left>
      <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
        <!-- Home -->
      </h1>
    </template>

    <template #right>
      <div class="flex items-center gap-3">
        <UButton icon="i-lucide-bell" color="neutral" variant="ghost" aria-label="Notifications" />

        <UDropdownMenu :items="profileItems" :ui="{ content: 'w-64' }">
          <UAvatar :src="userInfo.photoUrl" :alt="userInfo.fullName" size="sm"
            class="cursor-pointer hover:ring-2 hover:ring-primary-500/50 transition-all" />

          <template #account>
            <div class="flex items-center gap-3 py-2">
              <UAvatar :src="userInfo.photoUrl" size="lg" :alt="userInfo.fullName" />
              <div class="flex flex-col">
                <p class="text-sm font-semibold text-gray-900 dark:text-white">
                  {{ userInfo.firstName }} {{ userInfo.lastName }}
                </p>
                <UBadge :label="userInfo.role" variant="subtle" size="sm" color="neutral"
                  class="mt-1 w-fit text-[10px] px-1.5 py-0.5" />
              </div>
            </div>
          </template>
        </UDropdownMenu>
      </div>
    </template>
    
    <template #body>
      <div class="flex flex-col min-h-[calc(100dvh-64px)]">
        <nav class="flex-1 py-4">
          <UNavigationMenu
            orientation="vertical"
            :items="navLinks"
            :ui="{
              link: 'relative flex items-center gap-4 px-4 py-4 rounded-xl transition-colors font-medium text-lg',
              linkLabel: 'transition-opacity duration-300'
            }"
          />
        </nav>

        <div class="border-t border-gray-100 dark:border-gray-800 py-4 mt-auto mb-safe">
          <button
            @click="handleLogout"
            class="w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 font-medium cursor-pointer text-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50"
          >
            <UIcon name="i-lucide-log-out" class="w-6 h-6 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </template>
  </UHeader>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { getAccessibleNavItems } from '~/utils/roleConfig'

const router = useRouter()
const { user } = useAuth()

// Safe user info with defaults for template
const userInfo = computed(() => ({
  photoUrl: user.value?.photo_url ?? '',
  firstName: user.value?.first_name ?? '',
  lastName: user.value?.last_name ?? '',
  fullName: `${user.value?.first_name ?? ''} ${user.value?.last_name ?? ''}`.trim() || 'User',
  role: user.value?.role_detail?.role ?? 'N/A'
}))

// Navigation items for mobile menu
const navLinks = computed(() => {
  return getAccessibleNavItems(user.value?.role_detail || null)
})

const handleLogout = async () => {
  const auth = useAuth()
  await auth.logout()
  router.push('/login')
}

const profileItems = [
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

<style scoped>
.mb-safe {
  margin-bottom: env(safe-area-inset-bottom);
}
</style>
