<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { getAccessibleNavItems } from '~/utils/roleConfig'

const router = useRouter()
const { user } = useAuth()

const isHovered = ref(false)

const handleMouseEnter = () => {
  isHovered.value = true
}

const handleMouseLeave = () => {
  isHovered.value = false
}

const handleLogout = async () => {
  const auth = useAuth()
  await auth.logout()
  router.push('/login')
}

// Get role-filtered navigation items
const links = computed(() => {
  return getAccessibleNavItems(user.value?.role_detail || null)
})
</script>

<template>
  <!-- Desktop sidebar only -->
  <aside
    class="hidden lg:flex relative flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-[width] duration-300 ease-in-out overflow-hidden"
    :class="[isHovered ? 'w-56' : 'w-16']"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="flex items-center gap-4 py-5 px-3 shrink-0 overflow-hidden">
      <div class="w-6 h-6 flex items-center justify-center shrink-0 ml-3">
        <UIcon name="i-lucide-layout-grid" class="w-6 h-6 text-primary-600" />
      </div>

      <span
        class="text-xl font-bold tracking-tight whitespace-nowrap transition-all duration-300"
        :class="[isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none']"
      >
        Excellence
      </span>
    </div>

    <nav class="flex-1 px-3 py-3 overflow-y-auto overflow-x-hidden scrollbar-thin">
      <UNavigationMenu
        orientation="vertical"
        :items="links"
        :collapsed="!isHovered"
        :ui="{
          link: 'relative flex items-center gap-4 px-3 py-3 rounded-xl transition-colors font-medium',
          linkLeadingIcon: 'w-6 h-6 shrink-0',
          linkLabel: 'transition-opacity duration-300'
        }"
      />
    </nav>

    <div class="px-3 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
      <button
        @click="handleLogout"
        class="w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 font-medium cursor-pointer text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50"
      >
        <UIcon name="i-lucide-log-out" class="w-6 h-6 shrink-0" />

        <span
          class="whitespace-nowrap transition-all duration-300"
          :class="[isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none']"
        >
          Logout
        </span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
</style>
