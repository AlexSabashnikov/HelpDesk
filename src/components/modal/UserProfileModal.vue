<!-- src/components/common/UI/UserProfileModal.vue -->
<template>
  <div v-if="visible" class="profile-modal-backdrop">
    <div class="profile-modal" aria-modal="true" :aria-label="modalTitle" ref="modalRoot">
      <header class="modal-header">
        <h2 class="modal-title">{{ modalTitle }}</h2>
        <button class="close-btn" @click="close" aria-label="Закрыть">✕</button>
      </header>

      <form class="modal-body" @submit.prevent="onSave" novalidate>
        <div class="form-grid">
          <!-- Режим просмотра - используем UILabel -->
          <template v-if="!isEditing">
            <UILabel v-model="form.lastName" label="Фамилия" :show-empty-indicator="true" />
            <UILabel :model-value="displayRole" label="Роль" :show-empty-indicator="true" />
            <UILabel v-model="form.firstName" label="Имя" :show-empty-indicator="true" />
            <UILabel v-model="form.phone" label="Телефон" :show-empty-indicator="true" />
            <UILabel v-model="form.middleName" label="Отчество" :show-empty-indicator="true" />
            <UILabel v-model="form.email" label="Email" :show-empty-indicator="true" />
            <UILabel v-model="form.organization" label="Организация" :show-empty-indicator="true" />
            <UILabel v-model="form.object" label="Объект" :show-empty-indicator="true" />
          </template>

          <!-- Режим редактирования/создания - используем UIInput, UISelect, UIComboBox -->
          <template v-else>
            <!-- Фамилия -->
            <div class="form-row">
              <UIInput
                ref="lastNameInput"
                v-model="form.lastName"
                label="Фамилия"
                :show-char-count="false"
                :max-length="30"
                placeholder="Введите фамилию"
                :required="true"
              />
            </div>

            <!-- Роль (в режиме редактирования может быть недоступна) -->
            <div class="form-row" v-if="canEditRole">
              <UISelect
                ref="roleInput"
                v-model="form.roleSlug"
                :options="roleOptions"
                label="Роль"
                placeholder="Выберите роль"
                :required="true"
              />
            </div>
            <div class="form-row" v-else>
              <UILabel :model-value="displayRole" label="Роль" :show-empty-indicator="true" />
            </div>

            <!-- Имя -->
            <div class="form-row">
              <UIInput
                ref="firstNameInput"
                v-model="form.firstName"
                label="Имя"
                :max-length="30"
                placeholder="Введите имя"
                :required="true"
              />
            </div>

            <!-- Телефон -->
            <div class="form-row">
              <UIInput
                ref="phoneInput"
                v-model="form.phone"
                label="Телефон"
                type="tel"
                placeholder="Введите телефон"
                :max-length="20"
                :required="true"
              />
            </div>

            <!-- Отчество -->
            <div class="form-row">
              <UIInput
                ref="middleNameInput"
                v-model="form.middleName"
                label="Отчество"
                placeholder="Введите отчество"
                :max-length="30"
                :required="true"
              />
            </div>

            <!-- Email -->
            <div class="form-row">
              <UIInput
                ref="emailInput"
                v-model="form.email"
                label="Email"
                type="email"
                :max-length="30"
                placeholder="Введите email"
                :required="true"
              />
            </div>

            <!-- Организация (ComboBox для выбора из существующих) -->
            <div class="form-row">
              <UIComboBox
                ref="organizationInput"
                v-model="form.organization"
                :options="organizationOptions"
                label="Организация"
                option-label="name"
                option-value="id"
                placeholder="Введите или выберите организацию"
                :max-length="30"
                :required="true"
              />
            </div>

            <!-- Объект (ComboBox для выбора из существующих) -->
            <div class="form-row">
              <UIComboBox
                ref="objectInput"
                v-model="form.object"
                :options="objectOptions"
                label="Объект"
                option-label="name"
                option-value="id"
                placeholder="Введите или выберите объект"
                :max-length="30"
                @mousedown.prevent="checkObjectAvailability"
              />
              <div v-if="showObjectWarning" class="field-warning">
                {{ objectWarningMessage }}
              </div>
            </div>
          </template>
        </div>

        <div class="modal-actions">
          <template v-if="!isEditing">
            <button type="button" class="btn" @click="enterEdit" v-if="canEdit && mode !== 'create'">Редактировать</button>
            <button type="button" class="btn" @click="close">Закрыть</button>
            <button type="button" class="btn danger" v-if="mode === 'self'" @click="onLogout">Выйти</button>
          </template>

          <template v-else>
            <button type="submit" class="btn primary" :disabled="saving">Сохранить</button>
            <button type="button" class="btn" @click="cancelEdit" :disabled="saving">Отмена</button>
          </template>
        </div>

        <div v-if="serverError" class="server-error">{{ serverError }}</div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import profileApi from '@/api/profile.api'
