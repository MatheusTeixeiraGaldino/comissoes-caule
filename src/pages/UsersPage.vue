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

const { validateEmail, validatePassword, validateName } = useValidation()

const notify = inject<
  (type: 'success' | 'error' | 'info' | 'warning', msg: string) => void
>('notify')

const isModalOpen = ref(false)
const isEditing = ref(false)

const editingId = ref<string>('')

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
    value: UserLevel.ADMIN,
    label: UserLevelLabels[UserLevel.ADMIN],
  },
  {
    value: UserLevel.OPERATOR,
    label: UserLevelLabels[UserLevel.OPERATOR],
  },
  {
    value: UserLevel.VIEWER,
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

    form.email = user.email
    form.nome = user.nome
    form.nivel = user.nivel
    form.senha = ''
  } else {
    isEditing.value = false

    editingId.value = ''

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
  form.email = ''
  form.senha = ''
  form.nome = ''
  form.nivel = UserLevel.VIEWER

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

  const senhaResult = validatePassword(
    form.senha,
    !isEditing.value
  )

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

  if (isEditing.value) {
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

function handleDelete(user: User): void {
  deleteTarget.value = user
  isDeleteModalOpen.value = true
}

async function confirmDelete(): Promise<void> {
  if (!deleteTarget.value) return

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
