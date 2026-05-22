<template>
  <div class="animate-fade-in">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-100">Usuários</h1>
        <p class="text-sm text-slate-500 mt-1">
          Gerencie os usuários do sistema
        </p>
      </div>

      <button class="btn-glow" @click="openModal()">
        Adicionar Registro
      </button>
    </div>

    <div class="glass-card overflow-x-auto">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-[#646cff] text-white">
            <tr>
              <th class="text-left px-4 py-3">ID</th>
              <th class="text-left px-4 py-3">Nome</th>
              <th class="text-left px-4 py-3">Email</th>
              <th class="text-left px-4 py-3">Nível</th>
              <th class="text-right px-4 py-3">Ações</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="user in userStore.users"
              :key="user.id"
              class="border-b border-slate-700"
            >
              <td class="px-4 py-3">
                {{ user.id }}
              </td>

              <td class="px-4 py-3">
                {{ user.nome }}
              </td>

              <td class="px-4 py-3">
                {{ user.email }}
              </td>

              <td class="px-4 py-3">
                {{ UserLevelLabels[user.nivel] }}
              </td>

              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <button
                    class="bg-blue-600 text-white h-9 w-9 rounded-lg flex items-center justify-center"
                    @click="openModal(user)"
                  >
                    <Pencil class="h-4 w-4" />
                  </button>

                  <button
                    class="bg-red-600 text-white h-9 w-9 rounded-lg flex items-center justify-center"
                    @click="openDeleteModal(user)"
                  >
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AppModal
      :is-open="isModalOpen"
      :title="isEditing ? 'Editar Usuário' : 'Novo Usuário'"
      size="md"
      @close="closeModal"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <AppFormField
          label="Nome"
          v-model="form.nome"
          :error="formErrors.nome"
          required
        />

        <AppFormField
          label="Email"
          type="email"
          v-model="form.email"
          :error="formErrors.email"
          required
        />

        <AppFormField
          label="Senha"
          type="password"
          v-model="form.senha"
          :error="formErrors.senha"
        />

        <AppFormField
          label="Nível"
          type="select"
          v-model="form.nivel"
          :options="levelOptions"
          :error="formErrors.nivel"
        />
      </form>

      <template #footer>
        <button
          class="px-4 py-2 rounded-lg bg-slate-700 text-white"
          @click="closeModal"
        >
          Cancelar
        </button>

        <button
          class="btn-glow"
          @click="handleSubmit"
        >
          Salvar
        </button>
      </template>
    </AppModal>

    <AppModal
      :is-open="isDeleteModalOpen"
      title="Excluir Usuário"
      size="sm"
      @close="isDeleteModalOpen = false"
    >
      <p class="text-slate-300">
        Deseja realmente excluir
        <strong>{{ deleteTarget?.nome }}</strong>?
      </p>

      <template #footer>
        <button
          class="px-4 py-2 rounded-lg bg-slate-700 text-white"
          @click="isDeleteModalOpen = false"
        >
          Cancelar
        </button>

        <button
          class="px-4 py-2 rounded-lg bg-red-600 text-white"
          @click="confirmDelete"
        >
          Excluir
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, inject } from 'vue'
import { Pencil, Trash2 } from 'lucide-vue-next'

import AppModal from '@/components/AppModal.vue'
import AppFormField from '@/components/AppFormField.vue'

import { useUserStore } from '@/stores/userStore'
import { useValidation } from '@/composables/useValidation'

import { UserLevel, UserLevelLabels } from '@/types'
import type { User, UserFormData } from '@/types'

const userStore = useUserStore()

const { validateEmail, validatePassword, validateName } =
  useValidation()

const notify = inject<
  (type: 'success' | 'error' | 'info' | 'warning', msg: string) => void
>('notify')

const isModalOpen = ref(false)

const isEditing = ref(false)

const editingId = ref<string | null>(null)

const isDeleteModalOpen = ref(false)

const deleteTarget = ref<User | null>(null)

const form = reactive<UserFormData>({
  nome: '',
  email: '',
  senha: '',
  nivel: UserLevel.VIEWER,
})

const formErrors = reactive({
  nome: '',
  email: '',
  senha: '',
  nivel: '',
})

const levelOptions = [
  {
    value: String(UserLevel.ADMIN),
    label: UserLevelLabels[UserLevel.ADMIN],
  },
  {
    value: String(UserLevel.OPERATOR),
    label: UserLevelLabels[UserLevel.OPERATOR],
  },
  {
    value: String(UserLevel.VIEWER),
    label: UserLevelLabels[UserLevel.VIEWER],
  },
]

onMounted(() => {
  userStore.fetchUsers()
})

function openModal(user?: User): void {
  if (user) {
    isEditing.value = true

    editingId.value = String(user.id)

    form.nome = user.nome
    form.email = user.email
    form.nivel = user.nivel
    form.senha = ''
  } else {
    isEditing.value = false

    editingId.value = null

    form.nome = ''
    form.email = ''
    form.senha = ''
    form.nivel = UserLevel.VIEWER
  }

  clearErrors()

  isModalOpen.value = true
}

function closeModal(): void {
  isModalOpen.value = false
}

function clearErrors(): void {
  form.nome = ''
  form.email = ''
  form.senha = ''
  form.nivel = ''
}

function validate(): boolean {
  let valid = true

  const nameResult = validateName(form.nome)

  formErrors.nome = nameResult.errorMessage

  if (!nameResult.isValid) {
    valid = false
  }

  const emailResult = validateEmail(form.email)

  formErrors.email = emailResult.errorMessage

  if (!emailResult.isValid) {
    valid = false
  }

  const passwordResult = validatePassword(
    form.senha,
    !isEditing.value
  )

  formErrors.senha = passwordResult.errorMessage

  if (!passwordResult.isValid) {
    valid = false
  }

  return valid
}

async function handleSubmit(): Promise<void> {
  if (!validate()) {
    return
  }

  const payload: UserFormData = {
    nome: form.nome,
    email: form.email,
    senha: form.senha,
    nivel: Number(form.nivel) as UserLevel,
  }

  if (isEditing.value && editingId.value) {
    const result = await userStore.updateUser(
      editingId.value,
      payload
    )

    notify?.(
      result.success ? 'success' : 'error',
      result.message
    )
  } else {
    const result = await userStore.addUser(payload)

    notify?.(
      result.success ? 'success' : 'error',
      result.message
    )
  }

  closeModal()
}

function openDeleteModal(user: User): void {
  deleteTarget.value = user

  isDeleteModalOpen.value = true
}

async function confirmDelete(): Promise<void> {
  if (!deleteTarget.value) {
    return
  }

  const result = await userStore.removeUser(
    String(deleteTarget.value.id)
  )

  notify?.(
    result.success ? 'success' : 'error',
    result.message
  )

  isDeleteModalOpen.value = false

  deleteTarget.value = null
}
</script>
