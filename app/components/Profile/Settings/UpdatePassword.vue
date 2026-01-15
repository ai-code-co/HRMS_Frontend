<script setup lang="ts">
import { reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-vue-next'
import type { FormSubmitEvent } from '#ui/types'
import { useEmployeeStore } from '~/stores/employee'

defineProps<{ policy: string }>()

const employeeStore = useEmployeeStore()
const { loading } = storeToRefs(employeeStore)

const show = reactive({
    current: false,
    new: false,
    confirm: false,
})

const state = reactive({
    current_password: '',
    new_password: '',
    confirm_password: '',
})

const schema = z.object({
    current_password: z.string().min(8, 'Minimum 8 characters'),
    new_password: z.string().min(8, 'Minimum 8 characters'),
    confirm_password: z.string().min(8, 'Confirm password is required'),
}).refine(data => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
})

type Schema = z.output<typeof schema>

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
    try {
        await employeeStore.changePassword(
            event.data.current_password,
            event.data.new_password,
            event.data.confirm_password
        )
        Object.assign(state, { current_password: '', new_password: '', confirm_password: '' })
    } catch {
        // Error handling is done in the store
    }
}
</script>

<template>
    <UForm :schema="schema" :state="state" @submit="onSubmit" class="max-w-xl space-y-4">

        <UFormField label="Current Password" name="current_password">
            <UInput placeholder="Enter current password" v-model="state.current_password" :type="show.current ? 'text' : 'password'"
                autocomplete="current-password" class="w-full">
                <template #trailing>
                    <component :is="show.current ? EyeOff : Eye"
                        class="size-5 cursor-pointer text-neutral-400 hover:text-neutral-700 pointer-events-auto transition-colors"
                        @click="show.current = !show.current" />
                </template>
            </UInput>
        </UFormField>

        <UFormField label="New Password" name="new_password">
            <UInput placeholder="Enter new password" v-model="state.new_password" :type="show.new ? 'text' : 'password'" autocomplete="new-password"
                class="w-full">
                <template #trailing>
                    <component :is="show.new ? EyeOff : Eye"
                        class="size-5 cursor-pointer text-neutral-400 hover:text-neutral-700 pointer-events-auto transition-colors"
                        @click="show.new = !show.new" />
                </template>
            </UInput>
        </UFormField>

        <UFormField label="Confirm Password" name="confirm_password">
            <UInput placeholder="Confirm password" v-model="state.confirm_password" :type="show.confirm ? 'text' : 'password'"
                autocomplete="new-password" class="w-full">
                <template #trailing>
                    <component :is="show.confirm ? EyeOff : Eye"
                        class="size-5 cursor-pointer text-neutral-400 hover:text-neutral-700 pointer-events-auto transition-colors"
                        @click="show.confirm = !show.confirm" />
                </template>
            </UInput>
        </UFormField>

        <UButton type="submit" size="lg" :loading="loading" block class="font-bold">
            Update Password
        </UButton>
    </UForm>
</template>