import { getUserRole, getRoleLabel } from '@/utils/auth.utils'
import { useAuthStore } from '@/stores/auth.store'
import { getClientOptions, getOfficeOptions, getRolesOptions } from '@/utils/select.options.utils'
import UIInput from '../common/UI/UIInput.vue'
import UISelect from '../common/UI/UISelect.vue'
import UILabel from '../common/UI/UILabel.vue'
import UIComboBox from '../common/UI/UIComboBox.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  mode: { type: String, default: 'self' }, // 'self', 'user', 'create'
  userId: { type: [Number, String, null], default: null },
  user: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue', 'saved', 'created'])

// Refs для полей ввода
const lastNameInput = ref(null)
const firstNameInput = ref(null)
const middleNameInput = ref(null)
const phoneInput = ref(null)
const emailInput = ref(null)
const roleInput = ref(null)
const organizationInput = ref(null)
const objectInput = ref(null)

const authStore = useAuthStore()

const visible = ref(props.modelValue)
watch(() => props.modelValue, (v) => {
  visible.value = v
  if (v) loadData()
  else resetState()
})
watch(visible, (v) => emit('update:modelValue', v))


const isEditing = ref(props.mode === 'create')
const saving = ref(false)
const serverError = ref(null)

const showObjectWarning = ref(false)
const objectWarningMessage = ref('')

const checkObjectAvailability = (event) => {
  console.log("dwfefewfw", !form.organization)
  if (!form.organization) {
    showObjectWarning.value = true
    objectWarningMessage.value = 'Сначала выберите организацию'
    // Предотвращаем открытие dropdown
    event?.preventDefault()
    event?.stopPropagation()
    return false
  } else {
    showObjectWarning.value = false
    return true
  }
}

const form = reactive({
  id: null,
  firstName: '',
  lastName: '',
  middleName: '',
  email: '',
  phone: '',
  organization: '',
  object: '',
  roleSlug: null,
  roleName: '',
  roleId: null,
  createdAt: null
})

watch(() => form.organization, () => {
  showObjectWarning.value = false
  if (!form.organization) {
    form.object = ''
  }
})

// Опции для выпадающих списков
const roleOptions = getRolesOptions()
const organizationOptions = getClientOptions()
const objectOptions = getOfficeOptions()

const modalTitle = computed(() => {
  if (props.mode === 'self') return 'Мой профиль'
  if (props.mode === 'create') return 'Создание пользователя'
  return 'Профиль пользователя'
})

const canEdit = computed(() => {
  return props.mode === 'self' || props.mode === 'create' || getUserRole() === 'admin'
})

const canEditRole = computed(() => {
  return getUserRole() === 'admin' || props.mode === 'create'
})

const displayRole = computed(() => {
  return getRoleLabel(getUserRole())
})

async function loadData() {
  serverError.value = null

  // Если режим создания, просто сбрасываем форму
  if (props.mode === 'create') {
    resetForm()
    isEditing.value = true
    return
  }

  isEditing.value = false

  try {
    if (props.mode === 'self') {
      if (authStore.user) {
        fillForm(authStore.user)
        return
      }
      const res = await profileApi.getProfile()
      const payload = (res && (res.user || res)) || null
      if (!payload) throw new Error('Не удалось получить профиль')
      fillForm(payload)
    } else {
      if (props.user) {
        fillForm(props.user)
      } else {
        serverError.value = 'Не указан пользователь'
        return
      }
    }
    await nextTick()
  } catch (err) {
    serverError.value = (err && err.message) || 'Ошибка загрузки'
  }
}

