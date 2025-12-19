<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
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
  // Optional: clear auth data
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
  { label: 'Settings', icon: 'i-lucide-settings', to: '/settings' }
]

const isHovered = ref(false)
// const isMobileOpen = ref(false)

// --- FIX 1: Prevent Body Scroll when Mobile Menu is Open ---
watch(isMobileOpen, (val) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = val ? 'hidden' : ''
  }
})

// Cleanup scroll lock if component unmounts
onUnmounted(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})

const closeMobile = () => {
  isMobileOpen.value = false
}

// --- FIX 2: Better Hover Logic ---
// Only allow hover effects if window width is greater than 1024px
const handleMouseEnter = () => {
  if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
    isHovered.value = true
  }
}

const handleMouseLeave = () => {
  if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
    isHovered.value = false
  }
}

// Close logic
watch(() => route.path, closeMobile)
const handleNavClick = () => {
  if (isMobileOpen.value) closeMobile()
}
</script>

<template>
  <!-- Backdrop for mobile -->
  <!-- Added touch-none to prevent scrolling through the backdrop -->
  <div v-if="isMobileOpen"
    class="fixed inset-0 bg-black/40 z-[90] lg:hidden backdrop-blur-sm touch-none transition-opacity duration-300"
    @click="closeMobile" />

  <aside class="fixed lg:relative z-[100] flex flex-col 
           h-dvh lg:h-full 
           bg-white dark:bg-gray-900
           border-r border-gray-200 dark:border-gray-800
           transition-all duration-300 ease-in-out overflow-hidden shadow-xl lg:shadow-none" :class="[
            // Mobile: 64px (Icon only) OR Full Width (Open)
            isMobileOpen ? 'w-full' : 'w-[64px]',

            // Desktop: 72px (Collapsed) OR 260px (Hovered)
            // Note: We use !important on lg widths to strictly override mobile logic on desktop
            isHovered ? 'lg:w-[260px]' : 'lg:w-[72px]'
          ]" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <!-- Logo / Menu Header -->
    <div class="flex items-center gap-3 py-5 transition-all duration-300 shrink-0" :class="[
      isMobileOpen ? 'justify-start px-6' : 'justify-center px-3',
      'lg:justify-start lg:px-6'
    ]">
      <button class="w-10 h-10 flex items-center justify-center shrink-0
               rounded-xl bg-primary-600 text-white shadow-md active:scale-95 transition-transform"
        @click.stop="isMobileOpen = !isMobileOpen" aria-label="Toggle Menu">
        <UIcon :name="isMobileOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="w-6 h-6 transition-transform duration-200"
          :class="{ 'rotate-90': isMobileOpen }" />
      </button>

      <!-- Title -->
      <span class="text-xl font-bold tracking-tight whitespace-nowrap transition-opacity duration-200" :class="{
        'opacity-100': isHovered || isMobileOpen,
        'opacity-0 lg:opacity-0': !isHovered && !isMobileOpen,
        'hidden': !isHovered && !isMobileOpen
      }">
        Excellence
      </span>
    </div>

    <!-- Navigation -->
    <!-- Navigation -->
    <nav class="flex-1 px-2 lg:px-4 py-3 overflow-y-auto overflow-x-hidden scrollbar-thin"
      @click.capture="handleNavClick">
      <UNavigationMenu orientation="vertical" :items="links" :collapsed="!isMobileOpen && !isHovered" :ui="{
        link: [
          'flex items-center gap-2 px-2.5 py-3 rounded-xl transition-all duration-200 font-medium',
          // Only center the content (icon) when the menu is collapsed (Mobile Closed or Desktop Unhovered)
          (!isMobileOpen && !isHovered) ? 'justify-center' : ''
        ].join(' '),

        active: {
          true: {
            link: 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 shadow-sm',
          },
          false: {
            link: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50'
          }
        }
      }" />
    </nav>

    <!-- Logout -->
    <!-- Logout -->
    <div class="px-2 lg:px-4 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0 mb-safe">
      <button @click="handleLogout" class="w-full flex items-center gap-2 px-2.5 py-3 rounded-xl
           transition-all duration-200 font-medium cursor-pointer
           text-gray-600 hover:text-gray-900 hover:bg-gray-50
           dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50
           justify-center lg:justify-start" :class="(!isMobileOpen && !isHovered) ? 'justify-center' : ''">
        <UIcon name="i-lucide-log-out" class="w-5 h-5 shrink-0" />

        <span class="whitespace-nowrap transition-opacity duration-200" :class="{
          'opacity-100': isHovered || isMobileOpen,
          'opacity-0 lg:opacity-0': !isHovered && !isMobileOpen,
          'hidden': !isHovered && !isMobileOpen
        }">
          Logout
        </span>
      </button>
    </div>

  </aside>
</template>

<style scoped>
/* Ensure safe area for iPhones with notches */
.mb-safe {
  margin-bottom: env(safe-area-inset-bottom);
}
</style>