import { useState, useEffect } from 'react'
import { useApp } from '../contexts/AppContext'
import { 
  getAdminEvents, 
  validateUser, 
  createQuickUser, 
  registerUserToEvent,
  AdminEvent
} from '../services/events.service'
import {
  isOnline,
  savePendingOperation,
  getPendingOperations,
  removePendingOperation,
  setupOnlineListener,
  getPendingOperationsCount
} from '../services/offline-sync.service'

interface LocalValidatedUser {
  registrationId: number
  userId: number
  eventId: number
  validatedAt: string
  synced: boolean
}

interface LocalRegisteredUser {
  name: string
  email: string
  eventId: number
  synced: boolean
  userId?: number
  registrationId?: number 
}

function AdminPage() {
  const { t, language } = useApp()
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [online, setOnline] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
  })
  
  const [localValidations, setLocalValidations] = useState<Map<string, LocalValidatedUser>>(new Map())
  const [localRegistrations, setLocalRegistrations] = useState<LocalRegisteredUser[]>([])

  useEffect(() => {
    loadEvents()
    loadLocalData()
    
    const removeListener = setupOnlineListener((isOnline) => {
      setOnline(isOnline)
      if (isOnline) {
        syncPendingOperations()
      }
    })
    
    setOnline(isOnline())
    setPendingCount(getPendingOperationsCount())
    
    return () => {
      removeListener()
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setPendingCount(getPendingOperationsCount())
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])

  const loadEvents = async (skipLoading = false) => {
    try {
      if (!skipLoading) {
        setLoading(true)
      }
      const data = await getAdminEvents()
      setEvents(data)
      
      if (selectedEvent) {
        const updated = data.find(e => e.id === selectedEvent.id)
        if (updated) {
          setSelectedEvent(updated)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
      const cached = localStorage.getItem('admin_events_cache')
      if (cached) {
        try {
          const cachedData = JSON.parse(cached)
          setEvents(cachedData)
          if (selectedEvent) {
            const updated = cachedData.find((e: AdminEvent) => e.id === selectedEvent.id)
            if (updated) {
              setSelectedEvent(updated)
            }
          }
        } catch (e) {
          console.error('Erro ao carregar cache:', e)
        }
      }
    } finally {
      if (!skipLoading) {
        setLoading(false)
      }
    }
  }

  const loadLocalData = () => {
    try {
      const validations = localStorage.getItem('local_validations')
      if (validations) {
        const parsed = JSON.parse(validations)
        setLocalValidations(new Map(Object.entries(parsed)))
      }
      
      const registrations = localStorage.getItem('local_registrations')
      if (registrations) {
        setLocalRegistrations(JSON.parse(registrations))
      }
    } catch (error) {
      console.error('Erro ao carregar dados locais:', error)
    }
  }

  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('admin_events_cache', JSON.stringify(events))
    }
  }, [events])

  const isRegistrationValidated = (registrationId: number): boolean => {
    if (!selectedEvent) return false
    
    const key = `${selectedEvent.id}_${registrationId}`
    if (localValidations.has(key)) {
      return true
    }
    
    const registration = selectedEvent.registrations.find(r => r.id === registrationId)
    return registration ? registration.status === 1 : false
  }

  const getValidationDate = (registrationId: number): string | null => {
    if (!selectedEvent) return null
    
    const key = `${selectedEvent.id}_${registrationId}`
    const local = localValidations.get(key)
    if (local) {
      return new Date(local.validatedAt).toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US')
    }
    
    const registration = selectedEvent.registrations.find(r => r.id === registrationId)
    if (registration && registration.status === 1) {
      return new Date(registration.updated_at).toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US')
    }
    
    return null
  }

  const handleValidate = async (registrationId: number, userId: number) => {
    if (!selectedEvent) return
    
    if (registrationId < 0) {
      alert('Aguarde a sincronização do usuário antes de validar.')
      return
    }
    
    const validationKey = `${selectedEvent.id}_${registrationId}`
    const validatedAt = new Date().toISOString()
    
    if (online) {
      try {
        await validateUser(registrationId)
        
        // ONLINE + SUCESSO: 
        // - Salva em local_validations (para cache visual)
        // - NÃO salva em offline_pending_operations (já foi enviado)
        const newValidations = new Map(localValidations)
        newValidations.set(validationKey, {
          registrationId,
          userId,
          eventId: selectedEvent.id,
          validatedAt,
          synced: true // Marcado como sincronizado
        })
        setLocalValidations(newValidations)
        saveLocalValidations(newValidations)
        
        const updatedEvents = events.map(event => {
          if (event.id === selectedEvent.id) {
            return {
              ...event,
              registrations: event.registrations.map(reg => 
                reg.id === registrationId ? { ...reg, status: 1 } : reg
              )
            }
          }
          return event
        })
        setEvents(updatedEvents)
        
        // Atualizar evento selecionado
        const updatedSelectedEvent = updatedEvents.find(e => e.id === selectedEvent.id)
        if (updatedSelectedEvent) {
          setSelectedEvent(updatedSelectedEvent)
        }
        
        // Recarregar eventos para garantir sincronização
        await loadEvents()
      } catch (error) {
        console.error('Erro ao validar usuário:', error)
        // ONLINE mas FALHOU:
        // - Salva em offline_pending_operations (para tentar depois)
        // - Salva em local_validations (para cache visual)
        savePendingOperation({
          type: 'validate_user',
          data: { eventId: selectedEvent.id, registrationId, userId }
        })
        
        const newValidations = new Map(localValidations)
        newValidations.set(validationKey, {
          registrationId,
          userId,
          eventId: selectedEvent.id,
          validatedAt,
          synced: false 
        })
        setLocalValidations(newValidations)
        saveLocalValidations(newValidations)
      }
    } else {
      // OFFLINE:
      // - Salva em offline_pending_operations (para quando voltar)
      // - Salva em local_validations (para cache visual)
      savePendingOperation({
        type: 'validate_user',
        data: { eventId: selectedEvent.id, registrationId, userId }
      })
      
      const newValidations = new Map(localValidations)
      newValidations.set(validationKey, {
        registrationId,
        userId,
        eventId: selectedEvent.id,
        validatedAt,
        synced: false 
      })
      setLocalValidations(newValidations)
      saveLocalValidations(newValidations)
      
      const updatedEvents = events.map(event => {
        if (event.id === selectedEvent.id) {
          return {
            ...event,
            registrations: event.registrations.map(reg => 
              reg.id === registrationId ? { ...reg, status: 1 } : reg
            )
          }
        }
        return event
      })
      setEvents(updatedEvents)
      const updatedSelectedEvent = updatedEvents.find(e => e.id === selectedEvent.id)
      if (updatedSelectedEvent) {
        setSelectedEvent(updatedSelectedEvent)
      }
      
      setPendingCount(getPendingOperationsCount())
    }
  }

  const saveLocalValidations = (validations: Map<string, LocalValidatedUser>) => {
    const obj = Object.fromEntries(validations)
    localStorage.setItem('local_validations', JSON.stringify(obj))
  }

  const handleRegisterUser = async () => {
    if (!newUser.name || !newUser.email || !selectedEvent) return
    
    const tempRegistrationId = -(Date.now())
    
    const registration: LocalRegisteredUser = {
      name: newUser.name,
      email: newUser.email,
      eventId: selectedEvent.id,
      synced: false,
      registrationId: tempRegistrationId
    }
    
    if (online) {
      try {
        // ONLINE: Tentar criar usuário e registrar no evento
        const userResponse = await createQuickUser({
          name: newUser.name,
          email: newUser.email,
        })
        
        const userId = userResponse.user?.id
        
        if (userId) {
          const registrationResponse = await registerUserToEvent(selectedEvent.id, userId)
          const registrationId = registrationResponse?.data?.id
          
          // ONLINE + SUCESSO:
          // - Salva em local_registrations (para cache)
          // - NÃO salva em offline_pending_operations (já foi enviado)
          registration.synced = true
          registration.userId = userId
          
          const updatedRegistrations = localRegistrations.map(r => 
            (r.eventId === selectedEvent.id && r.email === newUser.email && !r.synced)
              ? { ...r, synced: true, userId }
              : r
          )
          setLocalRegistrations(updatedRegistrations)
          localStorage.setItem('local_registrations', JSON.stringify(updatedRegistrations))
          
          // Validar automaticamente o registro se tivermos o registrationId
          if (registrationId) {
            await handleValidate(registrationId, userId)
          } else {
            const refreshedEvents = await getAdminEvents()
            setEvents(refreshedEvents)
            
            const updatedSelected = refreshedEvents.find(e => e.id === selectedEvent.id)
            if (updatedSelected) {
              setSelectedEvent(updatedSelected)
              
              const newRegistration = updatedSelected.registrations.find(
                r => r.user_id === userId && r.event_id === selectedEvent.id
              )
              
              if (newRegistration) {
                await handleValidate(newRegistration.id, userId)
              }
            }
          }
        }
      } catch (error) {
        console.error('Erro ao cadastrar usuário:', error)
        // ONLINE mas FALHOU:
        // - Salva em offline_pending_operations (para tentar depois)
        savePendingOperation({
          type: 'register_user',
          data: { userData: newUser, eventId: selectedEvent.id }
        })
        
        savePendingOperation({
          type: 'register_user_to_event',
          data: { eventId: selectedEvent.id, userData: newUser }
        })
      }
    } else {
      // OFFLINE:
      // - Salva em offline_pending_operations (para quando voltar)
      savePendingOperation({
        type: 'register_user',
        data: { userData: newUser, eventId: selectedEvent.id }
      })
      
      savePendingOperation({
        type: 'register_user_to_event',
        data: { eventId: selectedEvent.id, userData: newUser }
      })
      
      setPendingCount(getPendingOperationsCount())
    }
    
    // SEMPRE salva em local_registrations (para cache visual, online ou offline)
    const newRegistrations = [...localRegistrations, registration]
    setLocalRegistrations(newRegistrations)
    localStorage.setItem('local_registrations', JSON.stringify(newRegistrations))
    
    setNewUser({ name: '', email: ''})
    setShowRegisterModal(false)
  }

  const syncPendingOperations = async () => {
    console.log('sincronizando')
    if (!online || syncing) return
    
    setSyncing(true)
    const operations = getPendingOperations()
    
    for (const operation of operations.filter(op => op.type === 'validate_user')) {
      try {
        console.log(operation.data.registrationId)
        await validateUser(operation.data.registrationId)
        removePendingOperation(operation.id)
        
        const key = `${operation.data.eventId}_${operation.data.registrationId}`
        const newValidations = new Map(localValidations)
        const existing = newValidations.get(key)
        if (existing) {
          newValidations.set(key, { ...existing, synced: true })
          setLocalValidations(newValidations)
          saveLocalValidations(newValidations)
        }
      } catch (error) {
        console.error(`Erro ao sincronizar validação ${operation.id}:`, error)
      }
    }
    
    for (const operation of operations.filter(op => op.type === 'register_user')) {
      try {
        const userResponse = await createQuickUser(operation.data.userData)
        const userId = userResponse.user?.id
        
        if (userId) {
          // Atualizar registro local com userId
          const regIndex = localRegistrations.findIndex(
            r => r.email === operation.data.userData.email && r.eventId === operation.data.eventId
          )
          if (regIndex >= 0) {
            const updated = [...localRegistrations]
            updated[regIndex] = { ...updated[regIndex], userId, synced: false } // Ainda não sincronizado no evento
            setLocalRegistrations(updated)
            localStorage.setItem('local_registrations', JSON.stringify(updated))
          }
        }
        removePendingOperation(operation.id)
      } catch (error) {
        console.error(`Erro ao sincronizar cadastro ${operation.id}:`, error)
      }
    }
    
    for (const operation of operations.filter(op => op.type === 'register_user_to_event')) {
      try {
        const localReg = localRegistrations.find(
          r => r.email === operation.data.userData.email && r.eventId === operation.data.eventId
        )
        
        if (localReg?.userId) {
          await registerUserToEvent(operation.data.eventId, localReg.userId)
          removePendingOperation(operation.id)
          
          const regIndex = localRegistrations.findIndex(
            r => r.email === operation.data.userData.email && r.eventId === operation.data.eventId
          )
          if (regIndex >= 0) {
            const updated = [...localRegistrations]
            updated[regIndex] = { ...updated[regIndex], synced: true }
            setLocalRegistrations(updated)
            localStorage.setItem('local_registrations', JSON.stringify(updated))
          }
        } else {
          try {
            const userResponse = await createQuickUser(operation.data.userData)
            const userId = userResponse.id || userResponse.user?.id
            
            if (userId) {
              await registerUserToEvent(operation.data.eventId, userId)
              removePendingOperation(operation.id)
              
              const regIndex = localRegistrations.findIndex(
                r => r.email === operation.data.userData.email && r.eventId === operation.data.eventId
              )
              if (regIndex >= 0) {
                const updated = [...localRegistrations]
                updated[regIndex] = { ...updated[regIndex], userId, synced: true }
                setLocalRegistrations(updated)
                localStorage.setItem('local_registrations', JSON.stringify(updated))
              }
            }
          } catch (error) {
            console.error(`Erro ao criar usuário e registrar no evento ${operation.id}:`, error)
          }
        }
      } catch (error) {
        console.error(`Erro ao sincronizar registro em evento ${operation.id}:`, error)
      }
    }
    
    await loadEvents()
    setPendingCount(getPendingOperationsCount())
    setSyncing(false)
  }

  const allRegistrations = selectedEvent ? [
    ...selectedEvent.registrations,
    ...localRegistrations
      .filter(reg => reg.eventId === selectedEvent.id && !reg.synced)
      .map((reg, index) => ({
        id: reg.registrationId || -(Date.now() + index), 
        user: reg.userId?.toString() || '',
        status: 0, 
        event_id: reg.eventId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: reg.userId || 0,
        user_name: reg.name,
        user_email: reg.email,
        googleId: ''
      }))
  ] : []

  const filteredRegistrations = allRegistrations.filter(registration =>
    (registration.user_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (registration.user_email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const registrationsWithStatus = filteredRegistrations.map(registration => ({
    ...registration,
    validated: isRegistrationValidated(registration.id),
    validatedAt: getValidationDate(registration.id)
  }))

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
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">{t('admin.title')}</h1>
        
        {/* Indicador de Status Online/Offline */}
        <div className="flex items-center gap-3">
          {syncing && (
            <div className="flex items-center gap-2 text-blue-400 text-sm">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sincronizando...
            </div>
          )}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            online ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${online ? 'bg-green-400' : 'bg-red-400'}`}></div>
            {online ? 'Online' : 'Offline'}
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded-full text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
              </div>
              {online && !syncing && (
                <button
                  onClick={syncPendingOperations}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sincronizar
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Seleção de Evento */}
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">{t('admin.selectEvent')}</h2>
        {events.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            Nenhum evento encontrado
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className={`p-4 rounded-lg border-2 transition-colors text-left ${
                  selectedEvent?.id === event.id
                    ? 'border-blue-600 bg-blue-600/20'
                    : 'border-gray-700 bg-gray-700 hover:border-gray-600'
                }`}
              >
                <h3 className="text-white font-medium mb-2">{event.name}</h3>
                <p className="text-gray-400 text-sm mb-1">
                  {new Date(event.date).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US')}
                </p>
                <p className="text-gray-500 text-xs mb-2">Código: {event.code}</p>
                <p className="text-gray-500 text-xs">
                  {event.registrations.length} usuário{event.registrations.length !== 1 ? 's' : ''} registrado{event.registrations.length !== 1 ? 's' : ''}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedEvent && (
        <>
          {/* Informações do Evento Selecionado */}
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">
                  {selectedEvent.name}
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-gray-400 text-sm">
                  <span>{new Date(selectedEvent.date).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US')}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Código: {selectedEvent.code}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Capacidade: {selectedEvent.capacity}</span>
                </div>
              </div>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('admin.registerUser')}
              </button>
            </div>
          </div>

          {/* Lista de Usuários Cadastrados */}
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                {t('admin.registeredUsers')} ({registrationsWithStatus.length})
              </h2>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-400 text-xs sm:text-sm">
                    {t('admin.validated')}: {registrationsWithStatus.filter(r => r.validated).length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-400 text-xs sm:text-sm">
                    {t('admin.pending')}: {registrationsWithStatus.filter(r => !r.validated).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Barra de Busca */}
            <div className="mb-4">
              <input
                type="text"
                placeholder={t('admin.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tabela de Usuários - Mobile: Cards, Desktop: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-2 sm:px-4 text-gray-400 font-medium text-sm">{t('admin.table.id.register')}</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-gray-400 font-medium text-sm">{t('admin.table.name')}</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-gray-400 font-medium text-sm">{t('admin.table.email')}</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-gray-400 font-medium text-sm">{t('admin.table.status')}</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-gray-400 font-medium text-sm">{t('admin.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {registrationsWithStatus.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-400">
                        {t('admin.noUsers')}
                      </td>
                    </tr>
                  ) : (
                    registrationsWithStatus.map((registration) => (
                      <tr key={registration.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                        <td className="py-3 px-2 sm:px-4 text-white text-sm">{registration.id}</td>
                        <td className="py-3 px-2 sm:px-4 text-white text-sm">{registration.user_name}</td>
                        <td className="py-3 px-2 sm:px-4 text-gray-300 text-sm truncate max-w-[150px]">{registration.user_email}</td>
                        <td className="py-3 px-2 sm:px-4">
                          {registration.validated ? (
                            <span className="inline-flex items-center gap-2 px-2 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              {t('admin.status.validated')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded-full text-xs">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              {t('admin.status.pending')}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 sm:px-4">
                          {!registration.validated ? (
                            <button
                              onClick={() => handleValidate(registration.id, registration.user_id)}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                            >
                              {t('admin.validate')}
                            </button>
                          ) : (
                            <div className="text-gray-500 text-xs sm:text-sm truncate max-w-[120px]">
                              {registration.validatedAt || 'Validado'}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Cards para Mobile */}
            <div className="md:hidden space-y-3">
              {registrationsWithStatus.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  {t('admin.noUsers')}
                </div>
              ) : (
                registrationsWithStatus.map((registration) => (
                  <div key={registration.id} className="bg-gray-700 rounded-lg p-4 space-y-3">
                    <div>
                      <h3 className="text-white font-medium">{registration.user_name}</h3>
                      <p className="text-gray-300 text-sm truncate">{registration.user_email}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      {registration.validated ? (
                        <span className="inline-flex items-center gap-2 px-2 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          {t('admin.status.validated')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded-full text-xs">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          {t('admin.status.pending')}
                        </span>
                      )}
                    </div>
                    {!registration.validated ? (
                      <button
                        onClick={() => handleValidate(registration.id, registration.user_id)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        {t('admin.validate')}
                      </button>
                    ) : (
                      <div className="text-gray-500 text-xs">
                        {registration.validatedAt ? `${t('admin.validatedAt')} ${registration.validatedAt}` : 'Validado'}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal de Cadastro Rápido */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">{t('admin.registerNewUser')}</h2>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!online && (
              <div className="mb-4 p-3 bg-yellow-600/20 border border-yellow-600/50 rounded-lg text-yellow-400 text-sm">
                Modo offline: O cadastro será sincronizado quando a conexão for restaurada.
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('admin.register.fullName')}
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('admin.register.fullName.placeholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('admin.register.email')}
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('admin.register.email.placeholder')}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  {t('admin.register.cancel')}
                </button>
                <button
                  onClick={handleRegisterUser}
                  disabled={!newUser.name || !newUser.email}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('admin.register.enroll')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPage
