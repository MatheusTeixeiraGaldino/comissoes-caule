<template>
  <div class="animate-fade-in">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-100">Upload de Arquivos</h1>
      <p class="text-sm text-slate-500 mt-1">Selecione e envie arquivos PDF</p>
    </div>

    <!-- Period Selection -->
    <div class="glass-card p-6 mb-6">
      <h2 class="text-lg font-semibold text-slate-200 mb-4">Selecione o Período</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="flex flex-col gap-1.5">
          <label for="dataInicial" class="text-sm font-medium text-slate-400">Data Inicial</label>
          <input type="date" id="dataInicial" v-model="dataInicial" class="bg-surface/50 border border-glass rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="dataFinal" class="text-sm font-medium text-slate-400">Data Final</label>
          <input type="date" id="dataFinal" v-model="dataFinal" class="bg-surface/50 border border-glass rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300" />
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
      <input ref="fileInputRef" type="file" accept=".pdf" multiple class="hidden" @change="handleFileSelect" />
      <div class="flex flex-col items-center gap-4">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300"
             :class="isDragging ? 'bg-primary/20 text-primary-light' : 'bg-surface text-slate-400'">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-semibold text-slate-200">
            {{ isDragging ? 'Solte os arquivos aqui' : 'Arraste arquivos PDF ou clique para selecionar' }}
          </p>
          <p class="text-xs text-slate-500 mt-1">Apenas arquivos .pdf são aceitos</p>
        </div>
      </div>
    </div>

    <!-- Selected Files -->
    <div v-if="files.length > 0" class="glass-card p-0 overflow-hidden mb-6">
      <div class="px-5 py-4 flex items-center justify-between border-b border-glass">
        <h3 class="text-sm font-semibold text-slate-300">{{ files.length }} arquivo(s)</h3>
        <button class="text-xs text-red-400 hover:text-red-300 font-medium transition-colors" @click="files = []">
          Remover todos
        </button>
      </div>
      <AppTable :columns="fileColumns" :data="fileTableData" :actions="fileActions" @action="handleFileAction" />
    </div>

    <!-- Send Button -->
    <div v-if="files.length > 0" class="flex items-center justify-between">
      <p class="text-sm text-slate-500">Total: <span class="text-slate-300 font-semibold">{{ totalSize }}</span></p>
      <button class="btn-glow" :disabled="uploading" @click="handleUpload">
        <div v-if="uploading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <span>{{ uploading ? 'Enviando...' : 'Enviar Arquivos' }}</span>
      </button>
    </div>

    <!-- Result Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div class="bg-slate-900 p-6 max-w-md w-full mx-4 border border-slate-700 shadow-2xl rounded-2xl relative flex flex-col">
        <div class="flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto" :class="modalType === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'">
          <svg v-if="modalType === 'success'" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          <svg v-else class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </div>
        <h3 class="text-xl font-bold text-slate-100 text-center mb-2">{{ modalTitle }}</h3>
        <p class="text-slate-300 text-center mb-6">{{ modalMessage }}</p>
        <button class="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg px-4 py-3 transition-colors duration-200" @click="closeModal">
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

const notify = inject<(type: 'success' | 'error' | 'info' | 'warning', msg: string) => void>('notify')
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const uploading = ref(false)
const files = ref<UploadFile[]>([])
const dataInicial = ref('')
const dataFinal = ref('')

const showModal = ref(false)
const modalType = ref<'success' | 'error'>('success')
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
const fileTableData = computed(() => files.value.map((f) => ({ id: f.id, name: f.name, sizeFormatted: formatSize(f.size) })))
const totalSize = computed(() => formatSize(files.value.reduce((s, f) => s + f.size, 0)))

function triggerFileInput() { fileInputRef.value?.click() }
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
  const pdfs = newFiles.filter((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'))
  if (pdfs.length < newFiles.length) notify?.('warning', 'Apenas PDFs são aceitos.')
  if (!pdfs.length) { notify?.('error', 'Nenhum PDF selecionado.'); return }
  files.value.push(...pdfs.map((file) => ({
    id: Math.random().toString(36).slice(2), file, name: file.name, size: file.size, status: 'pending' as const, progress: 0,
  })))
  notify?.('info', `${pdfs.length} arquivo(s) adicionado(s).`)
}
function handleFileAction(key: string, row: Record<string, unknown>) {
  if (key === 'remove') files.value = files.value.filter((f) => f.id !== row.id)
}
function formatSize(bytes: number): string {
  if (!bytes) return '0 B'
  const u = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${u[i]}`
}
2
async function handleUpload() {

  if (!files.value.length)  {
    notify?.('error', 'Selecione arquivos para enviar')
    
    return
  }

  if (!dataInicial.value || !dataFinal.value) {
    notify?.('error', 'Preencha as datas')
     modalType.value = 'error'
      modalTitle.value = 'Erro no Envio'
      modalMessage.value = 'Preencha as datas.'
      showModal.value = true
    return
  }

  uploading.value = true
  try {
    const r = await uploadFilesApi(files.value.map((f) => f.file), dataInicial.value, dataFinal.value)
    if (r.success) { 
      modalType.value = 'success'
      modalTitle.value = 'Sucesso!'
      modalMessage.value = r.message || 'Arquivos enviados com sucesso.'
      showModal.value = true
      files.value = [] 
    }
    else {
      modalType.value = 'error'
      modalTitle.value = 'Erro no Envio'
      modalMessage.value = r.message || 'Ocorreu um erro ao enviar os arquivos.'
      showModal.value = true
    }
  } catch { 
    modalType.value = 'error'
    modalTitle.value = 'Erro no Envio'
    modalMessage.value = 'Erro ao enviar arquivos.'
    showModal.value = true
  }
  finally { uploading.value = false }
}



</script>
