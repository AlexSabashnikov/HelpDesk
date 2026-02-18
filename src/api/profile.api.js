const profileApi = {
  // Получить профиль текущего пользователя - используем данные из localStorage
  async getProfile() {
    try {
      // Пытаемся получить данные текущего пользователя из localStorage
      const raw = localStorage.getItem('user')
      if (raw) {
        const userData = JSON.parse(raw)
        console.log('profileApi.getProfile: получены данные из localStorage', userData)
        return { user: userData }
      }
      throw new Error('Данные пользователя не найдены в localStorage')
    } catch (err) {
      console.error('profileApi.getProfile: ошибка получения профиля', err)
      throw err
    }
  },

  // Обновить профиль текущего пользователя
  async updateProfile(payload) {
    try {
      // В реальном приложении здесь должен быть запрос к серверу
      // Но пока просто обновляем данные в localStorage
      const raw = localStorage.getItem('user')
      if (raw) {
        const currentUser = JSON.parse(raw)
        const updatedUser = { 
          ...currentUser, 
          ...payload,
          // Сохраняем правильные имена полей
          first_name: payload.first_name || payload.firstName || currentUser.first_name,
          last_name: payload.last_name || payload.lastName || currentUser.last_name,
          middle_name: payload.middle_name || payload.middleName || currentUser.middle_name,
        }
        
        localStorage.setItem('user', JSON.stringify(updatedUser))
        console.log('profileApi.updateProfile: профиль обновлен в localStorage', updatedUser)
        return { user: updatedUser }
      }
      throw new Error('Данные пользователя не найдены в localStorage')
    } catch (err) {
      console.error('profileApi.updateProfile: ошибка обновления профиля', err)
      throw err
    }
  },

  // Получить пользователя по id - используем данные из загруженного списка
  async getUserById(id, usersList = null) {
    try {
      // Если передан список пользователей, ищем в нем
      if (usersList && Array.isArray(usersList)) {
        const foundUser = usersList.find(u => u.id === parseInt(id))
        if (foundUser) {
          console.log('profileApi.getUserById: пользователь найден в переданном списке', foundUser)
          return { user: foundUser }
        }
      }
      
      // Если список не передан или пользователь не найден, пробуем получить из localStorage
      const raw = localStorage.getItem('user')
      if (raw) {
        const localUser = JSON.parse(raw)
        if (parseInt(localUser.id) === parseInt(id)) {
          console.log('profileApi.getUserById: пользователь найден в localStorage', localUser)
          return { user: localUser }
        }
      }
      
      // Если ничего не найдено, возвращаем ошибку
      throw new Error(`Пользователь с id ${id} не найден`)
    } catch (err) {
      console.error(`profileApi.getUserById: ошибка получения пользователя ${id}`, err)
      throw err
    }
  },

  // Обновить пользователя по id
  async updateUserById(id, payload) {
    try {
      // В реальном приложении здесь должен быть запрос к серверу
      // Пока просто имитируем обновление в localStorage
      const raw = localStorage.getItem('user')
      if (raw) {
        const localUser = JSON.parse(raw)
        if (parseInt(localUser.id) === parseInt(id)) {
          const updatedUser = { 
            ...localUser, 
            ...payload,
            first_name: payload.first_name || payload.firstName || localUser.first_name,
            last_name: payload.last_name || payload.lastName || localUser.last_name,
            middle_name: payload.middle_name || payload.middleName || localUser.middle_name,
          }
          localStorage.setItem('user', JSON.stringify(updatedUser))
          console.log(`profileApi.updateUserById: пользователь ${id} обновлен в localStorage`, updatedUser)
          return { user: updatedUser }
        }
      }
      throw new Error(`Пользователь с id ${id} не найден в localStorage`)
    } catch (err) {
      console.error(`profileApi.updateUserById: ошибка обновления пользователя ${id}`, err)
      throw err
    }
  }
}

export default profileApi
