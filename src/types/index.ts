/** Níveis de acesso do usuário */
export const UserLevel = {
  ADMIN: 1,
  OPERATOR: 2,
  VIEWER: 3,
} as const

export type UserLevel = (typeof UserLevel)[keyof typeof UserLevel]

/** Rótulos dos níveis para exibição */
export const UserLevelLabels: Record<UserLevel, string> = {
  [UserLevel.ADMIN]: 'Administrador',
  [UserLevel.OPERATOR]: 'Operador',
  [UserLevel.VIEWER]: 'Visualizador',
}

/** Modelo de Usuário */
export interface User {
  id: string | number
  email: string
  nome: string
  nivel: UserLevel
}

/** Dados para criação/edição de usuário (inclui senha) */
export interface UserFormData {
  email: string
  senha: string
  nome: string
  nivel: UserLevel
}

/** Payload enviado ao endpoint de login */
export interface LoginPayload {
  email: string
  senha: string
}

/** Resposta do endpoint de login */
export interface LoginResponse {
  token: string
  user: User
}

/** Resposta genérica da API */
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
}

/** Arquivo selecionado para upload */
export interface UploadFile {
  id: string
  file: File
  name: string
  size: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  extractedCpf?: string
  extractedDataInicio?: string
  extractedDataFim?: string
}

/** Definição de coluna para a tabela genérica */
export interface TableColumn {
  key: string
  label: string
  width?: string
  align?: 'left' | 'center' | 'right'
  /** Formatador personalizado para o valor da célula */
  formatter?: (value: unknown, row: Record<string, unknown>) => string
}

/** Definição de ação para a tabela genérica */
export interface TableAction {
  key: string
  label: string
  icon?: string
  variant?: 'primary' | 'danger' | 'warning'
}

/** Notificação toast */
export interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

/** Resultado de validação */
export interface ValidationResult {
  isValid: boolean
  errorMessage: string
}

/** Meta dados de rota para controle de acesso */
export interface RouteMeta {
  requiresAuth?: boolean
  requiredLevel?: UserLevel
  title?: string
}
