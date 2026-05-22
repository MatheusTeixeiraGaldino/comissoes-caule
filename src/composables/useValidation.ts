import type { ValidationResult } from '@/types'

/**
 * Composable com funções de validação reutilizáveis.
 */
export function useValidation() {
  /** Valida se o campo está preenchido */
  function validateRequired(value: string, fieldName = 'Campo'): ValidationResult {
    const trimmed = value.trim()
    if (!trimmed) {
      return { isValid: false, errorMessage: `${fieldName} é obrigatório.` }
    }
    return { isValid: true, errorMessage: '' }
  }

  /** Valida formato de email */
  function validateEmail(email: string): ValidationResult {
    const required = validateRequired(email, 'Email')
    if (!required.isValid) return required

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return { isValid: false, errorMessage: 'Email inválido.' }
    }
    return { isValid: true, errorMessage: '' }
  }

  /** Valida senha (mínimo 6 caracteres) */
  function validatePassword(
    password: string,
    required = true
  ): ValidationResult {
    if (!required && !password) {
      return { isValid: true, errorMessage: '' }
    }

    const req = validateRequired(password, 'Senha')
    if (!req.isValid) return req

    if (password.length < 6) {
      return {
        isValid: false,
        errorMessage: 'Senha deve ter no mínimo 6 caracteres.',
      }
    }
    return { isValid: true, errorMessage: '' }
  }

  /** Valida nome (pelo menos 2 caracteres) */
  function validateName(name: string): ValidationResult {
    const required = validateRequired(name, 'Nome')
    if (!required.isValid) return required

    if (name.trim().length < 2) {
      return {
        isValid: false,
        errorMessage: 'Nome deve ter pelo menos 2 caracteres.',
      }
    }
    return { isValid: true, errorMessage: '' }
  }

  return {
    validateRequired,
    validateEmail,
    validatePassword,
    validateName,
  }
}
