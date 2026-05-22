import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginPayload } from '@/types'
import { UserLevel } from '@/types'
import { loginApi } from '@/services/api'

const STORAGE_KEY_TOKEN = 'auth_token'
const STORAGE_KEY_USER = 'auth_user'

export const useAuthStore = defineStore('auth', () => {
  // ---------- State ----------
  const token = ref<string | null>(null)
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ---------- Getters ----------
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const userLevel = computed<UserLevel | null>(() => user.value?.nivel ?? null)

  /** Verifica se o usuário tem acesso a recursos que requerem nível específico */
  const canAccessUsers = computed(
    () => user.value?.nivel === UserLevel.ADMIN
  )

  // ---------- Actions ----------

  /** Tenta autenticar o usuário com email e senha */
  async function login(payload: LoginPayload): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const response = await loginApi(payload)

      if (response.success && response.data) {
        token.value = response.data.token
        user.value = response.data.user

        // Persistir no localStorage
        localStorage.setItem(STORAGE_KEY_TOKEN, response.data.token)
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(response.data.user))

        return true
      }

      error.value = response.message
      return false
    } catch (e) {
      error.value = 'Erro inesperado ao fazer login.'
      console.error('[AuthStore] Login error:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  /** Remove dados de autenticação e limpa o estado */
  function logout(): void {
    token.value = null
    user.value = null
    error.value = null
    localStorage.removeItem(STORAGE_KEY_TOKEN)
    localStorage.removeItem(STORAGE_KEY_USER)
  }

  /** Carrega dados de autenticação salvos no localStorage */
  function loadFromStorage(): void {
    const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN)
    const savedUser = localStorage.getItem(STORAGE_KEY_USER)

    if (savedToken && savedUser) {
      try {
        token.value = savedToken
        user.value = JSON.parse(savedUser) as User
      } catch {
        logout()
      }
    }
  }

  /** Verifica se o usuário tem permissão para o nível requerido */
  function hasAccess(requiredLevel: UserLevel): boolean {
    if (!user.value) return false
    // Nível 1 (ADMIN) tem acesso a tudo
    // Níveis 2 e 3 só acessam se requiredLevel >= 2
    return user.value.nivel <= requiredLevel
  }

  return {
    // State
    token,
    user,
    loading,
    error,
    // Getters
    isAuthenticated,
    userLevel,
    canAccessUsers,
    // Actions
    login,
    logout,
    loadFromStorage,
    hasAccess,
  }
})
