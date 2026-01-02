<template>
    <div class="w-full md:w-72 bg-white border border-slate-100 rounded-2xl p-3 space-y-2 shadow-sm h-fit">
        <div class="mb-6 px-2">
            <h1 class="text-2xl font-black text-slate-800 tracking-tight">Settings</h1>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manage Preferences</p>
        </div>
        <button v-for="item in filteredMenu" :key="item.id" @click="store.activeMenu = item.id"
            class="w-full flex items-center gap-3 px-3 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 cursor-pointer"
            :class="{
                'bg-indigo-600 text-white shadow-xl shadow-indigo-100': store.activeMenu === item.id,
                'text-slate-400 hover:bg-slate-50 hover:text-slate-600': store.activeMenu !== item.id
            }">
            <div class="flex items-center gap-3">
                <UIcon :name="item.icon" class="w-5 h-5" />
                {{ item.label }}
            </div>
            <UIcon v-if="store.activeMenu === item.id" name="i-lucide-chevron-right" size="16" class="ml-auto" />
        </button>
    </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '~/stores/settings'
const store = useSettingsStore()
const props = defineProps<{ role: 'admin' | 'user' }>()

const menuItems = [
    // { id: 'profile', label: 'My Profile', icon: 'i-heroicons-user', roles: ['admin', 'user'] },
    // { id: 'notifications', label: 'Notifications', icon: 'i-heroicons-bell', roles: ['admin', 'user'] },
    // { id: 'security', label: 'Security & Auth', icon: 'i-heroicons-shield-check', roles: ['admin', 'user'] },
    // { id: 'appearance', label: 'Appearance', icon: 'i-heroicons-swatch', roles: ['admin', 'user'] },
    { id: 'permissions', label: 'Access Permissions', icon: 'i-heroicons-finger-print', roles: ['admin'] },
]

const filteredMenu = computed(() => menuItems.filter(item => item.roles.includes(props.role)))
</script>