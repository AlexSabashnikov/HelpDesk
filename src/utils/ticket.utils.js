/**
 * Утилиты для работы с заявками
 */

// Константы для статусов
export const STATUS_LABELS = {
  new: 'Новая',
  inProgress: 'В работе',
  completed: 'Выполнена',
  stopped: 'Работа остановлена',
  onSite: 'Выехал на объект',
  assigned: 'Назначена',
  waitingPayment: 'Ждет оплаты',
  rejected: 'Отказ заказчика'
}

// Константы для приоритетов
export const PRIORITY_LABELS = {
  crit: 'Критический',
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий'
}

// Цвета для приоритетов
export const PRIORITY_COLORS = {
  crit: '#e90000',
  high: '#e98c00',
  medium: '#e9da00',
  low: '#16bd00'
}

// Цвета для статусов
export const STATUS_COLORS = {
  new: { background: '#d0e2ff', color: '#0b2692', border: '#0b2692' },
  assigned: { background: '#d0f2ff', color: '#1caae2', border: '#1caae2' },
  inProgress: { background: '#fffbbf', color: '#938900', border: '#d3c500' },
  stopped: { background: '#f2d0ff', color: '#8d00c5', border: '#8d00c5' },
  completed: { background: '#d2ffcc', color: '#16bd00', border: '#16bd00' },
  rejected: { background: '#ffcbcb', color: '#bd0000', border: '#bd0000' }
}

/**
 * Форматирует дату в строку вида "DD.MM.YYYY HH:MM"
 * @param {Date|string|number} dateInput - Входная дата
 * @returns {string} Отформатированная дата
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return 'Не указан'

  try {
    // Если это уже отформатированная строка
    if (typeof dateInput === 'string' && dateInput.includes('.') && dateInput.includes(':')) {
      return dateInput
    }

    let date
    if (dateInput instanceof Date) {
      date = dateInput
    } else if (typeof dateInput === 'string') {
      const cleanDateStr = dateInput.trim().replace('Z', '')
      date = new Date(cleanDateStr)
      if (isNaN(date.getTime())) {
        date = new Date(dateInput)
      }
    } else if (typeof dateInput === 'number') {
      date = new Date(dateInput)
    } else {
      console.warn('Неизвестный формат даты:', dateInput)
      return 'Неизвестный формат'
    }

    if (isNaN(date.getTime())) {
      console.warn('Некорректная дата:', dateInput)
      return 'Некорректная дата'
    }

    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')

    return `${day}.${month}.${year} ${hours}:${minutes}`
  } catch (error) {
    console.error('Ошибка форматирования даты:', error, 'Входные данные:', dateInput)
    return 'Ошибка даты'
  }
}

/**
 * Проверяет, просрочен ли дедлайн
 * @param {Date|string} deadline - Дата дедлайна
 * @returns {boolean} true если просрочен
 */
export const isDeadlineOverdue = (deadline) => {
  if (!deadline || deadline === 'Не указан') return false

  try {
    let deadlineDate
    if (deadline instanceof Date) {
      deadlineDate = deadline
    } else if (typeof deadline === 'string') {
      const cleanDateStr = deadline.trim().replace('Z', '')
      deadlineDate = new Date(cleanDateStr)
      if (isNaN(deadlineDate.getTime())) {
        deadlineDate = new Date(deadline)
      }
    } else {
      return false
    }

    const now = new Date()
    return !isNaN(deadlineDate.getTime()) && deadlineDate < now
  } catch (error) {
    console.error('Ошибка проверки дедлайна:', error)
    return false
  }
}

/**
 * Определяет, подходит ли заявка к сроку (20% оставшегося времени до дедлайна)
 * @param {Date|string} deadline - Дата дедлайна
 * @param {Date|string} createdAt - Дата создания
 * @returns {boolean} true если подходит к сроку
 */
