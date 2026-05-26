<template>
  <div class="animate-fade-in">
    <div class="mb-6">
      <h1 class="text-2xl font-bold !text-black">Upload por Período</h1>
      <p class="text-sm !text-black mt-1">Selecione o período e envie arquivos PDF com o nome sendo o CPF</p>
    </div>

    <!-- Period Selection -->
    <div class="glass-card p-6 mb-6">
      <h2 class="text-lg font-semibold !text-black mb-4">Selecione o Período</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="flex flex-col gap-1.5">
          <label for="dataInicial" class="text-sm font-medium !text-black">
            Data Inicial
          </label>

          <input
            type="date"
            id="dataInicial"
            v-model="dataInicial"
            class="bg-surface/50 border border-glass rounded-lg px-4 py-2.5 !text-black focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="dataFinal" class="text-sm font-medium !text-black">
            Data Final
          </label>

          <input
            type="date"
            id="dataFinal"
            v-model="dataFinal"
            class="bg-surface/50 border border-glass rounded-lg px-4 py-2.5 !text-black focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300"
          />
        </div>
      </div>
    </div>

    <!-- Drop Zone -->
    <div
      class="glass-card p-8 mb-6 border-2 border-dashed transition-all duration-300 cursor-pointer text-center"
      :class="isDragging ? 'border-primary bg-primary/5 shadow-glow' : 'border-glass hover:border-glass-hover'"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept=".pdf"
        multiple
        class="hidden"
        @change="handleFileSelect"
      />

      <div class="flex flex-col items-center gap-4">
        <div
          class="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300"
          :class="isDragging ? 'bg-primary/20 !text-black' : 'bg-surface !text-black'"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        <div>
          <p class="text-sm font-semibold !text-black">
            {{ isDragging ? 'Solte os arquivos aqui' : 'Arraste arquivos PDF ou clique para selecionar' }}
          </p>

          <p class="text-xs !text-black mt-1">
            Apenas arquivos .pdf são aceitos. O nome do arquivo deve ser o CPF.
          </p>
        </div>
      </div>
    </div>

    <!-- Selected Files -->
    <div v-if="files.length > 0" class="glass-card p-0 overflow-hidden mb-6">
      <div class="px-5 py-4 flex items-center justify-between border-b border-glass">
        <h3 class="text-sm font-semibold !text-black">
          {{ files.length }} arquivo(s)
        </h3>

        <button
          class="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
          @click="files = []"
        >
          Remover todos
        </button>
      </div>

      <AppTable
        :columns="fileColumns"
        :data="fileTableData"
        :actions="fileActions"
        @action="handleFileAction"
      />
    </div>

    <!-- Send Button -->
    <div v-if="files.length > 0" class="flex items-center justify-between">
      <p class="text-sm !text-black">
        Total:
        <span class="!text-black font-semibold">{{ totalSize }}</span>
      </p>

      <button class="btn-glow" :disabled="uploading || !dataInicial || !dataFinal" @click="handleUpload">
        <div
          v-if="uploading"
          class="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"
        />
        <span>{{ uploading ? 'Enviando...' : 'Enviar Arquivos' }}</span>
      </button>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4"
    >
      <div class="bg-white p-6 max-w-md w-full mx-4 border rounded-2xl relative flex flex-col">
        <h3 class="text-xl font-bold !text-black text-center mb-2">
          {{ modalTitle }}
        </h3>

        <div class="!text-black text-center mb-6 whitespace-pre-wrap text-sm">
          {{ modalMessage }}
        </div>

        <button
          class="w-full bg-gray-200 hover:bg-gray-300 !text-black font-medium rounded-lg px-4 py-3 transition-colors duration-200"
          @click="closeModal"
        >
          Fechar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import AppTable from '@/components/AppTable.vue'
import type { UploadFile, TableColumn, TableAction } from '@/types'
import { uploadFilesApi } from '@/services/api'
import { 
  formatDateForDisplay, 
  formatFileSize 
} from '@/utils/fileUtils'

const notify = inject('notify')
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const uploading = ref(false)
const files = ref<UploadFile[]>([])
const dataInicial = ref('')
const dataFinal = ref('')

const showModal = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')

function closeModal() {
  showModal.value = false
}

const fileColumns: TableColumn[] = [
  { key: 'name', label: 'Nome do Arquivo' },
  { key: 'sizeFormatted', label: 'Tamanho', align: 'right', width: '120px' },
]

const fileActions: TableAction[] = [
  { key: 'remove', label: 'Remover', icon: 'remove', variant: 'danger' },
]

const fileTableData = computed(() =>
  files.value.map((f) => ({
    id: f.id,
    name: f.name,
    sizeFormatted: formatFileSize(f.size),
  }))
)

const totalSize = computed(() =>
  formatFileSize(files.value.reduce((s, f) => s + f.size, 0))
)

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileSelect(e: Event) {
  const t = e.target as HTMLInputElement
  if (t.files) addFiles(Array.from(t.files))
  t.value = ''
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer?.files) addFiles(Array.from(e.dataTransfer.files))
}

function addFiles(newFiles: File[]) {
  const pdfs = newFiles.filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'))

  if (!pdfs.length) return

  files.value.push(
    ...pdfs.map(file => {
      // No modo por período, o CPF é o nome do arquivo sem extensão
      const cpf = file.name.replace(/\.pdf$/i, '').replace(/\D/g, '')

      return {
        id: Math.random().toString(36).slice(2),
        file,
        name: file.name,
        size: file.size,
        status: 'pending' as const,
        progress: 0,
        extractedCpf: cpf.length === 11 ? cpf : undefined
      }
    })
  )
}

function handleFileAction(key: string, row: any) {
  if (key === 'remove') {
    files.value = files.value.filter(f => f.id !== row.id)
  }
}

async function handleUpload() {
  if (!files.value.length || !dataInicial.value || !dataFinal.value) return

  uploading.value = true

  try {
    const r = await uploadFilesApi(
      files.value.map(f => ({
        file: f.file,
        cpf: f.extractedCpf,
        // No modo por período, usamos as datas globais selecionadas
      })),
      dataInicial.value,
      dataFinal.value
    )

    if (r.success) {
      showModal.value = true
      modalTitle.value = 'Sucesso'
      modalMessage.value = 'Arquivos enviados com sucesso'
      files.value = []
    } else {
      showModal.value = true
      modalTitle.value = 'Erro'
      modalMessage.value = r.message || 'Erro ao enviar'
    }
  } finally {
    uploading.value = false
  }
}
</script>
