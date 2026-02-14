<template>
  <UHeader toggle-side="left" :ui="{
    container: 'max-w-none px-4'
  }">
    <template #left>
      <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
        <!-- Home -->
      </h1>
    </template>

    <template #right>
      <div class="flex items-center gap-3">
        <div v-if="isSuperUser" class="mr-4">
          <UPopover v-model:open="isStaffSearchOpen" :content="{ side: 'bottom', align: 'end', sideOffset: 8 }"
            class="rounded-xl">
            <div>
              <UButton v-if="selectedEmployeeId" color="primary" variant="soft"
                class="flex items-center gap-2 px-3 py-1.5 cursor-pointer rounded-xl">
                <UAvatar :src="activeEmployee?.photo_url ?? undefined" :alt="activeEmployee?.full_name" size="sm" />

                <div class="hidden md:block text-left">
                  <p class="text-[10px] font-black text-slate-600 leading-none">
                    Viewing:
                  </p>
                  <p class="text-xs font-black text-primary-400 mt-1">
                    {{ activeEmployee?.full_name }}
                  </p>
                </div>

                <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 text-primary-400 transition-transform"
                  :class="isStaffSearchOpen && 'rotate-180'" />
              </UButton>

              <UButton v-else icon="i-heroicons-users" variant="subtle" color="primary"
                class="rounded-xl cursor-pointer" />
            </div>

            <template #content>
              <div class="w-96 bg-white overflow-hidden">
                <div
                  class="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Select
                    Employee</span>
                </div>

                <UCommandPalette
                  v-model="selectedCommandItem"
                  :groups="commandPaletteGroups"
                  :fuse="{ resultLimit: 100 }"
                  class="h-72 border-0"
                  selected-icon="i-lucide-check"
                  close
                  close-icon="i-heroicons-x-mark"
                  @update:open="handleCloseClick"
                  :ui="{
                    root: 'divide-y-0',
                    input: '[&>input]:h-10 [&>input]:text-sm border-b border-gray-100 dark:border-gray-800',
                    group: 'p-1.5',
                    label: 'px-2 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide',
                    item: 'px-2 py-2 rounded-lg cursor-pointer transition-colors data-highlighted:bg-gray-200',
                    itemLeadingAvatarSize: 'sm',
                    itemLabelBase: 'font-medium',
                    itemLabelSuffix: 'text-xs text-gray-400 dark:text-gray-500',
                    empty: 'py-8 text-gray-400'
                  }"
                />
              </div>
            </template>
          </UPopover>
        </div>
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
          <UNavigationMenu orientation="vertical" :items="navLinks" :ui="{
            link: 'relative flex items-center gap-4 px-4 py-4 rounded-xl transition-colors font-medium text-lg',
            linkLabel: 'transition-opacity duration-300'
          }" />
        </nav>

        <div class="border-t border-gray-100 dark:border-gray-800 py-4 mt-auto mb-safe">
          <button @click="handleLogout"
            class="w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 font-medium cursor-pointer text-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50">
            <UIcon name="i-lucide-log-out" class="w-6 h-6 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </template>
  </UHeader>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useRoleAccess } from '~/composables/useRoleAccess'
import { useEmployeeContext } from '~/composables/useEmployeeContext'
import { getAccessibleNavItems } from '~/utils/roleConfig'

const router = useRouter()
const { user } = useAuth()
const { isSuperUser } = useRoleAccess()

// Employee context for viewing other employees
const {
  selectedEmployeeId,
  activeEmployee,
  employeeOptions,
  fetchEmployeeLookupList,
  selectEmployee,
  clearSelection
} = useEmployeeContext()

// Local state for dropdown
const isStaffSearchOpen = ref(false)

// Fetch employee list on mount (only for superusers)
onMounted(() => {
  if (isSuperUser.value) {
    fetchEmployeeLookupList()
  }
})

// Command palette groups
const commandPaletteGroups = computed(() => {
  const groups = []

  // Add employees group
  groups.push({
    id: 'employees',
    items: employeeOptions.value.map(emp => ({
      id: emp.id,
      label: emp.label,
      suffix: `${emp.suffix}${emp.designation ? ` • ${emp.designation}` : ''}`,
      avatar: {
        src: emp.avatar || undefined,
        alt: emp.label,
      },
    }))
  })

  return groups
})

// Selected item for v-model binding (enables selected-icon display)
const selectedCommandItem = computed({
  get: () => {
    if (!selectedEmployeeId.value) return undefined
    const emp = employeeOptions.value.find(e => e.id === selectedEmployeeId.value)
    if (!emp) return undefined
    return {
      id: emp.id,
      label: emp.label,
      suffix: `${emp.suffix}${emp.designation ? ` • ${emp.designation}` : ''}`,
      avatar: { src: emp.avatar || undefined, alt: emp.label },
    }
  },
  set: (item: any) => {
    if (item?.id) {
      selectEmployee(item.id)
    }
    isStaffSearchOpen.value = false
  }
})

// Handle close button click in CommandPalette - clears selection
function handleCloseClick(open: boolean) {
  if (!open) {
    clearSelection()
  }
}

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
