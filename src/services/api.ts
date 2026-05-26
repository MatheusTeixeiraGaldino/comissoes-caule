import type {
  ApiResponse,
  LoginPayload,
  LoginResponse,
  User,
  UserFormData,
} from '@/types'
import { UserLevel } from '@/types'
import axios from 'axios'
import { ref } from 'vue'

// ============================================================
// MOCK DATA — Remover quando o backend estiver disponível
// ============================================================

let mockUsers: (User & { senha: string })[] = [
  {
    id: '1',
    email: 'admin',
    senha: '123456',
    nome: 'Administrador',
    nivel: UserLevel.ADMIN,
  },
  {
    id: '2',
    email: 'supervisor',
    senha: '123456',
    nome: 'Supervisor',
    nivel: UserLevel.OPERATOR,
  },
  {
    id: '3',
    email: 'departamentopessoal@otaviolage.com',
    senha: '123456',
    nome: 'Matheus',
    nivel: UserLevel.OPERATOR,
  },
  {
    id: '4',
    email: 'juliano.modesto@otaviolage.com',
    senha: '101010Ab',
    nome: 'juliano',
    nivel: UserLevel.OPERATOR,
  },
]

let nextId = 4

/** Simula latência de rede */
function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ============================================================
// API Service (Mock) — Substituir por chamadas Axios reais
// ============================================================

/**
 * Autentica o usuário com email e senha.
 * Retorna token e dados do usuário.
 */
export async function loginApi(
  payload: LoginPayload
): Promise<ApiResponse<LoginResponse>> {
  await delay(600)

  const user = mockUsers.find(
    (u) => u.email === payload.email && u.senha === payload.senha
  )

  if (!user) {
    return {
      success: false,
      message: 'Email ou senha inválidos.',
    }
  }

  const { senha: _, ...userData } = user
  return {
    success: true,
    message: 'Login realizado com sucesso.',
    data: {
      token: `mock-jwt-token-${user.id}-${Date.now()}`,
      user: userData,
    },
  }
}

/**
 * Retorna a lista de todos os usuários cadastrados.
 */
export async function getUsersApi(): Promise<ApiResponse<User[]>> {
  await delay(300)

  const users: User[] = mockUsers.map(({ senha: _, ...u }) => u)
  return {
    success: true,
    message: 'Usuários carregados.',
    data: users,
  }
}

/**
 * Cria um novo usuário.
 */
export async function createUserApi(
  data: UserFormData
): Promise<ApiResponse<User>> {
  await delay(400)

  // Verificar email duplicado
  if (mockUsers.some((u) => u.email === data.email)) {
    return {
      success: false,
      message: 'Já existe um usuário com este email.',
    }
  }

  const newUser = {
    id: String(nextId++),
    email: data.email,
    senha: data.senha,
    nome: data.nome,
    nivel: data.nivel,
  }

  mockUsers.push(newUser)

  const { senha: _, ...userData } = newUser
  return {
    success: true,
    message: 'Usuário criado com sucesso.',
    data: userData,
  }
}

/**
 * Atualiza um usuário existente.
 */
export async function updateUserApi(
  id: string,
  data: UserFormData
): Promise<ApiResponse<User>> {
  await delay(400)

  const index = mockUsers.findIndex((u) => u.id === id)
  if (index === -1) {
    return {
      success: false,
      message: 'Usuário não encontrado.',
    }
  }

  // Verificar email duplicado (excluindo o próprio)
  if (mockUsers.some((u) => u.email === data.email && u.id !== id)) {
    return {
      success: false,
      message: 'Já existe outro usuário com este email.',
    }
  }

  mockUsers[index] = {
    ...mockUsers[index],
    email: data.email,
    nome: data.nome,
    nivel: data.nivel,
    ...(data.senha ? { senha: data.senha } : {}),
  }

  const { senha: _, ...userData } = mockUsers[index]
  return {
    success: true,
    message: 'Usuário atualizado com sucesso.',
    data: userData,
  }
}

/**
 * Exclui um usuário pelo ID.
 */
export async function deleteUserApi(id: string): Promise<ApiResponse> {
  await delay(300)

  const index = mockUsers.findIndex((u) => u.id === id)
  if (index === -1) {
    return {
      success: false,
      message: 'Usuário não encontrado.',
    }
  }

  mockUsers = mockUsers.filter((u) => u.id !== id)
  return {
    success: true,
    message: 'Usuário excluído com sucesso.',
  }
}

const url = ref("https://otaviolage.caule.app/api/v1/comissao")
//Token fornecido pela Nano
const bearerToken = ref("Bearer 1|8uew7ctJIMHPE9Dy6vq7SYyz7yxZqKMPUEfN7yMk")

/**
 * Faz upload de arquivos PDF para o servidor.
 * Rastreia erros específicos de cada arquivo e retorna mensagem detalhada.
 */
export interface FileWithMetadata {
  file: File;
  cpf?: string;
  dataInicio?: string;
  dataFim?: string;
}

export async function uploadFilesApi(
  files: FileWithMetadata[],
  globalDataInicio: string,
  globalDataFim: string,
): Promise<ApiResponse> {

  await delay(1500)

  // Rastrear arquivos bem-sucedidos e com erro
  const successFiles: string[] = []
  const errorFiles: Array<{ name: string; error: string }> = []

  for (const item of files) {
    const { file, cpf, dataInicio, dataFim } = item
    const formData = new FormData()

    // Prioriza o CPF extraído do nome, se não houver, usa o nome do arquivo (fallback)
    const identificador = cpf || file.name

    // Prioriza as datas extraídas do nome, se não houver, usa as globais do formulário
    const dInicio = dataInicio || globalDataInicio
    const dFim = dataFim || globalDataFim

    formData.append(
      'tipo',
      'colaborador'
    );

    formData.append(
      'identificador',
      identificador
    );

    formData.append(
      'data_periodo_inicio',
      dInicio
    );

    formData.append(
      'data_periodo_fim',
      dFim
    );

    formData.append(
      'arquivo',
      file
    );

    try {
      const response = await axios.post(url.value, formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': bearerToken.value },
      })
      successFiles.push(file.name)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro desconhecido'
      errorFiles.push({ name: file.name, error: errorMessage })
    }
  }

  // Construir mensagem de resposta detalhada
  if (errorFiles.length === 0) {
    // Todos os arquivos foram enviados com sucesso
    return {
      success: true,
      message: `${successFiles.length} arquivo(s) enviado(s) com sucesso.`,
      data: { successFiles },
    }
  } else if (successFiles.length === 0) {
    // Todos os arquivos falharam
    const errorList = errorFiles.map((f) => `• ${f.name}: ${f.error}`).join('\n')
    return {
      success: false,
      message: `Erro ao enviar arquivos:\n${errorList}`,
      data: { errorFiles },
    }
  } else {
    // Alguns arquivos foram enviados, outros falharam
    const errorList = errorFiles.map((f) => `• ${f.name}: ${f.error}`).join('\n')
    return {
      success: false,
      message: `${successFiles.length} arquivo(s) enviado(s) com sucesso.\n\nErro ao enviar:\n${errorList}`,
      data: { successFiles, errorFiles },
    }
  }

  /*
  try {
    const response = await axios.post(url.value, formData, {
      headers: { 'Content-Type': 'multipart/form-data', 'Authorization': bearerToken.value },
    })
    return {
      success: true,
      message: response.data.message || 'Upload concluído.',
      data: response.data,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Erro ao enviar arquivos.',
    }
  }
    */



}