function fillForm(userData) {
  if (!userData) return
  
  form.id = userData?.id ?? null
  form.firstName = userData?.first_name || userData?.firstName || userData?.first || ''
  form.lastName = userData?.last_name || userData?.lastName || userData?.last || ''
  form.middleName = userData?.middle_name || userData?.middleName || ''
  form.email = userData?.email || ''
  form.phone = userData?.phone || userData?.phone_number || ''
  form.organization = userData?.organization || userData?.company || ''
  form.object = userData?.object || ''
  form.roleId = userData?.role_id || null
  form.createdAt = userData?.created_at || userData?.createdAt || null
  
  if (userData?.name) {
    form.roleName = userData.name
    form.roleSlug = getRoleSlugFromName(userData.name)
  } else if (form.roleId) {
    form.roleSlug = getRoleSlugFromId(form.roleId)
    form.roleName = getRoleNameFromId(form.roleId)
  }
}

function getRoleSlugFromName(roleName) {
  if (!roleName) return null
  const name = roleName.toString().toLowerCase()
  if (name.includes('админ') || name.includes('admin')) return 'admin'
  if (name.includes('диспетчер') || name.includes('dispatcher')) return 'dispatcher'
  if (name.includes('инженер') || name.includes('engineer')) return 'engineer'
  if (name.includes('клиент') || name.includes('client')) return 'client'
  return null
}

function getRoleSlugFromId(roleId) {
  if (!roleId) return null
  switch (Number(roleId)) {
    case 1: return 'admin'
    case 2: return 'dispatcher'
    case 3: return 'engineer'
    case 4: return 'client'
    default: return null
  }
}

function getRoleNameFromId(roleId) {
  if (!roleId) return null
  switch (Number(roleId)) {
    case 1: return 'Администратор'
    case 2: return 'Диспетчер'
    case 3: return 'Инженер'
    case 4: return 'Клиент'
    default: return null
  }
}

function enterEdit() {
  if (!canEdit.value) return
  isEditing.value = true
  
  // Сбрасываем ошибки при входе в режим редактирования
  nextTick(() => {
    clearAllErrors()
  })
}

function cancelEdit() {
  isEditing.value = false
  if (props.mode === 'create') {
    close()
  } else {
    loadData()
  }
}

// Сброс всех ошибок
function clearAllErrors() {
  const inputs = [
    lastNameInput,
    firstNameInput,
    middleNameInput,
    phoneInput,
    emailInput,
    organizationInput
  ]
  
  if (canEditRole.value) {
    inputs.push(roleInput)
  }
  
  inputs.forEach(input => {
    if (input.value && typeof input.value.clearError === 'function') {
      input.value.clearError()
    }
  })
}

// Валидация всех полей
function validateAll() {
  const inputs = [
    lastNameInput,
    firstNameInput,
    middleNameInput,
    phoneInput,
    emailInput,
    organizationInput
  ]
  
  if (canEditRole.value) {
    inputs.push(roleInput)
  }
  
  let isValid = true
  for (const input of inputs) {
    if (input.value && typeof input.value.validate === 'function') {
      if (!input.value.validate()) {
        isValid = false
      }
    }
  }

  return isValid
}

