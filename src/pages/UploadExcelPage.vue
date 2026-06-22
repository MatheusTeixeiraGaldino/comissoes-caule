<template>
  <div class="animate-fade-in">
    <div class="mb-6">
      <h1 class="text-2xl font-bold !text-black">Upload Excel</h1>
      <p class="text-sm !text-black mt-1">
        Selecione arquivos .xlsx ou .xls — o sistema converte e envia automaticamente
      </p>
    </div>

    <!-- Drop Zone -->
    <div
      class="glass-card p-8 mb-6 border-2 border-dashed transition-all duration-300 cursor-pointer text-center"
      :class="isDragging ? 'border-primary bg-primary/5' : 'border-glass hover:border-glass-hover'"
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
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center bg-surface !text-black">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-semibold !text-black">
            {{ isDragging ? 'Solte os arquivos aqui' : 'Arraste arquivos Excel ou clique para selecionar' }}
          </p>
          <p class="text-xs !text-black mt-1">
            Apenas .xlsx e .xls. Nome do arquivo: <span class="font-mono">ddmmaaaa_ddmmaaaa_CPF_NomeColaborador.xlsx</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Selected Files -->
    <div v-if="files.length > 0" class="glass-card p-0 overflow-hidden mb-6">
      <div class="px-5 py-4 flex items-center justify-between border-b border-glass">
        <h3 class="text-sm font-semibold !text-black">{{ files.length }} arquivo(s) selecionado(s)</h3>
        <button class="text-xs text-red-500 hover:text-red-600 font-medium transition-colors" @click="files = []">
          Remover todos
        </button>
      </div>
      <div class="overflow-auto">
        <table class="w-full">
          <thead>
            <tr>
              <th class="text-left p-4">Nome do Arquivo</th>
              <th class="text-left p-4">CPF</th>
              <th class="text-left p-4">Início</th>
              <th class="text-left p-4">Fim</th>
              <th class="text-left p-4">Status</th>
              <th class="text-right p-4">Tamanho</th>
              <th class="text-left p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in files" :key="item.id" class="hover:bg-[#fff7ed]">
              <td class="p-4 font-medium text-sm">{{ item.name }}</td>
              <td class="p-4 text-sm">
                <span v-if="item.cpf" class="text-green-700 font-mono">{{ item.cpf }}</span>
                <span v-else class="text-red-500 text-xs">-</span>
              </td>
              <td class="p-4 text-sm">{{ item.dataInicioDisplay || '-' }}</td>
              <td class="p-4 text-sm">{{ item.dataFimDisplay || '-' }}</td>
              <td class="p-4 text-sm">
                <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" :class="statusClass(item.status)">
                  <span v-if="item.status === 'converting' || item.status === 'uploading'"
                    class="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                  {{ statusLabel(item.status) }}
                </span>
              </td>
              <td class="p-4 text-sm text-right">{{ formatFileSize(item.size) }}</td>
              <td class="p-4">
                <button
                  class="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
                  :disabled="item.status === 'converting' || item.status === 'uploading'"
                  @click="removeFile(item.id)"
                >Remover</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Send Button -->
    <div v-if="files.length > 0" class="flex items-center justify-between">
      <p class="text-sm !text-black">Total: <span class="font-semibold">{{ totalSize }}</span></p>
      <button class="btn-primary" :disabled="uploading || files.length === 0" @click="handleUpload">
        <div v-if="uploading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />
        {{ uploading ? 'Processando...' : 'Converter e Enviar' }}
      </button>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="bg-white p-6 max-w-md w-full mx-4 border rounded-2xl flex flex-col">
        <h3 class="text-xl font-bold !text-black text-center mb-2">{{ modalTitle }}</h3>
        <div class="!text-black text-center mb-6 whitespace-pre-wrap text-sm">{{ modalMessage }}</div>
        <button class="w-full bg-gray-200 hover:bg-gray-300 !text-black font-medium rounded-lg px-4 py-3 transition-colors" @click="showModal = false">
          Fechar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { uploadFilesApi } from '@/services/api'
import { formatFileSize, extractDataFromFilename, formatDateForDisplay } from '@/utils/fileUtils'

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
  dataInicio?: string
  dataFim?: string
  dataInicioDisplay?: string
  dataFimDisplay?: string
  nomeColaborador?: string
  dataInicioRaw?: string
  dataFimRaw?: string
  status: FileStatus
  pdfBlob?: Blob
}

