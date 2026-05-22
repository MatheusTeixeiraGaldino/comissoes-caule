<template>
  <div class="animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-100">Usuários</h1>
        <p class="text-sm text-slate-500 mt-1">
          Gerencie os usuários do sistema
        </p>
      </div>

      <button class="btn-glow" @click="openModal()">
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>

        Adicionar Registro
      </button>
    </div>

    <!-- Tabela -->
    <div class="glass-card overflow-x-auto">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-[#646cff] text-white">
            <tr>
              <th class="text-left font-medium px-4 py-3">Id</th>

              <th class="text-left font-medium px-4 py-3">
                Nome
              </th>

              <th class="text-left font-medium px-4 py-3">
                Email
              </th>

              <th class="text-left font-medium px-4 py-3">
                Nível
              </th>

              <th class="text-right font-medium px-4 py-3">
                Ações
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-border">
            <tr
              v-for="user in userStore.users"
              :key="user.id"
              class="hover:bg-muted/30"
            >
              <td class="px-4 py-3 font-medium whitespace-nowrap">
                {{ user.id }}
              </td>

              <td class="px-4 py-3 whitespace-nowrap">
                {{ user.nome }}
              </td>

              <td class="px-4 py-3 whitespace-nowrap">
                {{ user.email }}
              </td>

              <td class="px-4 py-3 whitespace-nowrap">
                {{ UserLevelLabels[user.nivel] }}
              </td>

              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    class="bg-[#1C3F3A] text-[#F5F2E8] h-9 w-9 rounded-lg inline-flex items-center justify-center"
                  >
                    <Eye class="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    class="bg-[#1C3F3A] text-[#F5F2E8] h-9 w-9 rounded-lg inline-flex items-center justify-center"
                    @click="openModal(user)"
                  >
                    <Pencil class="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    class="bg-red-600 text-white h-9 w-9 rounded-lg inline-flex items-center justify-center"
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

    <!-- Loading -->
    <div
      v-if="userStore.loading"
      class="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm"
    >
      <div
        class="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin"
      />
    </div>

    <!-- Modal -->
    <AppModal
      :is-open="isModalOpen"
      :title="isEditing ? 'Alterar Usuário' : 'Adicionar Usuário'"
      size="md"
      @close="closeModal"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <AppFormField
          label="Nome"
          v-model="form.nome"
          placeholder="Nome completo"
          :error="formErrors.nome"
          required
        />

        <AppFormField
          label="Email"
          type="email"
          v-model="form.email"
          placeholder="email@exemplo.com"
          :error="formErrors.email"
          required
        />

        <AppFormField
          label="Senha"
          type="password"
          v-model="form.senha"
          :placeholder="isEditing ? 'Deixe vazio para manter' : '••••••'"
          :error="formErrors.senha"
          :required="!isEditing"
        />

        <AppFormField
          label="Nível de Acesso"
          type="select"
          v-model="form.nivel"
          :error="formErrors.nivel"
          :options="levelOptions"
          required
        />
      </form>

      <template #footer>
        <button
          class="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200"
          @click="closeModal"
        >
          Cancelar
        </button>

        <button
          class="btn-glow"
          :disabled="userStore.loading"
          @click="handleSubmit"
        >
          <span>
            {{ isEditing ? 'Salvar' : 'Adicionar' }}
          </span>
        </button>
      </template>
    </AppModal>

    <!-- Delete -->
    <AppModal
      :is-open="isDeleteModalOpen"
      title="Confirmar Exclusão"
      size="sm"
      @close="isDeleteModalOpen = false"
    >
      <p class="text-sm text-slate-300">
        Tem certeza que deseja excluir o usuário
        <strong class="text-slate-100">
          {{ deleteTarget?.nome }}
        </strong>
        ?
      </p>

      <template #footer>
        <button
          class="px-4 py-2 rounded-lg text-sm font-medium text-slate-400"
          @click="isDeleteModalOpen = false"
        >
          Cancelar
        </button>

        <button
          class="bg-red-600 text-white px-4 py-2 rounded-lg"
          :disabled="userStore.loading"
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
import { Eye, Pencil, Trash2 } from 'lucide-vue-next'

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

// ---------- Modal ----------
const isModalOpen = ref(false)

const isEditing = ref(false)

const editingId = ref<string | number | null>(null)

const isDeleteModalOpen = ref(false)

const deleteTarget = ref<User | null>(null)

const form = reactive<UserFormData>({
  email: '',
  senha: '',
  nome: '',
  nivel: UserLevel.VIEWER,
})

const formErrors = reactive({
  email: '',
  senha: '',
  nome: '',
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

// ---------- Lifecycle ----------
onMounted(() => {
  userStore.fetchUsers()
})

// ---------- Methods ----------
function openModal(user?: User): void {
  if (user) {
    isEditing.value = true

    editingId.value = user.id

    form.email = user.email
    form.nome = user.nome
    form.nivel = user.nivel
    form.senha = ''
  } else {
    isEditing.value = false

    editingId.value = null

    form.email = ''
    form.nome = ''
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
  formErrors.email = ''
  formErrors.senha = ''
  formErrors.nome = ''
  formErrors.nivel = ''
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

  const senhaResult = validatePassword(
    form.senha,
    !isEditing.value
  )

  formErrors.senha = senhaResult.errorMessage

  if (!senhaResult.isValid) {
    valid = false
  }

  return valid
}

async function handleSubmit(): Promise<void> {
  if (!validate()) {
    return
  }

  const payload: UserFormData = {
    email: form.email.trim(),
    senha: form.senha,
    nome: form.nome.trim(),
    nivel: Number(form.nivel) as UserLevel,
  }

  if (isEditing.value && editingId.value !== null) {
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
    deleteTarget.value.id
  )

  notify?.(
    result.success ? 'success' : 'error',
    result.message
  )

  isDeleteModalOpen.value = false

  deleteTarget.value = null
}
</script>
