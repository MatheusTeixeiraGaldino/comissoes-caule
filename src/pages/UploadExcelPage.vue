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
            Apenas .xlsx e .xls. Nome: <span class="font-mono">ddmmaaaa_ddmmaaaa_CPF_NomeColaborador.xlsx</span>
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
      <button class="btn-primary" :disabled="uploading" @click="handleUpload">
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

function statusLabel(s: FileStatus): string {
  const map: Record<FileStatus, string> = {
    pending: 'Aguardando', converting: 'Convertendo…', ready: 'Pronto',
    uploading: 'Enviando…', success: 'Enviado', error: 'Erro',
  }
  return map[s]
}

function statusClass(s: FileStatus): string {
  const map: Record<FileStatus, string> = {
    pending: 'bg-gray-100 text-gray-600', converting: 'bg-yellow-100 text-yellow-700',
    ready: 'bg-blue-100 text-blue-700', uploading: 'bg-yellow-100 text-yellow-700',
    success: 'bg-green-100 text-green-700', error: 'bg-red-100 text-red-700',
  }
  return map[s]
}

// -------------------------------------------------------
// Gera um PDF binário real a partir do HTML da planilha
// usando jsPDF via CDN (sem instalar nada no projeto)
// -------------------------------------------------------
async function convertExcelToPdf(file: File): Promise<Blob> {
  // @ts-ignore
  const XLSX = await import('xlsx')

  // Lê o arquivo e converte para HTML
  const arrayBuffer = await file.arrayBuffer()
  const data = new Uint8Array(arrayBuffer)
  const workbook = XLSX.read(data, { type: 'array' })

  let rows: string[][] = []

  workbook.SheetNames.forEach((sheetName: string) => {
    const sheet = workbook.Sheets[sheetName]
    // Converte para array de arrays (mais fácil de renderizar no canvas)
    const sheetData: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
    rows = rows.concat(sheetData)
  })

  // Gera PDF usando canvas + estrutura binária real
  return buildPdfFromRows(rows, file.name)
}

// -------------------------------------------------------
// Constrói um PDF real usando canvas para rasterizar
// cada linha da planilha e empacotar como PDF válido
// -------------------------------------------------------
function buildPdfFromRows(rows: string[][], filename: string): Blob {
  // Dimensões A4 em pontos (1 ponto = 1/72 polegada)
  const PAGE_WIDTH = 595
  const PAGE_HEIGHT = 842
  const MARGIN = 30
  const LINE_HEIGHT = 14
  const FONT_SIZE = 9
  const COL_WIDTH = 80

  // Renderiza todas as linhas em um canvas
  const canvas = document.createElement('canvas')
  // Escala 2x para melhor qualidade
  const scale = 2
  canvas.width = PAGE_WIDTH * scale
  canvas.height = PAGE_HEIGHT * scale

  const ctx = canvas.getContext('2d')!
  ctx.scale(scale, scale)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)
  ctx.fillStyle = '#000000'
  ctx.font = `${FONT_SIZE}px Arial`

  let y = MARGIN + LINE_HEIGHT

  rows.forEach((row, rowIdx) => {
    if (!Array.isArray(row)) return
    const isHeader = rowIdx === 0

    if (isHeader) {
      ctx.fillStyle = '#f0f0f0'
      ctx.fillRect(MARGIN, y - LINE_HEIGHT + 2, PAGE_WIDTH - MARGIN * 2, LINE_HEIGHT)
      ctx.fillStyle = '#000000'
      ctx.font = `bold ${FONT_SIZE}px Arial`
    } else {
      ctx.font = `${FONT_SIZE}px Arial`
    }

    row.forEach((cell, colIdx) => {
      const x = MARGIN + colIdx * COL_WIDTH
      if (x + COL_WIDTH > PAGE_WIDTH - MARGIN) return
      const text = String(cell ?? '').substring(0, 12)
      ctx.fillText(text, x, y)
    })

    // Linha divisória
    ctx.strokeStyle = '#dddddd'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(MARGIN, y + 3)
    ctx.lineTo(PAGE_WIDTH - MARGIN, y + 3)
    ctx.stroke()

    y += LINE_HEIGHT

    // Se ultrapassar a página, para (simplificado — página única)
    if (y > PAGE_HEIGHT - MARGIN) return
  })

  // Converte canvas para JPEG base64
  const imgData = canvas.toDataURL('image/jpeg', 0.92)
  const base64 = imgData.split(',')[1]

  // Monta PDF com a imagem embutida (PDF/Image válido)
  return buildPdfWithImage(base64, PAGE_WIDTH, PAGE_HEIGHT)
}