// -------------------------------------------------------
// State
// -------------------------------------------------------
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const uploading = ref(false)
const files = ref<ExcelFile[]>([])
const showModal = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')

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

// -------------------------------------------------------
// Conversão Excel → PDF (sem dependência de tipos)
// -------------------------------------------------------
async function convertExcelToPdf(file: File): Promise<Blob> {
  // @ts-ignore
  const XLSX = await import('xlsx')

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })

        let fullHtml = ''
        workbook.SheetNames.forEach((sheetName: string) => {
          const sheet = workbook.Sheets[sheetName]
          const sheetHtml = XLSX.utils.sheet_to_html(sheet)
          fullHtml += `<h2 style="font-family:Arial,sans-serif;margin:16px 0 8px;font-size:14px;color:#555;">${sheetName}</h2>${sheetHtml}`
        })

        const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<style>
  body{font-family:Arial,sans-serif;font-size:11px;margin:20px;color:#222}
  table{border-collapse:collapse;width:100%;margin-bottom:20px}
  th,td{border:1px solid #ccc;padding:6px 10px;text-align:left}
  th{background:#f0f0f0;font-weight:bold}
  h2{font-size:14px;color:#444;margin:16px 0 6px}
</style></head><body>${fullHtml}</body></html>`

        resolve(new Blob([html], { type: 'application/pdf' }))
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
  const excels = newFiles.filter(f => /\.(xlsx|xls)$/i.test(f.name))
  if (!excels.length) return

  excels.forEach(file => {
    // Usa a mesma função do Upload Automático para extrair dados do nome
    const extracted = extractDataFromFilename(file.name)

    files.value.push({
      id: Math.random().toString(36).slice(2),
      name: file.name,
      size: file.size,
      rawFile: file,
      cpf: extracted.cpf,
      dataInicio: extracted.dataInicio,
      dataFim: extracted.dataFim,
      dataInicioDisplay: extracted.dataInicio ? formatDateForDisplay(extracted.dataInicio) : undefined,
      dataFimDisplay: extracted.dataFim ? formatDateForDisplay(extracted.dataFim) : undefined,
      nomeColaborador: extracted.nomeColaborador,
      dataInicioRaw: extracted.dataInicioRaw,
      dataFimRaw: extracted.dataFimRaw,
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
  if (!files.value.length) return
  uploading.value = true

  for (const item of files.value) {
    if (item.status === 'success') continue
    item.status = 'converting'
    try {
      item.pdfBlob = await convertExcelToPdf(item.rawFile)
      item.status = 'ready'
    } catch {
      item.status = 'error'
    }
  }

  const readyFiles = files.value.filter(f => f.status === 'ready' && f.pdfBlob)

  if (!readyFiles.length) {
    uploading.value = false
    showModal.value = true
    modalTitle.value = 'Erro'
    modalMessage.value = 'Nenhum arquivo pôde ser convertido.'
    return
  }

  const filesForApi = readyFiles.map(item => {
    // Renomeia igual ao Upload Automático: Comissão_ddmmaaaa_a_ddmmaaaa_NomeColaborador.pdf
    let pdfName = item.name.replace(/\.(xlsx|xls)$/i, '.pdf')
    if (item.dataInicioRaw && item.dataFimRaw && item.nomeColaborador) {
      pdfName = `Comissão_${item.dataInicioRaw}_a_${item.dataFimRaw}_${item.nomeColaborador}.pdf`
    }

    return {
      file: new File([item.pdfBlob!], pdfName, { type: 'application/pdf' }),
      cpf: item.cpf,
      dataInicio: item.dataInicio,
      dataFim: item.dataFim,
      nomeColaborador: item.nomeColaborador,
      dataInicioRaw: item.dataInicioRaw,
      dataFimRaw: item.dataFimRaw,
    }
  })

  readyFiles.forEach(f => (f.status = 'uploading'))

  try {
    const r = await uploadFilesApi(filesForApi, '', '')
    readyFiles.forEach(f => (f.status = r.success ? 'success' : 'error'))
    showModal.value = true
    modalTitle.value = r.success ? 'Sucesso' : 'Erro'
    modalMessage.value = r.message || (r.success ? 'Enviado com sucesso.' : 'Erro ao enviar.')
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
