<!-- src/components/common/UI/UserProfileModal.vue (исправлённая версия) -->
<template>
  <div v-if="visible" class="profile-modal-backdrop" @keydown.esc="close" tabindex="-1">
    <div class="profile-modal" role="dialog" aria-modal="true" :aria-label="modalTitle" ref="modalRoot">
      <header class="modal-header">
        <h2 class="modal-title">{{ modalTitle }}</h2>
        <button class="close-btn" @click="close" aria-label="Закрыть">✕</button>
      </header>

      <form class="modal-body" @submit.prevent="onSave" novalidate>
        <div class="form-grid">
          <div class="form-row">
            <label for="lastName">Фамилия <span class="required" v-if="required">*</span></label>
            <input id="lastName" v-model="form.lastName" :readonly="!isEditing" />
            <div class="field-error" v-if="errors.lastName">{{ errors.lastName }}</div>
          </div>

          <div class="form-row">
            <label for="firstName">Имя <span class="required" v-if="required">*</span></label>
            <input id="firstName" v-model="form.firstName" :readonly="!isEditing" />
            <div class="field-error" v-if="errors.firstName">{{ errors.firstName }}</div>
          </div>

          <div class="form-row">
            <label for="middleName">Отчество</label>
            <input id="middleName" v-model="form.middleName" :readonly="!isEditing" />
          </div>

          <div class="form-row">
            <label for="email">Email <span class="required" v-if="required">*</span></label>
            <input id="email" type="email" v-model="form.email" :readonly="!isEditing" />
            <div class="field-error" v-if="errors.email">{{ errors.email }}</div>
          </div>

          <div class="form-row">
            <label for="phone">Телефон</label>
            <input id="phone" v-model="form.phone" :readonly="!isEditing" />
          </div>

          <div class="form-row">
            <label>Роль</label>
            <input :value="displayRole" readonly />
          </div>

          <!-- Возможность менять роль при условии что ты администратор -->
          <div v-if="isEditing && canEditRole" class="form-row">
            <label for="roleSelect">Изменить роль</label>
            <select id="roleSelect" v-model="form.roleSlug">
              <option value="admin">Администратор</option>
              <option value="dispatcher">Диспетчер</option>
              <option value="engineer">Инженер</option>
              <option value="client">Клиент</option>
            </select>
          </div>
        </div>

        <div class="modal-actions">
          <template v-if="!isEditing">
            <button type="button" class="btn" @click="enterEdit" v-if="canEdit">Редактировать</button>
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
import { useAuthStore } from '@/stores/auth.store'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  mode: { type: String, default: 'self' },
  userId: { type: [Number, String, null], default: null },
  user: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue', 'saved'])

const authStore = useAuthStore()

const visible = ref(props.modelValue)
watch(() => props.modelValue, (v) => {
  visible.value = v
  if (v) loadData()
  else resetState()
})
watch(visible, (v) => emit('update:modelValue', v))

const isEditing = ref(false)
const saving = ref(false)
const serverError = ref(null)
const errors = reactive({ firstName: null, lastName: null, email: null })

const form = reactive({
  id: null,
  firstName: '',
  lastName: '',
  middleName: '',
  email: '',
  phone: '',
  roleSlug: null,
  roleName: '',
  createdAt: null
})

const required = true

const modalTitle = computed(() => (props.mode === 'self' ? 'Мой профиль' : `Профиль пользователя ${form.firstName || ''} ${form.lastName || ''}`))

const canEdit = computed(() => {
  if (props.mode === 'self') return true
  return authStore.userRole === 'admin'
})
const canEditRole = computed(() => authStore.userRole === 'admin')

const displayRole = computed(() => {
  if (!form.roleSlug && form.roleName) return form.roleName
  const mapping = { admin: 'Администратор', dispatcher: 'Диспетчер', engineer: 'Инженер', client: 'Клиент' }
  return mapping[form.roleSlug] || form.roleName || ''
})

async function loadData() {
  serverError.value = null
  clearErrors()
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
      } else if (props.userId) {
        const res = await profileApi.getUserById(props.userId)
        const payload = (res && (res.user || res)) || null
        if (!payload) {
          serverError.value = 'Пользователь не найден'
          return
        }
        fillForm(payload)
      } else {
        serverError.value = 'Не указан userId'
        return
      }
    }
    await nextTick()
  } catch (err) {
    serverError.value = (err && err.message) || 'Ошибка загрузки'
  }
}

