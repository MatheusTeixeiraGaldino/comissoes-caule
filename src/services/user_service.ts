import { apiCaule } from './apiCaule'
import { localUsers } from '@/mock/users'

export async function getLogin(login: string, senha: string) {

  // =========================================
  // TENTA LOGIN LOCAL PRIMEIRO
  // =========================================

  const localUser = localUsers.find(
    (u) => u.login === login && u.senha === senha
  )

  if (localUser) {
    return localUser
  }

  // =========================================
  // SE NÃO ENCONTRAR LOCAL
  // TENTA API EXTERNA
  // =========================================

  try {

    const pass = btoa(
      '@vlog@' + login + ':@vpass@' + senha
    )

    const response = await apiCaule.get(
      '/usuario/login/' + pass
    )

    return response.data

  } catch (error) {

    console.error('Erro API externa:', error)

    throw new Error(
      'Usuário não encontrado localmente e API indisponível'
    )
  }
}
