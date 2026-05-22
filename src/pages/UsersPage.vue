<template>
  <div class="animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-100">Usuários</h1>
        <p class="text-sm text-slate-500 mt-1">Gerencie os usuários do sistema</p>
      </div>
      <button class="btn-glow" @click="openModal()">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Adicionar Registro
      </button>
    </div>

    <!-- Users Table -->
    <div class="glass-card overflow-x-auto">
      <!--<AppTable
        :columns="columns"
        :data="tableData"
        :actions="tableActions"
        empty-message="Nenhum usuário cadastrado."
        @action="handleAction"
      />-->
      <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                   <thead class="bg-[#646cff] text-white">
                                    <tr class=" text-white">
                                        <th class="text-left font-medium px-4 py-3">
                                        <span>Id</span>
                                        </th>
                                        <th class="text-left font-medium px-4 py-3">
                                        <span>Nome</span>
                                        </th>
                                        <th class="text-left font-medium px-4 py-3">
                                        <span>Email</span>
                                        </th>
                                        <th class="text-left font-medium px-4 py-3">
                                        <span>Nivel</span>
                                        </th>
                                        
                                       
                                        <th class="text-right font-medium px-4 py-3">Ações</th>
                                    </tr>
                                    </thead>
                                    <tbody class="divide-y divide-border">
                                        <tr v-for="a in  userStore.users" :key="a.id" class="hover:bg-muted/30">
                                            <td class="px-4 py-3 font-medium text-foreground whitespace-nowrap">{{ a.id }}</td>
                                            <td class="px-4 py-3 text-foreground/90 whitespace-nowrap">{{ a.nome }}</td>

                                            <td class="px-4 py-3 font-medium text-foreground whitespace-nowrap">{{ a.email }}</td>
                                            <td class="px-4 py-3 text-foreground/90 whitespace-nowrap">{{ a.nivel}}</td>
                                            
                                            
                                            <td class="px-4 py-3">
                                                <div class="flex items-center justify-end gap-2">
                                                    <button
                                                    type="button"
                                                    class="bg-[#1C3F3A] text-[#F5F2E8] h-9 w-9 rounded-lg border border-input bg-background text-foreground shadow-sm hover:bg-muted inline-flex items-center justify-center"
                                                    title="Visualizar"
                                                    
                                                    >
                                                    <Eye class="h-4 w-4 " />
                                                    </button>
                                                    <button
                                                    type="button"
                                                    class="bg-[#1C3F3A] text-[#F5F2E8] h-9 w-9 rounded-lg bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 inline-flex items-center justify-center"
                                                    
                                                    
                                                    >
                                                    <Pencil class="h-4 w-4" />
                                                    </button>
                                                    <button
                                                    type="button"
                                                    class="bg-[#1C3F3A] text-[#F5F2E8]  h-9 w-9 rounded-lg bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 inline-flex items-center justify-center"
                                                    title="Excluir"
                                                    
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

    <!-- Loading overlay -->
    <div
      v-if="userStore.loading"
      class="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm"
    >
      <div class="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>

    <!-- Create/Edit Modal -->
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
          class="px-4 py-2 rounded-lg text-sm font-medium text-slate-400
                 hover:text-slate-200 hover:bg-surface transition-all duration-200"
          @click="closeModal"
        >
          Cancelar
        </button>
        <button
          class="btn-glow"
          :disabled="userStore.loading"
          @click="handleSubmit"
        >
          <div v-if="userStore.loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span v-else>{{ isEditing ? 'Salvar' : 'Adicionar' }}</span>
        </button>
      </template>
    </AppModal>

    <!-- Delete Confirmation Modal -->
    <AppModal
      :is-open="isDeleteModalOpen"
      title="Confirmar Exclusão"
      size="sm"
      @close="isDeleteModalOpen = false"
    >
      <p class="text-sm text-slate-300">
        Tem certeza que deseja excluir o usuário
        <strong class="text-slate-100">{{ deleteTarget?.nome }}</strong>?
      </p>
      <p class="text-xs text-slate-500 mt-2">Esta ação não poderá ser desfeita.</p>

      <template #footer>
        <button
          class="px-4 py-2 rounded-lg text-sm font-medium text-slate-400
                 hover:text-slate-200 hover:bg-surface transition-all duration-200"
          @click="isDeleteModalOpen = false"
        >
          Cancelar
        </button>
        <button
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-white
                 bg-gradient-to-r from-red-500 to-red-600
                 hover:from-red-400 hover:to-red-500
                 transition-all duration-200"
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
import { ref, reactive, computed, onMounted, inject } from 'vue'
import { ArrowUpDown, Eye, Pencil, Trash2 } from 'lucide-vue-next'
import AppModal from '@/components/AppModal.vue'
import AppFormField from '@/components/AppFormField.vue'
import { useUserStore } from '@/stores/userStore'
import { useValidation } from '@/composables/useValidation'
import { UserLevel, UserLevelLabels } from '@/types'
import type { User, UserFormData, TableColumn, TableAction } from '@/types'

