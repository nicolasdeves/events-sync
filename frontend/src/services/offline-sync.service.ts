/**
 * Serviço de sincronização offline
 * Gerencia operações pendentes quando não há conexão com a internet
 */

export interface PendingOperation {
  id: string
  type: 'validate_user' | 'register_user' | 'register_user_to_event'
  data: any
  timestamp: number
  retries: number
}

const STORAGE_KEY = 'offline_pending_operations'
const MAX_RETRIES = 3

/**
 * Verifica se está online
 */
export function isOnline(): boolean {
  return navigator.onLine
}

/**
 * Salva uma operação pendente no localStorage
 */
export function savePendingOperation(operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retries'>): string {
  const operations = getPendingOperations()
  const id = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const newOperation: PendingOperation = {
    id,
    timestamp: Date.now(),
    retries: 0,
    ...operation
  }
  
  operations.push(newOperation)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(operations))
  
  return id
}

/**
 * Obtém todas as operações pendentes
 */
export function getPendingOperations(): PendingOperation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Erro ao ler operações pendentes:', error)
    return []
  }
}

/**
 * Remove uma operação pendente após sucesso
 */
export function removePendingOperation(operationId: string): void {
  const operations = getPendingOperations()
  const filtered = operations.filter(op => op.id !== operationId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

/**
 * Incrementa o número de tentativas de uma operação
 */
export function incrementRetry(operationId: string): void {
  const operations = getPendingOperations()
  const updated = operations.map(op => {
    if (op.id === operationId) {
      return { ...op, retries: op.retries + 1 }
    }
    return op
  })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

/**
 * Remove operações que excederam o número máximo de tentativas
 */
export function removeFailedOperations(): void {
  const operations = getPendingOperations()
  const filtered = operations.filter(op => op.retries < MAX_RETRIES)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

/**
 * Limpa todas as operações pendentes (útil para testes ou reset)
 */
export function clearPendingOperations(): void {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Obtém o número de operações pendentes
 */
export function getPendingOperationsCount(): number {
  return getPendingOperations().length
}

/**
 * Listener para eventos de conexão online/offline
 */
export function setupOnlineListener(callback: (isOnline: boolean) => void): () => void {
  const handleOnline = () => callback(true)
  const handleOffline = () => callback(false)
  
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  
  // Retorna função para remover listeners
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}

