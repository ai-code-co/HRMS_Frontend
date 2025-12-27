<template>
  <div class="py-20 h-full flex items-center justify-center relative overflow-hidden text-slate-900 ">
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
          <div :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }" :leave="{ opacity: 0, y: -10 }"
            :transition="{ duration: 0.2 }">
            <h1 class="text-2xl font-bold mb-2">
              Welcome Back
            </h1>
            <p class="text-sm text-slate-500">
              Enter your credentials to access your account
            </p>
          </div>
        </div>

        <!-- Form -->
        <div as="form" class="space-y-4" :leave="{ opacity: 0, x: -20 }" :transition="{ duration: 0.3 }"
          @submit.prevent>

          <UInput class="w-full" size="xl" type="email" placeholder="name@example.com" :icon="Mail"
            v-model="form.email" />

          <div class="space-y-1">
            <UInput class="w-full" size="xl" type="password" placeholder="••••••••" :icon="Lock"
              v-model="form.password" />
            <div class="flex justify-end pt-1">
              <a href="/forgot-password" class="text-xs text-slate-500 hover:text-indigo-600 transition-colors">
                Forgot password?
              </a>
            </div>
          </div>

          <UButton class="mt-2 w-full flex justify-center" size="xl" color="secondary" variant="solid"
            trailing-icon="i-lucide-arrow-right" @click="handleLogin">Sign Up
          </UButton>
        </div>

        <div class="mt-8 pt-6 border-t border-slate-200/60" @click="handleLogin">

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
import { ref } from 'vue'
import { Mail, Lock } from 'lucide-vue-next'
import AnimatedBackground from '~/components/AnimatedBackground.vue'

const router = useRouter()
const { setAuth, initAuth } = useAuth()
const toast = useToast()
const isLoading = ref(false)
const form = ref({
  email: '',
  password: ''
})

async function handleLogin() {
  // if (!validate(form)) return
  isLoading.value = true
  try {
    const res = await useApi('/auth/login/', {
      method: 'POST',
      body: {
        "username": form.value.email,
        "password": form.value.password
      }
    })
    await setAuth(res.access, res.user)
    await initAuth();
    toast.add({
      title: 'Logged in successfully!',
    })
    router.push('/')
  } catch (error: any) {
    toast.add({
      title: error?.data?.error || 'Login failed',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}
</script>
