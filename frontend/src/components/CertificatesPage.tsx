import { useState, useEffect } from 'react'
import { useApp } from '../contexts/AppContext'
import { listMyEvents, cancelRegistration, downloadCertificate, validateCertificate, MyEvent } from '../services/events.service'

function CertificatesPage() {
  const { t, language } = useApp()
  const [events, setEvents] = useState<MyEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [certificateId, setCertificateId] = useState('')
  const [validatedCertificate, setValidatedCertificate] = useState<{
    holderName: string
    event: string
    issueDate: string
    isValid: boolean
  } | null>(null)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const data = await listMyEvents()
      setEvents(data)
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (eventId: number) => {
    if (!confirm('Tem certeza que deseja cancelar sua participação neste evento?')) {
      return
    }

    try {
      await cancelRegistration(eventId)
      await loadEvents()
    } catch (error) {
      console.error('Erro ao cancelar participação:', error)
      alert('Erro ao cancelar participação. Tente novamente.')
    }
  }

  const handleDownloadCertificate = async (certificateCode: string | null | undefined) => {
    if (!certificateCode) {
      alert('Certificado ainda não foi gerado para este evento.')
      return
    }

    try {
      await downloadCertificate(certificateCode)
    } catch (error) {
      console.error('Erro ao baixar certificado:', error)
      alert('Erro ao baixar certificado. Tente novamente.')
    }
  }

  const handleValidate = async () => {
    if (!certificateId.trim()) {
      alert('Por favor, insira o código do certificado.')
      return
    }

    try {
      const response = await validateCertificate(certificateId.trim())
      const isValid = response.valido === true
      
      setValidatedCertificate({
        holderName: response.nome || 'N/A',
        event: response.evento || 'N/A',
        issueDate: response.data_criacao || 'N/A',
        isValid
      })
    } catch (error) {
      console.error('Erro ao validar certificado:', error)
      setValidatedCertificate({
        holderName: 'N/A',
        event: 'N/A',
        issueDate: 'N/A',
        isValid: false
      })
    }
  }

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pendingEvents = filteredEvents.filter(e => e.status === 0)
  const confirmedEvents = filteredEvents.filter(e => e.status === 1)

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Carregando eventos...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">{t('certificates.title')}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Seção de Eventos */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Minhas Inscrições</h2>
            
            {/* Barra de busca */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar por nome ou código do evento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Eventos Pendentes (Status 0) */}
            {pendingEvents.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-yellow-400 mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  Pendentes ({pendingEvents.length})
                </h3>
                <div className="space-y-3">
                  {pendingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">{event.name}</h3>
                          <p className="text-gray-400 text-sm mb-1">
                            {new Date(event.date).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US')}
                          </p>
                          <p className="text-gray-500 text-xs">Código: {event.code}</p>
                        </div>
                        <button
                          onClick={() => handleCancel(event.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm whitespace-nowrap"
                        >
                          Cancelar Participação
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Eventos Confirmados (Status 1) */}
            {confirmedEvents.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-green-400 mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Confirmados ({confirmedEvents.length})
                </h3>
                <div className="space-y-3">
                  {confirmedEvents.map((event) => (
                    <div
                      key={event.id}
                      className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">{event.name}</h3>
                          <p className="text-gray-400 text-sm mb-1">
                            {new Date(event.date).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US')}
                          </p>
                          <p className="text-gray-500 text-xs">Código: {event.code}</p>
                        </div>
                        <button
                          onClick={() => handleDownloadCertificate(event.certificate)}
                          disabled={!event.certificate}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {event.certificate ? 'Baixar Certificado' : 'Certificado não disponível'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredEvents.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                {searchTerm ? 'Nenhum evento encontrado com essa busca.' : 'Você não possui inscrições em eventos.'}
              </div>
            )}
          </div>
        </div>

        {/* Seção de Validação (Menor) */}
        <div>
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-white mb-3">{t('certificates.validate.title')}</h2>
            <p className="text-gray-400 text-xs mb-4">
              {t('certificates.validate.description')}
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  {t('certificates.validate.id')}
                </label>
                <input
                  type="text"
                  placeholder={t('certificates.validate.id.placeholder')}
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <button
                onClick={handleValidate}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {t('certificates.validate.button')}
              </button>

              {validatedCertificate && (
                <div className={`mt-4 p-3 rounded-lg border ${
                  validatedCertificate.isValid 
                    ? 'bg-green-900/30 border-green-700' 
                    : 'bg-red-900/30 border-red-700'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {validatedCertificate.isValid ? (
                      <>
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-green-500 font-semibold text-xs">{t('certificates.verified')}</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-red-500 font-semibold text-xs">Certificado Inválido</span>
                      </>
                    )}
                  </div>
                  {validatedCertificate.isValid ? (
                    <div className="space-y-1 text-xs">
                      <p className="text-gray-300">
                        <span className="font-medium">{t('certificates.holderName')}</span> {validatedCertificate.holderName}
                      </p>
                      <p className="text-gray-300">
                        <span className="font-medium">{t('certificates.event')}</span> {validatedCertificate.event}
                      </p>
                      <p className="text-gray-300">
                        <span className="font-medium">{t('certificates.issueDate')}</span> {validatedCertificate.issueDate}
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs">
                      <p className="text-red-300 mb-2">
                        Este certificado não é válido ou não foi encontrado no sistema.
                      </p>
                      <div className="space-y-1 text-gray-400">
                        <p>
                          <span className="font-medium">Código:</span> {certificateId}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CertificatesPage

