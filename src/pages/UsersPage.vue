export enum UserLevel {
  ADMIN = 1,
  OPERATOR = 2,
  VIEWER = 3,
}

export const UserLevelLabels: Record<UserLevel, string> = {
  [UserLevel.ADMIN]: 'Administrador',
  [UserLevel.OPERATOR]: 'Operador',
  [UserLevel.VIEWER]: 'Visualizador',
}

export interface User {

  id: string | number

  nome: string

  email: string

  senha?: string

  nivel: UserLevel
}

export interface UserFormData {

  nome: string

  email: string

  senha: string

  nivel: UserLevel
}

export interface ApiResponse<T> {

  success: boolean

  message: string

  data?: T
}

export interface TableColumn {

  key: string

  label: string

  align?: 'left' | 'center' | 'right'

  width?: string

  formatter?: (value: unknown) => string
}

export interface TableAction {

  key: string

  label: string

  icon?: string

  variant?: 'primary' | 'danger' | 'warning'
}