// -------------------------------------------------------
// Monta a estrutura binária de um PDF 1.4 com uma imagem JPEG
// -------------------------------------------------------
function buildPdfWithImage(jpegBase64: string, width: number, height: number): Blob {
  const imgBytes = Uint8Array.from(atob(jpegBase64), c => c.charCodeAt(0))
  const imgLen = imgBytes.length

  // Objetos PDF
  const catalog    = `1 0 obj\n<</Type /Catalog /Pages 2 0 R>>\nendobj\n`
  const pages      = `2 0 obj\n<</Type /Pages /Kids [3 0 R] /Count 1>>\nendobj\n`
  const page       = `3 0 obj\n<</Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Contents 4 0 R /Resources <</XObject <</Img 5 0 R>>>>>>\nendobj\n`
  const streamBody = `q ${width} 0 0 ${height} 0 0 cm /Img Do Q`
  const content    = `4 0 obj\n<</Length ${streamBody.length}>>\nstream\n${streamBody}\nendstream\nendobj\n`

  // Cabeçalho PDF
  const header = `%PDF-1.4\n%\xFF\xFF\xFF\xFF\n`

  // Monta parte textual
  const textPart = header + catalog + pages + page + content

  // Objeto da imagem JPEG (objeto 5) — parte textual antes do stream
  const imgHeader = `5 0 obj\n<</Type /XObject /Subtype /Image /Width ${width * 2} /Height ${height * 2} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgLen}>>\nstream\n`
  const imgFooter = `\nendstream\nendobj\n`

  // Calcula offsets para xref
  const enc = new TextEncoder()
  const textBytes  = enc.encode(textPart)
  const imgHBytes  = enc.encode(imgHeader)
  const imgFBytes  = enc.encode(imgFooter)

  // Offsets dos objetos
  const off1 = header.length
  const off2 = off1 + catalog.length
  const off3 = off2 + pages.length
  const off4 = off3 + page.length
  const off5 = off4 + content.length
  const off6 = off5 // objeto 5 começa aqui na parte de bytes

  // xref + trailer
  const bodyLen = textBytes.length + imgHBytes.length + imgLen + imgFBytes.length

  const xrefOffset = bodyLen
  const xref = `xref\n0 6\n0000000000 65535 f \n${String(off1).padStart(10,'0')} 00000 n \n${String(off2).padStart(10,'0')} 00000 n \n${String(off3).padStart(10,'0')} 00000 n \n${String(off4).padStart(10,'0')} 00000 n \n${String(off5).padStart(10,'0')} 00000 n \n`
  const trailer = `trailer\n<</Size 6 /Root 1 0 R>>\nstartxref\n${xrefOffset}\n%%EOF`

  const xrefBytes    = enc.encode(xref + trailer)

  // Junta tudo em um único Uint8Array
  const total = new Uint8Array(textBytes.length + imgHBytes.length + imgLen + imgFBytes.length + xrefBytes.length)
  let offset = 0
  total.set(textBytes,  offset); offset += textBytes.length
  total.set(imgHBytes,  offset); offset += imgHBytes.length
  total.set(imgBytes,   offset); offset += imgLen
  total.set(imgFBytes,  offset); offset += imgFBytes.length
  total.set(xrefBytes,  offset)

  return new Blob([total], { type: 'application/pdf' })
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
