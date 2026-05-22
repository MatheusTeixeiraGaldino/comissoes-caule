<template>
  <div class="min-h-screen flex items-center justify-center bg-[#0F172A] px-4">
    <div
      class="w-full max-w-md bg-[#1E293B] border border-[#334155] rounded-2xl shadow-2xl p-8"
    >
      <!-- Logo -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">
          Comissões Caule
        </h1>

        <p class="text-slate-400 text-sm">
          Faça login para continuar
        </p>
      </div>

      <!-- Form -->
      <form
        class="space-y-5"
        @submit.prevent="handleLogin"
      >
        <!-- Email -->
        <div>
          <label class="block text-sm text-slate-300 mb-2">
            E-mail
          </label>

          <input
            v-model="form.email"
            type="email"
            placeholder="Digite seu e-mail"
            class="w-full h-11 px-4 rounded-xl bg-[#0F172A] border border-[#334155] text-white outline-none focus:border-[#646cff]"
          />

          <p
            v-if="errors.email"
            class="text-red-400 text-xs mt-1"
          >
            {{ errors.email }}
          </p>
        </div>

        <!-- Senha -->
        <div>
          <label class="block text-sm text-slate-300 mb-2">
            Senha
          </label>

          <input
            v-model="form.senha"
            type="password"
            placeholder="Digite sua senha"
            class="w-full h-11 px-4 rounded-xl bg-[#0F172A] border border-[#334155] text-white outline-none focus:border-[#646cff]"
          />

          <p
            v-if="errors.senha"
            class="text-red-400 text-xs mt-1"
          >
            {{ errors.senha }}
          </p>
        </div>

        <!-- Error -->
        <div
          v-if="loginError"
          class="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400"
        >
          {{ loginError }}
        </div>

        <!-- Button -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full h-11 rounded-xl bg-[#646cff] hover:bg-[#7c83ff] transition-all duration-200 text-white font-semibold flex items-center justify-center"
        >
          <div
            v-if="loading"
            class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
          />

          <span v-else>
            Entrar
          </span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useUserStore } from '@/stores/userStore'

const router = useRouter()

const userStore = useUserStore()

const loading = ref(false)

const loginError = ref('')

const form = reactive({
  email: '',
  senha: '',
})

const errors = reactive({
  email: '',
  senha: '',
})

function validate(): boolean {
  errors.email = ''
  errors.senha = ''

  let valid = true

  if (!form.email) {
    errors.email = 'Informe o e-mail'
    valid = false
  }

  if (!form.senha) {
    errors.senha = 'Informe a senha'
    valid = false
  }

  return valid
}

async function handleLogin() {
  loginError.value = ''

  if (!validate()) return

  loading.value = true

  try {
    await userStore.getUser(
      form.email,
      form.senha
    )

    if (userStore.logado) {
      router.push('/')
    } else {
      loginError.value =
        'Usuário ou senha inválidos'
    }
  } catch (e) {
    console.error(e)

    loginError.value =
      'Erro ao realizar login'
  } finally {
    loading.value = false
  }
}
</script>
