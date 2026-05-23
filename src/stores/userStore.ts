import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { User, UserFormData } from '@/types'

import { getLogin } from '@/services/user_service'

import {
  getUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
} from '@/services/api'

import type { userModel } from '@/models/userModel'

export const useUserStore = defineStore('users', () => {
  const users = ref<User[]>([])

  const loading = ref(false)

  const error = ref<string | null>(null)

  const logado = ref(false)

  const userList = ref<userModel[]>([])

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
    } finally {
      loading.value = false
    }
  }

  async function updateUser(
    id: string,
    data: UserFormData
  ): Promise<{ success: boolean; message: string }> {
    loading.value = true

    try {
      const response = await updateUserApi(id, data)

      if (response.success && response.data) {
        const index = users.value.findIndex(
          (u) => String(u.id) === id
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
    } finally {
      loading.value = false
    }
  }

  async function removeUser(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    loading.value = true

    try {
      const response = await deleteUserApi(id)

      if (response.success) {
        users.value = users.value.filter(
          (u) => String(u.id) !== id
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
    } finally {
      loading.value = false
    }
  }

  async function getUser(
    login: string,
    senha: string
  ) {
    logado.value = false

    try {
      const response = await getLogin(login, senha)

      // O getLogin pode retornar um objeto único (do mock) ou um array (da API)
      const data: userModel[] = Array.isArray(response) ? response : [response]

      userList.value = data

      if (userList.value.length > 0 && userList.value[0]) {
        logado.value = true
      }
    } catch (e: any) {
      console.log(e.message)
    }
  }

  return {
    users,
    loading,
    error,
    logado,
    userList,
    fetchUsers,
    addUser,
    updateUser,
    removeUser,
    getUser,
  }
})
