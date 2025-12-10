import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'pt' | 'en'

interface AppContextType {
  language: Language
  notifications: {
    email: boolean
    whatsapp: boolean
  }
  setLanguage: (language: Language) => void
  setNotifications: (notifications: { email: boolean; whatsapp: boolean }) => void
  t: (key: string) => string
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const translations = {
  pt: {
    'app.name': 'Event Sync',
    'nav.events': 'Eventos',
    'nav.certificates': 'Meus Eventos e Certificados',
    'nav.profile': 'Perfil',
    'nav.settings': 'Configurações',
    'nav.admin': 'Admin',
    'nav.logout': 'Sair',
    'settings.title': 'Configurações',
    'settings.notifications': 'Notificações',
    'settings.email': 'Notificações por Email',
    'settings.email.desc': 'Receber notificações por email',
    'settings.whatsapp': 'Notificações por WhatsApp',
    'settings.whatsapp.desc': 'Receber notificações por WhatsApp',
    'settings.language': 'Idioma',
    'settings.language.pt': 'Português',
    'settings.language.en': 'Inglês',
    'events.title': 'Eventos',
    'events.found': 'eventos encontrados',
    'events.found.singular': 'evento encontrado',
    'events.search.placeholder': 'Buscar eventos por nome, descrição ou localização...',
    'events.filter.status': 'Status',
    'events.filter.category': 'Categoria',
    'events.filter.all': 'Todos',
    'events.filter.upcoming': 'Próximos',
    'events.filter.today': 'Hoje',
    'events.filter.past': 'Passados',
    'events.today': 'HOJE',
    'events.enrolled': 'INSCRITO',
    'events.participants': 'Capacidade',
    'events.enroll': 'Inscrever-se',
    'events.details': 'Detalhes',
    'events.viewDetails': 'Ver Detalhes',
    'events.noEvents': 'Nenhum evento encontrado com os critérios selecionados.',
    'certificates.title': 'Meus Certificados e Validação',
    'certificates.yourCertificates': 'Seus Certificados',
    'certificates.search.placeholder': 'Buscar por nome do evento ou emissor',
    'certificates.validate.title': 'Validar um Certificado',
    'certificates.validate.description': 'Digite o ID do Certificado para verificar sua autenticidade.',
    'certificates.validate.id': 'ID do Certificado',
    'certificates.validate.id.placeholder': 'Digite o ID do Certificado',
    'certificates.validate.button': 'Validar',
    'certificates.validate.or': 'OU',
    'certificates.validate.scanQR': 'Escanear Código QR',
    'certificates.issuedBy': 'Emitido por',
    'certificates.completedOn': 'Concluído em',
    'certificates.download': 'Baixar',
    'certificates.viewDetails': 'Ver Detalhes',
    'certificates.verified': 'Verificado',
    'certificates.verified.description': 'Este certificado é autêntico.',
    'certificates.holderName': 'Nome do Portador:',
    'certificates.event': 'Evento:',
    'certificates.issueDate': 'Data de Emissão:',
    'profile.title': 'Perfil',
    'profile.personalInfo': 'Informações Pessoais',
    'profile.editProfile': 'Editar Perfil',
    'profile.cancel': 'Cancelar',
    'profile.saveChanges': 'Salvar Alterações',
    'profile.fullName': 'Nome Completo',
    'profile.email': 'Email',
    'profile.phone': 'Telefone',
    'profile.location': 'Localização',
    'profile.fromGoogle': 'Da Conta Google',
    'profile.statistics': 'Estatísticas',
    'profile.stats.eventsAttended': 'Eventos Participados',
    'profile.stats.certificatesEarned': 'Certificados Obtidos',
    'profile.stats.hoursLearned': 'Horas de Aprendizado',
    'profile.stats.currentStreak': 'Sequência Atual',
    'admin.title': 'Admin - Validação de Eventos',
    'admin.selectEvent': 'Selecionar Evento',
    'admin.registeredUsers': 'Usuários Cadastrados',
    'admin.search.placeholder': 'Buscar por nome ou email...',
    'admin.table.name': 'Nome',
    'admin.table.email': 'Email',
    'admin.table.date': 'Data',
    'admin.table.status': 'Status',
    'admin.table.actions': 'Ações',
    'admin.status.validated': 'Validado',
    'admin.status.pending': 'Pendente',
    'admin.validate': 'Validar',
    'admin.registerUser': 'Cadastrar Usuário',
    'admin.registerNewUser': 'Cadastrar Novo Usuário',
    'admin.register.fullName': 'Nome Completo *',
    'admin.register.fullName.placeholder': 'Digite o nome completo',
    'admin.register.email': 'Email *',
    'admin.register.email.placeholder': 'Digite o endereço de email',
    'admin.register.phone': 'Telefone',
    'admin.register.phone.placeholder': 'Digite o número de telefone (opcional)',
    'admin.register.cancel': 'Cancelar',
    'events.registered': 'Inscritos',
    'admin.register.enroll': 'Cadastrar e Inscrever',
    'admin.noUsers': 'Nenhum usuário encontrado',
    'admin.validated': 'Validados',
    'admin.pending': 'Pendentes',
    'login.title': 'Event Sync',
    'login.subtitle': 'Sistema de Gerenciamento de Eventos',
    'login.button': 'Continuar com Google',
    'login.error': 'Erro ao fazer login com Google. Tente novamente.',
    'events.categories.conferences': 'Conferências',
    'events.categories.workshop': 'Workshop',
    'events.categories.webinars': 'Webinars',
    'events.categories.meetup': 'Meetup',
    'certificates.categories.all': 'Todos',
    'certificates.categories.webinars': 'Webinars',
    'certificates.categories.conferences': 'Conferências',
    'certificates.categories.workshop': 'Workshop',
    'admin.validatedAt': 'Validado em',
    'profile.defaultUser': 'Usuário',
    'profile.days': 'dias',
    'admin.table.id.register': 'ID do registro'
  },
  en: {
    'app.name': 'Event Sync',
    'nav.events': 'Events',
    'nav.certificates': 'My Events and Certificates',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.admin': 'Admin',
    'nav.logout': 'Logout',
    'settings.title': 'Settings',
    'settings.notifications': 'Notifications',
    'settings.email': 'Email Notifications',
    'settings.email.desc': 'Receive notifications via email',
    'settings.whatsapp': 'WhatsApp Notifications',
    'settings.whatsapp.desc': 'Receive notifications via WhatsApp',
    'settings.language': 'Language',
    'settings.language.pt': 'Portuguese',
    'settings.language.en': 'English',
    'events.title': 'Events',
    'events.found': 'events found',
    'events.found.singular': 'event found',
    'events.search.placeholder': 'Search events by name, description, or location...',
    'events.filter.status': 'Status',
    'events.registered': 'Registered',
    'events.filter.category': 'Category',
    'events.filter.all': 'All',
    'events.filter.upcoming': 'Upcoming',
    'events.filter.today': 'Today',
    'events.filter.past': 'Past',
    'events.today': 'TODAY',
    'events.enrolled': 'ENROLLED',
    'events.participants': 'Capacity',
    'events.enroll': 'Enroll',
    'events.details': 'Details',
    'events.viewDetails': 'View Details',
    'events.noEvents': 'No events found matching your criteria.',
    'certificates.title': 'My Certificates & Validation',
    'certificates.yourCertificates': 'Your Certificates',
    'certificates.search.placeholder': 'Search by event name or issuer',
    'certificates.validate.title': 'Validate a Certificate',
    'certificates.validate.description': 'Enter the Certificate ID to verify its authenticity.',
    'certificates.validate.id': 'Certificate ID',
    'certificates.validate.id.placeholder': 'Enter Certificate ID',
    'certificates.validate.button': 'Validate',
    'certificates.validate.or': 'OR',
    'certificates.validate.scanQR': 'Scan QR Code',
    'certificates.issuedBy': 'Issued by',
    'certificates.completedOn': 'Completed on',
    'certificates.download': 'Download',
    'certificates.viewDetails': 'View Details',
    'certificates.verified': 'Verified',
    'certificates.verified.description': 'This certificate is authentic.',
    'certificates.holderName': 'Holder Name:',
    'certificates.event': 'Event:',
    'certificates.issueDate': 'Issue Date:',
    'profile.title': 'Profile',
    'profile.personalInfo': 'Personal Information',
    'profile.editProfile': 'Edit Profile',
    'profile.cancel': 'Cancel',
    'profile.saveChanges': 'Save Changes',
    'profile.fullName': 'Full Name',
    'profile.email': 'Email',
    'profile.phone': 'Phone',
    'profile.location': 'Location',
    'profile.fromGoogle': 'From Google Account',
    'profile.statistics': 'Statistics',
    'profile.stats.eventsAttended': 'Events Attended',
    'profile.stats.certificatesEarned': 'Certificates Earned',
    'profile.stats.hoursLearned': 'Hours Learned',
    'profile.stats.currentStreak': 'Current Streak',
    'admin.title': 'Admin - Event Validation',
    'admin.selectEvent': 'Select Event',
    'admin.registeredUsers': 'Registered Users',
    'admin.search.placeholder': 'Search by name or email...',
    'admin.table.name': 'Name',
    'admin.table.email': 'Email',
    'admin.table.date': 'Date',
    'admin.table.status': 'Status',
    'admin.table.actions': 'Actions',
    'admin.status.validated': 'Validated',
    'admin.status.pending': 'Pending',
    'admin.validate': 'Validate',
    'admin.registerUser': 'Register User',
    'admin.registerNewUser': 'Register New User',
    'admin.register.fullName': 'Full Name *',
    'admin.register.fullName.placeholder': 'Enter full name',
    'admin.register.email': 'Email *',
    'admin.register.email.placeholder': 'Enter email address',
    'admin.register.phone': 'Phone',
    'admin.register.phone.placeholder': 'Enter phone number (optional)',
    'admin.register.cancel': 'Cancel',
    'admin.register.enroll': 'Register & Enroll',
    'admin.noUsers': 'No users found',
    'admin.validated': 'Validated',
    'admin.pending': 'Pending',
    'login.title': 'Event Sync',
    'login.subtitle': 'Event Management System',
    'login.button': 'Continue with Google',
    'login.error': 'Error logging in with Google. Please try again.',
    'events.categories.conferences': 'Conferences',
    'events.categories.workshop': 'Workshop',
    'events.categories.webinars': 'Webinars',
    'events.categories.meetup': 'Meetup',
    'certificates.categories.all': 'All',
    'certificates.categories.webinars': 'Webinars',
    'certificates.categories.conferences': 'Conferences',
    'certificates.categories.workshop': 'Workshop',
    'admin.validatedAt': 'Validated at',
    'profile.defaultUser': 'User',
    'profile.days': 'days',
    'admin.table.id.register': 'Register ID'

  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language
    return saved || 'pt'
  })
  
  const [notifications, setNotificationsState] = useState(() => {
    const saved = localStorage.getItem('notifications')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return { email: true, whatsapp: false }
      }
    }
    return { email: true, whatsapp: false }
  })

  useEffect(() => {
    localStorage.setItem('language', language)
    document.documentElement.lang = language === 'pt' ? 'pt-BR' : 'en-US'
  }, [language])

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications))
  }, [notifications])

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
  }

  const setNotifications = (newNotifications: { email: boolean; whatsapp: boolean }) => {
    setNotificationsState(newNotifications)
  }

  const t = (key: string): string => {
    const langTranslations = translations[language]
    return (langTranslations as Record<string, string>)[key] || key
  }

  return (
    <AppContext.Provider
      value={{
        language,
        notifications,
        setLanguage,
        setNotifications,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

