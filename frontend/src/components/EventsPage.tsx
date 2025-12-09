import { useEffect, useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { listEvents, register } from '../services/events.service'

interface Registration {
  id: string
  user: string
}

export interface Event {
  id: string
  name: string
  code: string
  date: string
  capacity: string
  place: {
    name: string
  },
  event_type: {
    name: string
  },
  registrations: Registration[]
}

function EventsPage() {
  const { t, language: _language } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [events, setEvents] = useState<Event[] | null>(null);

  const fetchEvents = async () => {
    const eventsDB = await listEvents();
    eventsDB && setEvents(eventsDB);
    console.log('eventsDB')
    console.log(eventsDB)
  }

  useEffect(() => {
    fetchEvents();
  }, [])

  const handleRegistration = async (eventId: number) => {
    await register(eventId);
  }

  // Formatar data de "2025-12-15 21:55:00" para "15/12/2025 21:55"
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      return dateString;
    }
  }

  // Filtrar eventos baseado no termo de busca
  const filteredEvents = events?.filter((event) => {
    if (!searchTerm.trim()) {
      return true;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const eventName = event.name?.toLowerCase() || '';
    const placeName = event.place?.name?.toLowerCase() || '';
    const eventType = event.event_type?.name?.toLowerCase() || '';
    
    return (
      eventName.includes(searchLower) ||
      placeName.includes(searchLower) ||
      eventType.includes(searchLower)
    );
  }) || null;

  // enrollment and view-details handlers can be implemented when wiring actions

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">{t('events.title')}</h1>
        <div className="text-gray-400 text-sm sm:text-base">
          {filteredEvents && filteredEvents.length} {filteredEvents && filteredEvents.length === 1 ? t('events.found.singular') : t('events.found')}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
        {/* Barra de busca */}
        <div className="mb-6">
          <input
            type="text"
            placeholder={t('events.search.placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Grid de Eventos */}
        {filteredEvents && filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">{t('events.noEvents')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents && filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-600 transition-colors flex flex-col"
              >
                {/* Header com gradiente */}
                <div className={`h-32 bg-gradient-to-r  flex items-center justify-center relative`}>
                  <div className="text-white text-3xl font-bold opacity-80">
                    {event.name.charAt(0)}
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                    {event.name}
                  </h3>

                  {/* Informações do evento */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{event.place ? event.place.name : "Sem local"}</span>
                    </div>
                  </div>

                  {/* Participantes */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>{t('events.registered')}</span>
                      <span>{event.registrations.length}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>{t('events.participants')}</span>
                      <span>{Number(event.capacity) == 0 ? '∞' : event.capacity}</span>
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-2 mt-auto">
                      <>
                        <button
                          onClick={() => handleRegistration(Number(event.id))}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          {t('events.enroll')}
                        </button>
                      </>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EventsPage
