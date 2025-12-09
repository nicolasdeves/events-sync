import axios from 'axios'

// Certification microservice (FastAPI) - dev port assumption: 8000
const CERT_PORT = 8000
const URL = (import.meta as any).env.URL || 'localhost'

export const certApi = axios.create({
  baseURL: `${URL}:${CERT_PORT}`,
  withCredentials: false,
})

export async function generateCertificate(name: string) {
  const res = await certApi.post(`/gerar-certificado/${encodeURIComponent(name)}`)
  return res.data
}

export async function downloadCertificate(uuid: string) {
  const res = await certApi.get(`/baixar-certificado/${encodeURIComponent(uuid)}`, {
    responseType: 'blob'
  })

  return res.data
}

export async function validateCertificate(uuid: string) {
  const res = await certApi.get(`/validar-certificado/${encodeURIComponent(uuid)}`)
  return res.data
}

export default {
  generateCertificate,
  downloadCertificate,
  validateCertificate,
}