async function onSave() {
  if (!validateAll()) {
    return
  }
  
  saving.value = true
  serverError.value = null
  
  try {
    const payload = {
      first_name: form.firstName,
      last_name: form.lastName,
      middle_name: form.middleName,
      email: form.email,
      phone: form.phone.replace(/\D/g, ''),
      organization: typeof form.organization === 'object' 
        ? form.organization.name || form.organization.id 
        : form.organization.trim(),
      object: typeof form.object === 'object' 
        ? form.object.name || form.object.id 
        : form.object ? form.object.trim() : ''
    }
    
    if (canEditRole.value && form.roleSlug) {
      payload.role = form.roleSlug
    }

    let res
    
    if (props.mode === 'create') {
      console.log(payload)
      res = await profileApi.createUser(payload)
      emit('created', res)
      close()
    } else if (props.mode === 'self') {
      res = await profileApi.updateProfile(payload)
      const updatedUser = (res && (res.user || res)) || null
      if (updatedUser) {
        authStore.user = updatedUser
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
      isEditing.value = false
      await loadData()
    } else {
      res = await profileApi.updateUserById(form.id, payload)
      isEditing.value = false
      await loadData()
    }
    
    emit('saved', res)
  } catch (err) {
    serverError.value = (err && err.message) || 'Ошибка сохранения'
    
    // Обработка ошибок с сервера
    if (err?.response?.status === 422) {
      const d = err.response.data
      const fieldErrors = d?.errors || d?.validator_fails || {}
      
      // Устанавливаем ошибки в соответствующие поля
      if (fieldErrors.first_name && firstNameInput.value) {
        firstNameInput.value.setError?.(fieldErrors.first_name[0])
      }
      if (fieldErrors.last_name && lastNameInput.value) {
        lastNameInput.value.setError?.(fieldErrors.last_name[0])
      }
      if (fieldErrors.middle_name && middleNameInput.value) {
        middleNameInput.value.setError?.(fieldErrors.middle_name[0])
      }
      if (fieldErrors.email && emailInput.value) {
        emailInput.value.setError?.(fieldErrors.email[0])
      }
      if (fieldErrors.organization && organizationInput.value) {
        organizationInput.value.setError?.(fieldErrors.organization[0])
      }
      if (fieldErrors.phone && phoneInput.value) {
        phoneInput.value.setError?.(fieldErrors.phone[0])
      }
    }
  } finally {
    saving.value = false
  }
}

function resetForm() {
  form.id = null
  form.firstName = ''
  form.lastName = ''
  form.middleName = ''
  form.email = ''
  form.phone = ''
  form.organization = ''
  form.object = ''
  form.roleSlug = null
  form.roleName = ''
  form.roleId = null
  form.createdAt = null
}

function resetState() {
  isEditing.value = props.mode === 'create'
  saving.value = false
  serverError.value = null
  resetForm()
  clearAllErrors()
}

function close() {
  visible.value = false
}

async function onLogout() {
  try {
    await authStore.clearAuthData()
    close()
  } catch (e) {
    console.error('logout error', e)
  }
}
</script>

<style scoped>
.profile-modal-backdrop {
  position: fixed; 
  inset: 0; 
  background: rgba(0,0,0,0.45); 
  display:flex; 
  align-items:center; 
  justify-content:center; 
  z-index:1500;
}
.profile-modal { 
  width: 50%; 
  max-height: 70%; 
  min-height: 40%; 
  background: #fff; 
  border-radius:8px; 
  padding:16px;  
  overflow:none; 
  box-shadow:0 20px 50px rgba(0,0,0,.2); 
}
.modal-header { 
  display:flex; 
  justify-content:space-between; 
  align-items:center; 
  margin-bottom:8px; 
}
.modal-title { 
  font-size:18px; 
  margin:0; 
}
.close-btn { 
  background:transparent; 
  border:none; 
  font-size:18px; 
  cursor:pointer; 
}
.form-grid { 
  display:grid; 
  grid-template-columns: 1fr 1fr; 
  gap:12px; 
}
.form-row { 
  display:flex; 
  flex-direction:column; 
}
.form-row :deep(.ui-input),
.form-row :deep(.ui-select-custom),
.form-row :deep(.ui-combobox-input) {
  width: 100%;
}

.form-row.has-error :deep(.ui-input),
.form-row.has-error :deep(.ui-select-custom),
.form-row.has-error :deep(.ui-combobox-input) {
  border-color: #b00020;
}

.modal-actions { 
  margin-top: 12px; 
  display:flex; 
  gap:8px; 
  justify-content:flex-end; 
}
.field-error { 
  color:#b00020; 
  font-size:12px; 
  margin-top:4px; 
}
.server-error { 
  color:#b00020; 
  margin-top:10px; 
}
.btn { 
  padding:8px 12px; 
  border-radius:6px; 
  cursor:pointer; 
  border:1px solid rgba(0,0,0,0.08) 
}
.btn.primary { 
  background:#2563eb; 
  color:#fff; 
  border:none; 
}
.btn.danger { 
  background:#ef4444; 
  color:#fff; 
  border:none; 
}

/* Стили для UILabel в режиме просмотра */
:deep(.ui-label-content) {
  min-height: 30px;
}

.field-warning {
  color: #2563eb;
  font-size: 12px;
  margin-top: 4px;
}
</style>