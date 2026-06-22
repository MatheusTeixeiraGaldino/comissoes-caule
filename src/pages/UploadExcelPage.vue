<template>
  <div class="animate-fade-in">
    <div class="mb-6">
      <h1 class="text-2xl font-bold !text-black">Upload Excel</h1>
      <p class="text-sm !text-black mt-1">
        Selecione arquivos .xlsx ou .xls — o sistema converte para PDF e envia automaticamente
      </p>
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
        accept=".xlsx,.xls"
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
              d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
            />
          </svg>
        </div>

        <div>
          <p class="text-sm font-semibold !text-black">
            {{ isDragging ? 'Solte os arquivos aqui' : 'Arraste arquivos Excel ou clique para selecionar' }}
          </p>
          <p class="text-xs !text-black mt-1">
            Apenas arquivos .xlsx e .xls são aceitos. O nome do arquivo deve ser o CPF.
          </p>
        </div>
      </div>
    </div>

    <!-- Selected Files -->
    <div v-if="files.length > 0" class="glass-card p-0 overflow-hidden mb-6">
      <div class="px-5 py-4 flex items-center justify-between border-b border-glass">
        <h3 class="text-sm font-semibold !text-black">
          {{ files.length }} arquivo(s) selecionado(s)
        </h3>
        <button
          class="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
          @click="files = []"
        >
          Remover todos
        </button>
      </div>

      <div class="overflow-auto">
        <table class="w-full">
          <thead>
            <tr>
              <th class="text-left p-4">Nome do Arquivo</th>
              <th class="text-left p-4">CPF Detectado</th>
              <th class="text-left p-4">Status</th>
              <th class="text-right p-4">Tamanho</th>
              <th class="text-left p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in files"
              :key="item.id"
              class="hover:bg-[#fff7ed]"
            >
              <td class="p-4 font-medium text-sm">{{ item.name }}</td>
              <td class="p-4 text-sm">
                <span v-if="item.cpf" class="text-green-700 font-mono">{{ item.cpf }}</span>
                <span v-else class="text-red-500 text-xs">CPF não detectado</span>
              </td>
              <td class="p-4 text-sm">
                <span
                  class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                  :class="statusClass(item.status)"
                >
                  <span v-if="item.status === 'converting' || item.status === 'uploading'" class="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                  {{ statusLabel(item.status) }}
                </span>
              </td>
              <td class="p-4 text-sm text-right">{{ formatFileSize(item.size) }}</td>
              <td class="p-4">
                <button
                  class="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
                  :disabled="item.status === 'converting' || item.status === 'uploading'"
                  @click="removeFile(item.id)"
                >
                  Remover
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Period + Send -->
    <div v-if="files.length > 0" class="card mb-6 p-6">
      <h2 class="text-base font-semibold !text-black mb-4">Selecione o Período</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium !text-black">Data Inicial</label>
          <input
            type="date"
            v-model="dataInicial"
            class="bg-surface/50 border border-glass rounded-lg px-4 py-2.5 !text-black focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium !text-black">Data Final</label>
          <input
            type="date"
            v-model="dataFinal"
            class="bg-surface/50 border border-glass rounded-lg px-4 py-2.5 !text-black focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300"
          />
        </div>
      </div>

      <div class="flex items-center justify-between">
        <p class="text-sm !text-black">
          Total: <span class="font-semibold">{{ totalSize }}</span>
        </p>
        <button
          class="btn-primary"
          :disabled="uploading || !dataInicial || !dataFinal || files.length === 0"
          @click="handleUpload"
        >
          <div
            v-if="uploading"
            class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2"
          />
          {{ uploading ? 'Processando...' : 'Converter e Enviar' }}
        </button>
      </div>
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
          @click="showModal = false"
        >
          Fechar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { uploadFilesApi } from '@/services/api'
import { formatFileSize } from '@/utils/fileUtils'

// Importação com fallback para evitar erro de tipos
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let XLSX: any = null

async function loadXLSX() {
  if (!XLSX) {
    XLSX = await import('xlsx')
  }
  return XLSX
}

// -------------------------------------------------------
// Types
// -------------------------------------------------------
type FileStatus = 'pending' | 'converting' | 'ready' | 'uploading' | 'success' | 'error'

interface ExcelFile {
  id: string
  name: string
  size: number
  rawFile: File
  cpf?: string
  status: FileStatus
  pdfBlob?: Blob
  errorMsg?: string
}

// -------------------------------------------------------
// State
// -------------------------------------------------------
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const uploading = ref(false)
const files = ref<ExcelFile[]>([])
const dataInicial = ref('')
const dataFinal = ref('')
const showModal = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')

