<script setup lang="ts">
import { ref } from 'vue'
defineProps<{
    policy: string
}>()
const showPasswords = ref({ current: false, new: false, confirm: false })
</script>

<template>
    <div class="space-y-6 max-w-xl">
        <div class="relative">
            <input :type="showPasswords.current ? 'text' : 'password'" placeholder="Current Password"
                class="inputStyles" />
            <button type="button" @click="showPasswords.current = !showPasswords.current"
                class="absolute right-5 top-1/2 -translate-y-1/2">
                {{ showPasswords.current ? 'Hide' : 'Show' }}
            </button>
        </div>
        <div class="relative">
            <input :type="showPasswords.new ? 'text' : 'password'" placeholder="New Password" class="inputStyles" />
            <button type="button" @click="showPasswords.new = !showPasswords.new"
                class="absolute right-5 top-1/2 -translate-y-1/2">
                {{ showPasswords.new ? 'Hide' : 'Show' }}
            </button>
        </div>
        <div class="relative">
            <input :type="showPasswords.confirm ? 'text' : 'password'" placeholder="Confirm New Password"
                class="inputStyles" />
            <button type="button" @click="showPasswords.confirm = !showPasswords.confirm"
                class="absolute right-5 top-1/2 -translate-y-1/2">
                {{ showPasswords.confirm ? 'Hide' : 'Show' }}
            </button>
        </div>

        <div
            class="flex items-center gap-3 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-500">
            {{ props.policy }}
        </div>

        <div class="flex gap-3">
            <button class="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">Update Password</button>
            <button class="flex-1 py-3 bg-slate-50 text-slate-500 rounded-xl">Cancel</button>
        </div>
    </div>
</template>
