<template>
  <div class="min-h-screen flex items-center justify-center bg-dark relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 rounded-full
                  bg-primary/10 blur-3xl animate-pulse" />
      <div class="absolute -bottom-40 -left-40 w-96 h-96 rounded-full
                  bg-accent/10 blur-3xl animate-pulse" style="animation-delay: 1s;" />
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                  w-[600px] h-[600px] rounded-full
                  bg-primary/5 blur-3xl" />
    </div>

    <!-- Login Card -->
    <div class="relative w-full max-w-md mx-4 animate-fade-in">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent
                    flex items-center justify-center shadow-glow mb-4">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-slate-100">Upload Caule</h1>
        <p class="text-sm text-slate-500 mt-1">Faça login para continuar</p>
      </div>

      <!-- Form Card -->
      <div class="glass-card p-8">
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Email -->
          <AppFormField
            label="Email"
            type="email"
            v-model="form.email"
            placeholder="seu@email.com"
            :error="errors.email"
            required
          />

          <!-- Senha -->
          <AppFormField
            label="Senha"
            type="password"
            v-model="form.senha"
            placeholder="••••••"
            :error="errors.senha"
            required
          />

          <!-- Error message from API -->
          <div
            v-if="loginError"
            class="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
          >
            <svg class="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm text-red-400">{{ loginError }}</p>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            class="btn-glow w-full"
            :disabled="userStore.loading"
          >
            <div v-if="userStore.loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span v-else>Entrar</span>
          </button>
        </form>

        <!-- Hint -->
        <div class="mt-6 pt-5 border-t border-glass">
          <p class="text-xs text-slate-500 text-center">
            Acesso de demonstração:
          </p>
         <!-- <div class="mt-2 space-y-1">
            <p class="text-xs text-slate-500 text-center">
              <span class="text-primary-light font-mono">admin@admin.com</span> /
              <span class="text-primary-light font-mono">123456</span>
              <span class="text-slate-600 ml-1">(Nível 1)</span>
            </p>
            <p class="text-xs text-slate-500 text-center">
              <span class="text-primary-light font-mono">user@user.com</span> /
              <span class="text-primary-light font-mono">123456</span>
              <span class="text-slate-600 ml-1">(Nível 2)</span>
            </p>
          </div>-->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useValidation } from '@/composables/useValidation'
import AppFormField from '@/components/AppFormField.vue'
import type { userModel } from '@/models/userModel'

const userStore = useUserStore()
const router = useRouter()
const { validateEmail, validatePassword } = useValidation()

const form = reactive({
  email: '',
  senha: '',
})

const errors = reactive({
  email: '',
  senha: '',
})

const loginError = ref('')

function validate(): boolean {
  let valid = true

  const emailResult = validateEmail(form.email)
  errors.email = emailResult.errorMessage
  if (!emailResult.isValid) valid = false

  const senhaResult = validatePassword(form.senha)
  errors.senha = senhaResult.errorMessage
  if (!senhaResult.isValid) valid = false

  return valid
}

async function handleLogin(): Promise<void> {
  if (!validate()) return
  
  loginError.value = ''

  const userPayload: userModel = {
    login: form.email.trim(),
    senha: form.senha,
    fazenda: ''
  }

  await userStore.getUser(userPayload)

  if (userStore.logado) {
    await router.push('/upload')
  } else {
    loginError.value = 'E-mail ou senha inválidos'
  }
}
</script>
