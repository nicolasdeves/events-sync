import axios from 'axios'
import { authApi } from './axios.service'
import { getToken, refreshToken, logout } from './authentication.service'
import { Event } from '../components/EventsPage'

const EVENTS_PORT = 8000
const URL = (import.meta as any).env.VITE_API_URL || 'http://localhost'

export const eventsApi = axios.create({
  baseURL: `${URL}:${EVENTS_PORT}`,
  withCredentials: true,
})

eventsApi.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  failedQueue = []
}

eventsApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any & { _retry?: boolean }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return eventsApi(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const newToken = await refreshToken()
        
        if (newToken) {
          processQueue(null, newToken)
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          
          isRefreshing = false
          return eventsApi(originalRequest)
        } else {
          processQueue(new Error('Não foi possível renovar o token'), null)
          isRefreshing = false
          
          // Fazer logout completo quando o refresh token falhar
          logout()
          
          return Promise.reject(error)
        }
      } catch (refreshError) {
        processQueue(refreshError, null)
        isRefreshing = false
        
        // Fazer logout completo quando o refresh token falhar
        logout()
        
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export async function listEvents(
  params?: Record<string, any>
): Promise<Event[]> {
  try {
    const res = await eventsApi.get<Event[]>('/events', { params })
    return res.data
  } catch (err: any) {
    if (err.status == 401) {
      logout()
    }
    return []
  }
}

export async function listMyEvents(
  params?: Record<string, any>
): Promise<MyEvent[]> {
  try {
    const res = await eventsApi.get<MyEvent[]>('/events/my', { params })
    return res.data
  } catch (err) {
    console.error('Erro ao buscar meus eventos:', err)
    throw err
  }
}


export async function getEvent(id: string) {
  const res = await eventsApi.get(`/api/events/${id}`).catch(() => eventsApi.get(`/events/${id}`))
  return res.data
}

export async function register(eventId: number) {
  try {
    const res = await eventsApi.post(`/registrations`, { eventId })
    return res.data
  } catch (err) {
    console.log(err)
  }
}

export interface Registration {
  id: number
  user: string
  status: number 
  event_id: number
  created_at: string
  updated_at: string
  user_id: number
  user_name: string
  user_email: string
  googleId: string
}

export interface AdminEvent {
  id: number
  uuid: string
  code: string
  name: string
  date: string
  capacity: number
  place_id: number
  event_type_id: number
  created_at: string
  updated_at: string
  registrations: Registration[]
}

export interface MyEvent {
  id: number
  uuid: string
  code: string
  name: string
  date: string
  capacity: number
  place_id: number
  event_type_id: number
  created_at: string
  updated_at: string
  status: number // 0 = pendente, 1 = confirmado
  certificate?: string | null // UUID do certificado
}

/**
 * Busca eventos para a página de admin
 */
export async function getAdminEvents(): Promise<AdminEvent[]> {
  try {
    const res = await eventsApi.get<AdminEvent[]>('/events/admin')
    return res.data
  } catch (err) {
    console.error('Erro ao buscar eventos admin:', err)
    throw err
  }
}

/**
 * Valida um usuário em um evento (atualiza o status da registration para 1)
 */
export async function validateUser(registrationId: number): Promise<any> {
  try {
    const res = await eventsApi.put(`/registrations/${registrationId}/confirm`)
    return res.data
  } catch (err) {
    console.error('Erro ao validar usuário:', err)
    throw err
  }
}

/**
 * Cadastra um novo usuário rapidamente
 */
export async function createQuickUser(userData: {
  name: string
  email: string
}): Promise<any> {
  try {
    const res = await authApi.post('/auth/quick-register', userData)
    return res.data
  } catch (err) {
    console.error('Erro ao cadastrar usuário:', err)
    throw err
  }
}

/**
 * Registra um usuário em um evento
 */
export async function registerUserToEvent(eventId: number, userId: number): Promise<any> {
  try {
    const res = await eventsApi.post(`/registrations/event/${eventId}/register-user`, { userId })
    return res.data
  } catch (err) {
    console.error('Erro ao registrar usuário no evento:', err)
    throw err
  }
}

/**
 * Cancela a participação de um usuário em um evento
 */
export async function cancelRegistration(eventId: number): Promise<any> {
  try {
    const res = await eventsApi.delete(`/registrations/event/${eventId}/cancel`)
    return res.data
  } catch (err) {
    console.error('Erro ao cancelar participação:', err)
    throw err
  }
}

/**
 * Gera/emite certificado para um evento
 */
export async function downloadCertificate(certificateCode: string): Promise<void> {
  try {
    // Abre a URL do certificado em nova aba para download
    window.open(`http://nicolas-deves.duckdns.org:8001/baixar-certificado/${certificateCode}`, '_blank')
  } catch (err) {
    console.error('Erro ao baixar certificado:', err)
    throw err
  }
}

/**
 * Valida um certificado
 */
export async function validateCertificate(certificateCode: string): Promise<any> {
  try {
    const res = await fetch(`http://nicolas-deves.duckdns.org:8001/validar-certificado/${certificateCode}`)
    if (!res.ok) {
      throw new Error('Certificado inválido')
    }

    return await res.json()
  } catch (err) {
    console.error('Erro ao validar certificado:', err)
    throw err
  }
}
