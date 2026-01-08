<template>
  <div class="py-20 h-full flex items-center justify-center relative overflow-hidden text-slate-900">
    <client-only>
      <AnimatedBackground />
    </client-only>

    <div class="bg-white/80 border border-white/50 rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
      <div class="relative p-8 md:p-10 w-full sm:min-w-md">
        <div class="text-center mb-8">
          <div class="flex justify-center">
            <img class="flex justify-center w-13 h-13"
              src="https://staginghr.excellencetechnologies.in/exce_favicon.png" />
          </div>
          <div>
            <h1 class="text-2xl font-bold mb-2">Welcome Back</h1>
            <p class="text-sm text-slate-500">Enter your credentials to access your account</p>
          </div>
        </div>

        <UForm :schema="loginSchema" :state="form" class="space-y-4" @submit="handleLogin">
          <UFormField name="username">
            <UInput class="w-full" size="xl" type="text" placeholder="Username" :icon="User" v-model="form.username" />
          </UFormField>

          <UFormField name="password">
            <div class="space-y-1">
              <UInput class="w-full" size="xl" type="password" placeholder="••••••••" :icon="Lock"
                v-model="form.password" />
              <div class="flex justify-end pt-1">
                <a href="/forgot-password" class="text-xs text-slate-500 hover:text-indigo-600 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>
          </UFormField>

          <UButton class="mt-2 w-full flex justify-center" size="xl" color="secondary" variant="solid"
            :loading="isLoading" trailing-icon="i-lucide-arrow-right" type="submit">
            Log In
          </UButton>
        </UForm>

        <div class="mt-8 pt-6 border-t border-slate-200/60">
          <p class="text-center text-sm text-slate-500 mt-6">
            {{ "Don't have an account?" }}
            <button class="ml-1 text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
              {{ 'Sign Up' }}
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { User, Lock } from 'lucide-vue-next'
import { z } from "zod"
import type { FormSubmitEvent } from '#ui/types'

const router = useRouter()
const { setAuth, initAuth } = useAuth()
const toast = useToast()

const isLoading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters")
})

type Schema = z.output<typeof loginSchema>

async function handleLogin(event: FormSubmitEvent<Schema>) {
  isLoading.value = true
  try {
    const { access, refresh } = await useApi('/auth/login/', {
      method: 'POST',
      body: {
        "username": event.data.username,
        "password": event.data.password
      }
    })

    await setAuth(access, refresh)
    await initAuth()

    toast.add({ title: 'Logged in successfully!' })
    router.push('/dashboard')
  } catch (error: any) {
    toast.add({
      title: error?.data?.error || 'Login failed',
      description: error?.data?.message,
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}
</script>