export const emitAuthEvent = (eventType) => {
  const event = new CustomEvent('auth-notification', {
    detail: { type: eventType }
  })
  window.dispatchEvent(event)
  console.log(`📢 Auth event emitted: ${eventType}`)
}

export const clearAuthData = (emitEvent) => {

  // Очищаем localStorage
  localStorage.removeItem('user')
  localStorage.removeItem('refresh_token')
  console.log("EVENT: ", emitEvent)
  if (emitEvent) {
    emitAuthEvent('sessionExpired')
  }
  
  console.log('🧹 Данные авторизации очищены')
}

export const getUserRole = () => {
  let userRole = null
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      userRole = user.role.name
    } catch (e) {
      console.error('Error parsing user for role check:', e)
    }
  }
  return userRole
}