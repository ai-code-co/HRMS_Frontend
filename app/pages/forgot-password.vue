<template>
    <div class="h-full flex items-center justify-center px-4">
        <client-only>
            <AnimatedBackground />
        </client-only>
        <div class="max-w-md mx-auto px-6 py-12">
            <div class="bg-white/80  shadow-lg border border-gray-200 rounded-2xl p-8 w-100">
                <h1 class="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Mail class="h-6 w-6 text-blue-600" />
                    Forgot Password
                </h1>
                <p class="text-sm text-gray-600 mb-8 leading-relaxed">
                    Enter your registered email address. We'll send you a secure link to reset your password.
                </p>

                <form @submit.prevent="handleSubmit" class="space-y-5">
                    <div>
                        <UInput v-model="email" class="w-full" size="xl" label="Email Address"
                            placeholder="you@example.com" autocomplete="email" :icon="Mail" :aria-invalid="!!errors"
                            required>
                        </UInput>
                        <p v-if="errors.email" class="text-xs text-red-600 mt-1 ml-1">{{ errors.email }}</p>
                    </div>

                    <UButton class="mt-2 w-full flex justify-center" size="xl" color="secondary" variant="solid"
                        :loading="loading" @click="handleSubmit">{{
                            loading ? 'Sending...' : 'Send Reset Link'

                        }}
                    </UButton>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { z } from 'zod'
import { Mail, LoaderCircle } from 'lucide-vue-next'
import AnimatedBackground from '~/components/AnimatedBackground.vue'
const toast = useToast()
// import { EnvelopeIcon, AtSymbolIcon, ArrowPathIcon } from '@heroicons/vue/24/solid'

const email = ref('')
const loading = ref(false)

const schema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address' }),
})
const { validate, errors } = useValidation(schema)

const handleSubmit = async () => {
    if (!validate({ email: email.value })) return
    loading.value = true
    try {

        await useApi('/auth/forgot-password', {
            method: 'POST',
            body: { email: email.value },
        })

        toast.add({
            title: '✅ Password reset link sent successfully.',
        })
        email.value = ''
    } catch (err: any) {
        toast.add({
            title: err?.data?.error || '❌ Failed to send reset email.',
            color: 'error'
        })
    } finally {
        loading.value = false
    }
}
</script>