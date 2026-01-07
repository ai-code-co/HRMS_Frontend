<template>
    <div class="flex flex-col lg:flex-row gap-6">
        <SettingsSideBar :role="userRole" class="w-full" />
        <section class="flex-1 flex">
            <div
                class="w-full bg-white border border-slate-100 shadow-sm rounded-2xl p-4  overflow-hidden min-h-175 flex flex-col">
                <SettingsHeader />
                <div class="p-2 md:p-6 flex-1">
                    <Transition name="fade" mode="out-in">
                        <component :is="activeTabComponent" />
                    </Transition>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '~/stores/settings'
// import Profile from '~/components/settings/Profile.vue'
import Permissions from '~/components/Settings/Permissions.vue'
// import Appearance from '~/components/settings/Appearance.vue'
// import Security from '~/components/settings/Security.vue'
// import Notifications from '~/components/settings/Notifications.vue'

const store = useSettingsStore()
const userRole = ref<'admin' | 'user'>('admin')

const activeTabComponent = computed(() => {
    const map: any = {
        // profile: Profile,
        permissions: Permissions,
        // appearance: Appearance,
        // security: Security,
        // notifications: Notifications
    }
    return map[store.activeMenu]
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateX(10px);
}
</style>