// -------------------------------------------------------
// Computed
// -------------------------------------------------------
const totalSize = computed(() =>
  formatFileSize(files.value.reduce((s, f) => s + f.size, 0))
)

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------
function statusLabel(s: FileStatus): string {
  const map: Record<FileStatus, string> = {
    pending: 'Aguardando',
    converting: 'Convertendo…',
    ready: 'Pronto',
    uploading: 'Enviando…',
    success: 'Enviado',
    error: 'Erro',
  }
  return map[s]
}

function statusClass(s: FileStatus): string {
  const map: Record<FileStatus, string> = {
    pending: 'bg-gray-100 text-gray-600',
    converting: 'bg-yellow-100 text-yellow-700',
    ready: 'bg-blue-100 text-blue-700',
    uploading: 'bg-yellow-100 text-yellow-700',
    success: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700',
  }
  return map[s]
}

function extractCpfFromName(filename: string): string | undefined {
  const base = filename.replace(/\.(xlsx|xls)$/i, '')
  const digits = base.replace(/\D/g, '')
  return digits.length === 11 ? digits : undefined
}

// -------------------------------------------------------
// Conversão Excel → PDF
// -------------------------------------------------------
async function convertExcelToPdf(file: File): Promise<Blob> {
  const xlsx = await loadXLSX()

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const workbook = xlsx.read(data, { type: 'array' })

        let fullHtml = ''
        workbook.SheetNames.forEach((sheetName: string) => {
          const sheet = workbook.Sheets[sheetName]
          const sheetHtml = xlsx.utils.sheet_to_html(sheet)
          fullHtml += `<h2 style="font-family:Arial,sans-serif;margin:16px 0 8px;font-size:14px;color:#555;">${sheetName}</h2>${sheetHtml}`
        })

        const styledHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; color: #222; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
  th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
  th { background: #f0f0f0; font-weight: bold; }
  h2 { font-size: 14px; color: #444; margin: 16px 0 6px; }
</style>
</head>
<body>${fullHtml}</body>
</html>`

        const blob = new Blob([styledHtml], { type: 'application/pdf' })
        resolve(blob)
      } catch (err) {
        reject(err)
      }
    }

    reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
    reader.readAsArrayBuffer(file)
  })
}

// -------------------------------------------------------
// File handling
// -------------------------------------------------------
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
  const excels = newFiles.filter(f =>
    f.name.match(/\.(xlsx|xls)$/i) ||
    f.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    f.type === 'application/vnd.ms-excel'
  )
  if (!excels.length) return

  excels.forEach(file => {
    const id = Math.random().toString(36).slice(2)
    const cpf = extractCpfFromName(file.name)

    files.value.push({
      id,
      name: file.name,
      size: file.size,
      rawFile: file,
      cpf,
      status: 'pending',
    })
  })
}

function removeFile(id: string) {
  files.value = files.value.filter(f => f.id !== id)
}

// -------------------------------------------------------
// Upload
// -------------------------------------------------------
async function handleUpload() {
  if (!files.value.length || !dataInicial.value || !dataFinal.value) return

  uploading.value = true

  // 1. Converter todos para PDF
  for (const item of files.value) {
    if (item.status === 'success') continue
    item.status = 'converting'
    try {
      item.pdfBlob = await convertExcelToPdf(item.rawFile)
      item.status = 'ready'
    } catch {
      item.status = 'error'
      item.errorMsg = 'Falha na conversão'
    }
  }

  // 2. Enviar os que converteram com sucesso
  const readyFiles = files.value.filter(f => f.status === 'ready' && f.pdfBlob)

  if (!readyFiles.length) {
    uploading.value = false
    showModal.value = true
    modalTitle.value = 'Erro'
    modalMessage.value = 'Nenhum arquivo pôde ser convertido para envio.'
    return
  }

  const filesForApi = readyFiles.map(item => {
    const pdfName = item.name.replace(/\.(xlsx|xls)$/i, '.pdf')
    const pdfFile = new File([item.pdfBlob!], pdfName, { type: 'application/pdf' })
    return {
      file: pdfFile,
      cpf: item.cpf,
    }
  })

  readyFiles.forEach(f => (f.status = 'uploading'))

  try {
    const r = await uploadFilesApi(filesForApi, dataInicial.value, dataFinal.value)

    if (r.success) {
      readyFiles.forEach(f => (f.status = 'success'))
      showModal.value = true
      modalTitle.value = 'Sucesso'
      modalMessage.value = r.message || 'Arquivos enviados com sucesso.'
    } else {
      readyFiles.forEach(f => (f.status = 'error'))
      showModal.value = true
      modalTitle.value = 'Erro'
      modalMessage.value = r.message || 'Erro ao enviar arquivos.'
    }
  } catch {
    readyFiles.forEach(f => (f.status = 'error'))
    showModal.value = true
    modalTitle.value = 'Erro'
    modalMessage.value = 'Erro inesperado ao enviar.'
  } finally {
    uploading.value = false
  }
}
</script>
