import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { User, UserFormData } from '@/types'

import {
  getUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
} from '@/services/api'

import { getLogin } from '@/services/user_service'

import type { userModel } from '@/models/userModel'

const userList = ref<userModel[]>([])

export const useUserStore = defineStore('users', () => {
  const users = ref<User[]>([])

  const loading = ref(false)

  const error = ref<string | null>(null)

  const logado = ref(false)

  async function fetchUsers(): Promise<void> {
    loading.value = true

    error.value = null

    try {
      const response = await getUsersApi()

      if (response.success && response.data) {
        users.value = response.data
      }
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function addUser(
    data: UserFormData
  ): Promise<{ success: boolean; message: string }> {
    loading.value = true

    try {
      const response = await createUserApi(data)

      if (response.success && response.data) {
        users.value.push(response.data)

        return {
          success: true,
          message: response.message,
        }
      }

      return {
        success: false,
        message: response.message,
      }
    } catch (e) {
      return {
        success: false,
        message: 'Erro ao criar usuário.',
      }
    } finally {
      loading.value = false
    }
  }

  async function getUser(user: userModel) {
    logado.value = false

    try {
      const response = await getLogin(user, true)

      const data: userModel[] = response

      userList.value = data

      if (userList.value.length > 0) {
        logado.value = true
      }
    } catch (e: any) {
      console.log(e.message)
    }
  }

  async function updateUser(
    id: string,
    data: UserFormData
  ): Promise<{ success: boolean; message: string }> {
    loading.value = true

    try {
      const response = await updateUserApi(
        String(id),
        data
      )

      if (response.success && response.data) {
        const index = users.value.findIndex(
          (u) => String(u.id) === String(id)
        )

        if (index !== -1) {
          users.value[index] = response.data
        }

        return {
          success: true,
          message: response.message,
        }
      }

      return {
        success: false,
        message: response.message,
      }
    } catch (e) {
      return {
        success: false,
        message: 'Erro ao atualizar usuário.',
      }
    } finally {
      loading.value = false
    }
  }

  async function removeUser(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    loading.value = true

    try {
      const response = await deleteUserApi(
        String(id)
      )

      if (response.success) {
        users.value = users.value.filter(
          (u) => String(u.id) !== String(id)
        )

        return {
          success: true,
          message: response.message,
        }
      }

      return {
        success: false,
        message: response.message,
      }
    } catch (e) {
      return {
        success: false,
        message: 'Erro ao excluir usuário.',
      }
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
    getUser,
  }
})
