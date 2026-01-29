export const emitAuthEvent = (eventType) => {
  const event = new CustomEvent('auth-notification', {
    detail: { type: eventType }
  })
  window.dispatchEvent(event)
  console.log(`📢 Auth event emitted: ${eventType}`)
}

export const clearAuthData = (emitEvent) => {
  // Очищаем localStorage
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user')
  localStorage.removeItem('refresh_token')
  
  console.log("EVENT: ", emitEvent)
  if (emitEvent) {
    emitAuthEvent('sessionExpired')
  }
  
  console.log('🧹 Данные авторизации очищены')
}