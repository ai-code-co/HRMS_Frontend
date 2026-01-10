<template>
    <div class="max-w-md mx-auto px-6 py-20">
        <client-only>
            <AnimatedBackground />
        </client-only>
        <div class="bg-white/80 shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-white/50 rounded-2xl p-8">
            <h1 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <KeyIcon class="h-6 w-6 text-blue-600" />
                Reset Password
            </h1>

            <p class="text-sm text-gray-600 mb-6">
                Enter your new password to reset your account access.
            </p>

            <form @submit.prevent="handleSubmit" class="space-y-6">
                <div>
                    <UInput v-model="password" :type="showPassword ? 'text' : 'password'" class="w-full" size="xl"
                        placeholder="Enter a new password" autocomplete="new-password" required :icon="LockKeyhole">
                        <template #trailing>
                            <button type="button" @click="showPassword = !showPassword" class="text-slate-500 hover:text-slate-700 transition-colors">
                                <component :is="showPassword ? Eye : EyeOff" class="w-5 h-5" />
                            </button>
                        </template>
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
import { LockKeyhole, KeyIcon, Eye, EyeOff } from 'lucide-vue-next'
import { z } from 'zod'

const toast = useToast()
const password = ref('')
const loading = ref(false)
const showPassword = ref(false)
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
                new_password: password.value,
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