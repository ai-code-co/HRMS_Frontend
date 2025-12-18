<template>
    <div class="max-w-md mx-auto px-6 py-12">
        <client-only>
            <AnimatedBackground />
        </client-only>
        <div class="bg-white shadow-md border border-gray-200 rounded-2xl p-8">
            <h1 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <KeyIcon class="h-6 w-6 text-blue-600" />
                Reset Password
            </h1>

            <p class="text-sm text-gray-600 mb-6">
                Enter your new password to reset your account access.
            </p>

            <form @submit.prevent="handleSubmit" class="space-y-6">
                <div>
                    <UInput v-model="password" type="password" class="w-full" size="xl"
                        placeholder="Enter a new password" autocomplete="new-password" required :icon="LockKeyhole">
                    </UInput>
                    <div v-if="errors.password" class="text-sm text-red-500">{{ errors.password }}</div>
                </div>

                <UButton type="submit" class="mt-2 w-full flex justify-center" size="xl" color="secondary"
                    variant="solid" :disabled="loading" :loading="loading">
                    {{
                        loading ? 'Resetting...' : 'Reset Password'
                    }}
                </UButton>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LockKeyhole, KeyIcon } from 'lucide-vue-next'
import { z } from 'zod'

const toast = useToast()
const password = ref('')
const loading = ref(false)
const route = useRoute()
const router = useRouter()

const token = route.query.token as string | undefined

onMounted(() => {
    if (!token) {
        toast.add({ title: '❌ Invalid or expired reset link.', color: 'error' })
        router.push('/forgot-password')
    }
})

const passwordSchema = z.object({
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .max(64, 'Password too long'),
})
const { validate, errors } = useValidation(passwordSchema)

const handleSubmit = async () => {
    if (!validate({ password: password.value })) return
    loading.value = true
    try {
        await useApi('/auth/set-password/', {
            method: 'POST',
            body: {
                token,
                password: password.value,
            },
        })
        toast.add({ title: '✅ Your password has been reset successfully.' })
        router.push('/login')
    } catch (err: any) {
        toast.add({ title: err?.data?.error || '❌ Something went wrong.', color: 'error' })
    } finally {
        loading.value = false
    }
}
</script>