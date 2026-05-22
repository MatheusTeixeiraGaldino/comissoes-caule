import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, UserFormData } from '@/types'
import { userService } from '@/services/user_service'
import {
  getUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
} from '@/services/api'
import type { userModel } from '@/models/userModel'

const userservice = userService;

const userList = ref<userModel[]>([]);

export const useUserStore = defineStore('users', () => {
  // ---------- State ----------
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ---------- Actions ----------

  /** Busca todos os usuários do backend */
  async function fetchUsers(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const response = await getUsersApi()
      if (response.success && response.data) {
        users.value = response.data
      } else {
        error.value = response.message
      }
    } catch (e) {
      error.value = 'Erro ao carregar usuários.'
      console.error('[UserStore] Fetch error:', e)
    } finally {
      loading.value = false
    }
  }

  /** Adiciona um novo usuário */
  async function addUser(data: UserFormData): Promise<{ success: boolean; message: string }> {
    loading.value = true
    error.value = null

    try {
      const response = await createUserApi(data)
      if (response.success && response.data) {
        users.value.push(response.data)
        return { success: true, message: response.message }
      }
      return { success: false, message: response.message }
    } catch (e) {
      console.error('[UserStore] Create error:', e)
      return { success: false, message: 'Erro ao criar usuário.' }
    } finally {
      loading.value = false
    }
  }

  const logado = ref(false);


  async function getUser(user: userModel) {
    logado.value = false;


    try {
      console.log('antes response')
      const response = await userService.getLogin(user);
      console.log('depois response')
      const data: userModel[] = response;
      console.log(data)

      // 3. Atribui a lista à ref usando o .value
      userList.value = data;



      if (userList.value.length > 0) {
        logado.value = true;
      }
    }
    catch (e: any) {
      console.log('Fetch user erro')
      console.log(e.message)
    }
    finally {

      console.log('Fetch user completed')
    }
  }


  /** Atualiza um usuário existente */
  async function updateUser(
    id: string,
    data: UserFormData
  ): Promise<{ success: boolean; message: string }> {
    loading.value = true
    error.value = null

    try {
      const response = await updateUserApi(id, data)
      if (response.success && response.data) {
        const index = users.value.findIndex((u) => u.id === id)
        if (index !== -1) {
          users.value[index] = response.data
        }
        return { success: true, message: response.message }
      }
      return { success: false, message: response.message }
    } catch (e) {
      console.error('[UserStore] Update error:', e)
      return { success: false, message: 'Erro ao atualizar usuário.' }
    } finally {
      loading.value = false
    }
  }

  /** Remove um usuário pelo ID */
  async function removeUser(id: string): Promise<{ success: boolean; message: string }> {
    loading.value = true
    error.value = null

    try {
      const response = await deleteUserApi(id)
      if (response.success) {
        users.value = users.value.filter((u) => u.id !== id)
        return { success: true, message: response.message }
      }
      return { success: false, message: response.message }
    } catch (e) {
      console.error('[UserStore] Delete error:', e)
      return { success: false, message: 'Erro ao excluir usuário.' }
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
    addUser,
    updateUser,
    removeUser,
    logado,
    getUser
  }
})