function fillForm(userData) {
  form.id = userData?.id ?? null

  form.firstName = (userData?.firstName ?? userData?.first_name ?? userData?.first) || ''
  form.lastName = (userData?.lastName ?? userData?.last_name ?? userData?.last) || ''
  form.middleName = (userData?.middleName ?? userData?.middle_name) || ''
  form.email = (userData?.email ?? '') // здесь только ??
  form.phone = (userData?.phone ?? userData?.phone_number ?? '') 
  form.roleSlug = normalizeRole(userData?.role)
  form.roleName = (typeof userData?.role === 'object' ? userData.role.name : userData?.role) || ''
  form.createdAt = userData?.createdAt ?? userData?.created_at ?? null
}

function normalizeRole(role) {
  if (!role) return null
  if (typeof role === 'string') return role.toLowerCase()
  if (typeof role === 'object') {
    const name = (role.name || '').toString().toLowerCase()
    if (name.includes('админ') || name.includes('admin')) return 'admin'
    if (name.includes('диспетчер') || name.includes('dispatcher')) return 'dispatcher'
    if (name.includes('инженер') || name.includes('engineer')) return 'engineer'
    if (name.includes('клиент') || name.includes('client')) return 'client'
  }
  return null
}

function clearErrors() {
  errors.firstName = errors.lastName = errors.email = null
}

function validate() {
  clearErrors()
  let ok = true
  if (!form.firstName || !form.firstName.trim()) {
    errors.firstName = 'Обязательное поле'
    ok = false
  }
  if (!form.lastName || !form.lastName.trim()) {
    errors.lastName = 'Обязательное поле'
    ok = false
  }
  if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Неверный email'
    ok = false
  }
  return ok
}

function enterEdit() {
  if (!canEdit.value) return
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
  clearErrors()
  loadData()
}

async function onSave() {
  if (!validate()) return
  saving.value = true
  serverError.value = null
  try {
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      middleName: form.middleName,
      email: form.email,
      phone: form.phone
    }
    if (canEditRole.value && form.roleSlug) {
      payload.role = form.roleSlug
    }

    let res
    if (props.mode === 'self') {
      res = await profileApi.updateProfile(payload)
      const updatedUser = (res && (res.user || res)) || null
      if (updatedUser) {
        authStore.user = updatedUser
        try {
          localStorage.setItem('user', JSON.stringify(updatedUser))
        } catch (e) {
          console.warn('localStorage set error', e)
        }
      }
    } else {
      res = await profileApi.updateUserById(form.id, payload)
    }

    isEditing.value = false
    emit('saved', res)
  } catch (err) {
    serverError.value = (err && err.message) || 'Ошибка сохранения'
    if (err?.response?.status === 422) {
      const d = err.response.data
      const fieldErrors = d?.errors || d?.validator_fails || {}
      errors.firstName = (fieldErrors.first_name && fieldErrors.first_name[0]) || errors.firstName
      errors.lastName = (fieldErrors.last_name && fieldErrors.last_name[0]) || errors.lastName
      errors.email = (fieldErrors.email && fieldErrors.email[0]) || errors.email
    }
  } finally {
    saving.value = false
  }
}

function resetState() {
  isEditing.value = false
  saving.value = false
  serverError.value = null
  clearErrors()
  form.id = null
  form.firstName = form.lastName = form.middleName = form.email = form.phone = form.roleSlug = form.roleName = ''
}

function close() {
  visible.value = false
}

async function onLogout() {
  try {
    await authStore.logout()
    close()
  } catch (e) {
    console.error('logout error', e)
  }
}
</script>

<style scoped>
/* (тот же CSS, что и у вас) */
.profile-modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; z-index:2000;
}
.profile-modal { width: 680px; background: #fff; border-radius:8px; padding:16px; max-height:90vh; overflow:auto; box-shadow:0 20px 50px rgba(0,0,0,.2); }
.modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
.modal-title { font-size:18px; margin:0; }
.close-btn { background:transparent; border:none; font-size:18px; cursor:pointer; }
.form-grid { display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
.form-row { display:flex; flex-direction:column; }
.form-row input, .form-row select { padding:8px; border:1px solid #d1d5db; border-radius:6px; }
.modal-actions { margin-top:12px; display:flex; gap:8px; justify-content:flex-end; }
.field-error { color:#b00020; font-size:12px; margin-top:4px; }
.server-error { color:#b00020; margin-top:10px; }
.btn { padding:8px 12px; border-radius:6px; cursor:pointer; border:1px solid rgba(0,0,0,0.08) }
.btn.primary { background:#2563eb; color:#fff; border:none; }
.btn.danger { background:#ef4444; color:#fff; border:none; }
.required { color:#b00020; }
</style>