export const isDeadlineApproaching = (deadline, createdAt) => {
  if (!deadline || deadline === 'Не указан') return false
  if (!createdAt) return false

  try {
    // Парсим даты
    let deadlineDate
    let createdAtDate
    
    // Парсим дедлайн
    if (deadline instanceof Date) {
      deadlineDate = deadline
    } else if (typeof deadline === 'string') {
      const cleanDateStr = deadline.trim().replace('Z', '')
      deadlineDate = new Date(cleanDateStr)
      if (isNaN(deadlineDate.getTime())) {
        deadlineDate = new Date(deadline)
      }
    } else {
      return false
    }
    
    // Парсим дату создания
    if (createdAt instanceof Date) {
      createdAtDate = createdAt
    } else if (typeof createdAt === 'string') {
      const cleanDateStr = createdAt.trim().replace('Z', '')
      createdAtDate = new Date(cleanDateStr)
      if (isNaN(createdAtDate.getTime())) {
        createdAtDate = new Date(createdAt)
      }
    } else {
      return false
    }
    
    // Проверяем валидность дат
    if (isNaN(deadlineDate.getTime()) || isNaN(createdAtDate.getTime())) {
      return false
    }
    
    // Если дедлайн уже наступил
    const now = new Date()
    if (deadlineDate <= now) {
      return false
    }
    
    // Вычисляем общее время на выполнение заявки
    const totalTimeMs = deadlineDate - createdAtDate
    
    // Если общее время некорректно (дедлайн раньше создания)
    if (totalTimeMs <= 0) {
      return false
    }
    
    // Вычисляем оставшееся время
    const remainingTimeMs = deadlineDate - now
    
    // Вычисляем процент оставшегося времени от общего
    const remainingPercentage = (remainingTimeMs / totalTimeMs) * 100
    
    // Считаем, что заявка подходит к сроку, если осталось 20% или меньше от общего времени
    return remainingPercentage <= 20 && remainingPercentage > 0
    
  } catch (error) {
    console.error('Ошибка проверки приближения дедлайна:', error)
    return false
  }
}

/**
 * Получает CSS класс для срока в зависимости от состояния
 * @param {Date|string} deadline - Дата дедлайна
 * @param {Date|string} createdAt - Дата создания (опционально для isDeadlineApproaching)
 * @returns {string} CSS класс
 */
export const getDeadlineClass = (deadline, createdAt = null) => {
  if (isDeadlineOverdue(deadline)) {
    return 'deadline-overdue'
  } else if (createdAt && isDeadlineApproaching(deadline, createdAt)) {
    return 'deadline-approaching'
  }
  return 'deadline-normal'
}

/**
 * Форматирует данные заявки для таблицы
 * @param {Array} tickets - Массив заявок
 * @returns {Array} Отформатированные заявки
 */
export const formatTicketsForTable = (tickets) => {
  return tickets.map((ticket) => {
    const formattedCreatedAt = formatDate(ticket.createdAt)
    const formattedDeadline = formatDate(ticket.deadline)
    const deadlineClass = getDeadlineClass(ticket.deadline, ticket.createdAt)

    return {
      ...ticket,
      originalDeadline: ticket.deadline,
      originalCreatedAt: ticket.createdAt,
      clientName: ticket.client?.name || 'Не указан',
      executorName: ticket.executor?.name || 'Не назначен',
      createdAt: formattedCreatedAt,
      deadline: formattedDeadline,
      deadlineClass,
      statusDisplay: ticket.status
    }
  })
}

/**
 * Обрезает текст до указанной длины
 * @param {string} text - Исходный текст
 * @param {number} maxLength - Максимальная длина
 * @returns {string} Обрезанный текст
 */
export const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

/**
 * Получает метку приоритета
 * @param {string} priority - Код приоритета
 * @returns {string} Метка приоритета
 */
export const getPriorityLabel = (priority) => {
  return PRIORITY_LABELS[priority] || priority
}

/**
 * Получает метку статуса
 * @param {string} status - Код статуса
 * @returns {string} Метка статуса
 */
export const getStatusLabel = (status) => {
  return STATUS_LABELS[status] || status
}

/**
 * Получает цвета для статуса
 * @param {string} status - Код статуса
 * @returns {Object} Объект с цветами
 */
export const getStatusColors = (status) => {
  return STATUS_COLORS[status] || { background: '#f3f4f6', color: '#6b7280', border: '#d1d5db' }
}