const userStore = useUserStore()
const { validateEmail, validatePassword, validateName } = useValidation()
const notify = inject<(type: 'success' | 'error' | 'info' | 'warning', msg: string) => void>('notify')

function actionClass(variant?: string): string {
  switch (variant) {
    case 'danger':
      return 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
    case 'warning':
      return 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
    default:
      return 'text-primary-light hover:text-primary hover:bg-primary/10'
  }
}

// ---------- Table config ----------
const columns: TableColumn[] = [
  { key: 'nome', label: 'Nome' },
  { key: 'email', label: 'Email' },
  {
    key: 'nivel',
    label: 'Nível',
    align: 'center',
    width: '150px',
    formatter: (val) => UserLevelLabels[val as UserLevel] ?? String(val),
  },
]

const tableActions: TableAction[] = [
  { key: 'edit', label: 'Alterar', icon: 'edit', variant: 'primary' },
  { key: 'delete', label: 'Excluir', icon: 'delete', variant: 'danger' },
]

const tableData = computed(() =>
  userStore.users.map((u) => ({ ...u } as unknown as Record<string, unknown>))
)

// ---------- Modal state ----------
const isModalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)

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
  { value: String(UserLevel.ADMIN), label: UserLevelLabels[UserLevel.ADMIN] },
  { value: String(UserLevel.OPERATOR), label: UserLevelLabels[UserLevel.OPERATOR] },
  { value: String(UserLevel.VIEWER), label: UserLevelLabels[UserLevel.VIEWER] },
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
  if (!nameResult.isValid) valid = false

  const emailResult = validateEmail(form.email)
  formErrors.email = emailResult.errorMessage
  if (!emailResult.isValid) valid = false

  const senhaResult = validatePassword(form.senha, !isEditing.value)
  formErrors.senha = senhaResult.errorMessage
  if (!senhaResult.isValid) valid = false

  return valid
}

async function handleSubmit(): Promise<void> {
  if (!validate()) return

  const payload: UserFormData = {
    email: form.email.trim(),
    senha: form.senha,
    nome: form.nome.trim(),
    nivel: Number(form.nivel) as UserLevel,
  }

  if (isEditing.value && editingId.value) {
    const result = await userStore.updateUser(editingId.value, payload)
    notify?.(result.success ? 'success' : 'error', result.message)
  } else {
    const result = await userStore.addUser(payload)
    notify?.(result.success ? 'success' : 'error', result.message)
  }

  closeModal()
}

function handleAction(key: string, row: Record<string, unknown>): void {
  const user = row as unknown as User
  if (key === 'edit') {
    openModal(user)
  } else if (key === 'delete') {
    deleteTarget.value = user
    isDeleteModalOpen.value = true
  }
}

async function confirmDelete(): Promise<void> {
  if (!deleteTarget.value) return
  const result = await userStore.removeUser(deleteTarget.value.id)
  notify?.(result.success ? 'success' : 'error', result.message)
  isDeleteModalOpen.value = false
  deleteTarget.value = null
}
</script>
