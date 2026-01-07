<script setup lang="ts">
import { ref, watch, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const route = useRoute()
const router = useRouter()

const props = defineProps<{
  mobileOpen: boolean
}>()

const emit = defineEmits(['update:mobileOpen'])

const isMobileOpen = computed({
  get: () => props.mobileOpen,
  set: (v) => emit('update:mobileOpen', v)
})

const handleLogout = () => {
  localStorage.removeItem('token')
  sessionStorage.clear()
  closeMobile()
  router.push('/login')
}

const links = [
  { label: 'Profile', icon: 'i-lucide-user', to: '/profile' },
  { label: 'Dashboard', icon: 'i-lucide-house', to: '/dashboard' },
  { label: 'Attendance', icon: 'i-lucide-calendar', to: '/attendance' },
  { label: 'My Inventory', icon: 'i-lucide-monitor', to: '/inventory' },
  { label: 'Leaves', icon: 'i-lucide-file-text', to: '/leaves' },
  { label: 'Salary', icon: 'i-lucide-dollar-sign', to: '/salary' },
  { label: 'Settings', icon: 'i-lucide-settings', to: '/settings' },
  { label: 'Inventory', icon: 'i-lucide-wrench', to: '/adminInventory' },
  { label: 'Holidays', icon: 'i-lucide-sun', to: '/holidays' },
]

const isHovered = ref(false)

watch(isMobileOpen, (val) => {
  if (process.client) {
    document.body.style.overflow = val ? 'hidden' : ''
  }
})

onUnmounted(() => {
  if (process.client) document.body.style.overflow = ''
})

const closeMobile = () => {
  isMobileOpen.value = false
}

const handleMouseEnter = () => {
  if (process.client && window.innerWidth >= 1024) isHovered.value = true
}

const handleMouseLeave = () => {
  if (process.client && window.innerWidth >= 1024) isHovered.value = false
}

watch(() => route.path, closeMobile)

const handleNavClick = () => {
  if (isMobileOpen.value) closeMobile()
}
const isExpanded = computed(() => isMobileOpen.value || isHovered.value)
</script>

<template>
  <Transition name="fade">
    <div v-if="isMobileOpen" class="fixed inset-0 bg-black/40 z-90 lg:hidden backdrop-blur-sm touch-none"
      @click="closeMobile" />
  </Transition>

  <aside
    class="fixed lg:relative z-100 flex flex-col h-dvh lg:h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-[width] duration-300 ease-in-out overflow-hidden shadow-xl lg:shadow-none"
    :class="[
      isMobileOpen ? 'w-full' : isHovered ? 'w-56' : 'w-16 lg:w-16'
    ]" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <div class="flex items-center gap-3 py-5 px-4 shrink-0 overflow-hidden">
      <UButton variant="solid" size="lg" class="cursor-pointer"
        @click.stop="isMobileOpen = !isMobileOpen">
        <UIcon :name="isMobileOpen ? 'i-lucide-x' : 'i-lucide-menu'" size="sm"
          :class="{ 'rotate-90': isMobileOpen }" />
      </UButton>

      <span class="text-xl font-bold tracking-tight whitespace-nowrap transition-all duration-300" :class="[
        isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
      ]">
        Excellence
      </span>
    </div>

    <nav class="flex-1 px-3 py-3 overflow-y-auto overflow-x-hidden scrollbar-thin" @click.capture="handleNavClick">
      <UNavigationMenu orientation="vertical" :items="links" :collapsed="!isExpanded" :ui="{
        link: 'relative flex items-center gap-4 px-3 py-3 rounded-xl transition-colors font-medium',
        active: 'bg-primary-50 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400',
        inactive: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50',
        label: 'transition-opacity duration-300'
      }" />
    </nav>

    <div class="px-3 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0 mb-safe">
      <button @click="handleLogout"
        class="w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 font-medium cursor-pointer text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50">
        <UIcon name="i-lucide-log-out" class="w-6 h-6 shrink-0" />

        <span class="whitespace-nowrap transition-all duration-300" :class="[
          isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
        ]">
          Logout
        </span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.mb-safe {
  margin-bottom: env(safe-area-inset-bottom);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
</style>