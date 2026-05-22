import { useAuthStore } from '@/stores/authStore'
import type { LoginPayload } from '@/types'
import { UserLevel } from '@/types'
import { useRouter } from 'vue-router'

/**
 * Composable para operações de autenticação.
 * Encapsula a lógica do authStore para uso nos componentes.
 */
export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  /** Realiza o login e redireciona para a rota adequada */
  async function login(payload: LoginPayload): Promise<boolean> {
    const success = await authStore.login(payload)
    if (success) {
      // Admin vai para /users, outros vão para /upload
      const redirectTo = authStore.canAccessUsers ? '/users' : '/upload'
      await router.push(redirectTo)
    }
    return success
  }

  /** Realiza o logout e redireciona para o login */
  function logout(): void {
    authStore.logout()
    router.push('/login')
  }

  /** Verifica se o nível do usuário tem permissão para o nível requerido */
  function isAllowed(requiredLevel: UserLevel): boolean {
    return authStore.hasAccess(requiredLevel)
  }

  return {
    login,
    logout,
    isAllowed,
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    loading: authStore.loading,
    error: authStore.error,
  }
}
